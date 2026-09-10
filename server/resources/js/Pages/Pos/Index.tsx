import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Product {
    id: number;
    name: string;
    barcode: string | null;
    selling_price: string;
    total_stock: number;
    requires_prescription: boolean;
    is_controlled: boolean;
    sellable_batches: { expiry_date: string; quantity: number }[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface Props {
    auth: any;
    products: Product[];
    flash?: { success?: string };
}

export default function Index({ auth, products, flash = {} }: Props) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'insurance'>('cash');
    const [tenderedCash, setTenderedCash] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Derived state
    const filteredProducts = useMemo(() => {
        if (!search) return products;
        const lowerSearch = search.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerSearch) || 
            (p.barcode && p.barcode.includes(lowerSearch))
        );
    }, [products, search]);

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.selling_price) * item.quantity), 0);
    const tax = 0; 
    const total = subtotal + tax;
    const changeDue = paymentMethod === 'cash' && tenderedCash ? Math.max(0, parseFloat(tenderedCash) - total) : 0;

    // Cart actions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.total_stock) return prev;
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
        setSearch(''); // Clear search after adding
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === id) {
                const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.product.total_stock));
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.product.id !== id));
    };

    const checkout = () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        const items = cart.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.product.selling_price,
        }));

        router.post(route('pos.checkout'), {
            items,
            payment_method: paymentMethod,
            total_amount: total,
            tendered_amount: paymentMethod === 'cash' ? (tenderedCash ? tenderedCash : total) : total,
            change_due: changeDue,
        }, {
            onSuccess: () => {
                setCart([]);
                setTenderedCash('');
                setIsProcessing(false);
            },
            onError: () => {
                setIsProcessing(false);
            }
        });
    };

    const currency = (val: string | number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    };

    return (
        <AdminLayout>
            <Head title="Point of Sale" />

            {flash?.success && (
                <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{flash.success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 mt-6">
                {/* Left Side: Product Search & List */}
                <div className="lg:col-span-8 flex flex-col gap-4 h-[calc(100vh-100px)]">
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle>Point of Sale</CardTitle>
                            <CardDescription>Search for products and add them to the customer's cart.</CardDescription>
                            <div className="relative mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Scan barcode or search product name..." 
                                    className="pl-8 text-lg py-6"
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => {
                                        const outOfStock = product.total_stock <= 0;
                                        return (
                                            <TableRow key={product.id} className={outOfStock ? "opacity-50" : ""}>
                                                <TableCell>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                                                        <span className="font-mono">{product.barcode || 'N/A'}</span>
                                                        {product.requires_prescription && <Badge variant="secondary" className="text-[10px] py-0 px-1">Rx</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{currency(product.selling_price)}</TableCell>
                                                <TableCell className="text-right font-bold">
                                                    <span className={outOfStock ? "text-red-500" : "text-emerald-600"}>
                                                        {product.total_stock}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm"
                                                        disabled={outOfStock}
                                                        onClick={() => addToCart(product)}
                                                    >
                                                        Add
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No products found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Cart & Checkout */}
                <div className="lg:col-span-4 h-[calc(100vh-100px)]">
                    <Card className="h-full flex flex-col shadow-lg border-primary/20">
                        <CardHeader className="bg-muted/50 pb-4 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Current Order
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-auto p-0">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center gap-2">
                                    <ShoppingCart className="h-12 w-12 opacity-20" />
                                    <p>The cart is currently empty.</p>
                                    <p className="text-sm">Search for products on the left to begin.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-sm line-clamp-2">{item.product.name}</div>
                                                    <div className="text-xs text-muted-foreground">{currency(item.product.selling_price)} each</div>
                                                </div>
                                                <div className="font-bold text-sm">
                                                    {currency(parseFloat(item.product.selling_price) * item.quantity)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border rounded-md overflow-hidden bg-background">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.product.id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <div className="w-10 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.product.id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex-col gap-4 border-t bg-muted/20 p-4">
                            {/* Warnings */}
                            {cart.some(i => i.product.requires_prescription) && (
                                <div className="w-full flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                                    <ShieldAlert className="h-4 w-4" />
                                    Prescription required for some items.
                                </div>
                            )}

                            {/* Totals */}
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{currency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (0%)</span>
                                    <span>{currency(tax)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-bold text-primary">{currency(total)}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="w-full grid grid-cols-2 gap-2">
                                <Button 
                                    type="button"
                                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                    className="w-full"
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <Banknote className="mr-2 h-4 w-4" /> Cash
                                </Button>
                                <Button 
                                    type="button"
                                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                    className="w-full"
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" /> Card
                                </Button>
                            </div>

                            {paymentMethod === 'cash' && cart.length > 0 && (
                                <div className="w-full space-y-2 pt-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount Tendered</label>
                                    <div className="flex flex-col gap-2">
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            min={total}
                                            placeholder="Exact Change (Default)" 
                                            value={tenderedCash} 
                                            onChange={e => setTenderedCash(e.target.value)} 
                                            className="text-lg font-mono"
                                        />
                                        <div className="grid grid-cols-4 gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setTenderedCash(total.toString())}>Exact</Button>
                                            <Button variant="outline" size="sm" onClick={() => setTenderedCash('10')}>$10</Button>
                                            <Button variant="outline" size="sm" onClick={() => setTenderedCash('20')}>$20</Button>
                                            <Button variant="outline" size="sm" onClick={() => setTenderedCash('50')}>$50</Button>
                                        </div>
                                    </div>
                                    {tenderedCash && parseFloat(tenderedCash) >= Number(total.toFixed(2)) && (
                                        <div className="flex justify-between text-sm font-bold bg-emerald-50 text-emerald-700 p-2 rounded">
                                            <span>Change Due:</span>
                                            <span>{currency(changeDue)}</span>
                                        </div>
                                    )}
                                    {tenderedCash && parseFloat(tenderedCash) < Number(total.toFixed(2)) && (
                                        <div className="text-sm font-bold text-destructive p-2">
                                            Insufficient amount! Need {currency(total - parseFloat(tenderedCash))} more.
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button 
                                className="w-full h-14 text-lg mt-2" 
                                size="lg"
                                disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && tenderedCash !== '' && parseFloat(tenderedCash) < Number(total.toFixed(2)))}
                                onClick={checkout}
                            >
                                {isProcessing ? 'Processing...' : 'Complete Payment'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
