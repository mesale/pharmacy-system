import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    barcode: string | null;
    selling_price: string;
    total_stock: number;
    requires_prescription: boolean;
    is_controlled: boolean;
    stock_batches: { expiry_date: string }[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface Props {
    auth: any;
    products: Product[];
    flash: { success?: string };
}

export default function Index({ auth, products, flash }: Props) {
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
    // Simple logic for MVP (0% tax)
    const tax = 0; 
    const total = subtotal + tax;
    const changeDue = paymentMethod === 'cash' && tenderedCash ? Math.max(0, parseFloat(tenderedCash) - total) : 0;

    // Cart actions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.total_stock) return prev; // Cannot exceed stock
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, Math.min(item.quantity + delta, item.product.total_stock));
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const clearCart = () => setCart([]);

    // Checkout
    const handleCheckout = () => {
        if (cart.length === 0) return;
        
        setIsProcessing(true);
        router.post(route('pos.checkout'), {
            items: cart.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
                unit_price: i.product.selling_price
            })),
            payment_method: paymentMethod,
            tendered_amount: paymentMethod === 'cash' ? (parseFloat(tenderedCash) || total) : total
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

    const daysUntilExpiry = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">POS & Dispensary</h2>}>
            <Head title="POS terminal" />
            
            {/* Flash Message */}
            {flash.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                    <span className="block sm:inline">{flash.success}</span>
                </div>
            )}

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
                    
                    {/* LEFT COLUMN: Search & Catalog */}
                    <div className="w-full lg:w-7/12 flex flex-col bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="p-4 border-b">
                            <input 
                                type="text" 
                                placeholder="Scan barcode or type name..." 
                                className="w-full rounded-md border-gray-300 shadow-sm font-mono text-lg p-3"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {filteredProducts.map(product => {
                                // Find nearest expiry to show alert badge
                                const nearestBatch = product.stock_batches.length > 0 ? product.stock_batches[0] : null;
                                const nearestExpiryDays = nearestBatch ? daysUntilExpiry(nearestBatch.expiry_date) : 999;
                                
                                return (
                                    <div key={product.id} className="bg-white p-4 rounded shadow-sm border hover:border-indigo-500 cursor-pointer flex justify-between items-center transition-colors" onClick={() => addToCart(product)}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">{product.name}</h3>
                                                {nearestExpiryDays <= 30 && <span className="text-xs bg-red-100 text-red-800 px-1.5 rounded font-bold">FEFO {nearestExpiryDays}d</span>}
                                                {product.is_controlled && <span className="text-xs bg-purple-100 text-purple-800 px-1.5 rounded font-bold">CTRL</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 flex gap-4">
                                                <span>Stock: <span className="font-bold text-green-600">{product.total_stock}</span></span>
                                                <span>Barcode: <span className="font-mono">{product.barcode || 'N/A'}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-indigo-600">${product.selling_price}</div>
                                            <Button variant="outline" size="sm" className="mt-1">Add</Button>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <div className="text-center text-gray-400 py-12">No items found matching "{search}"</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Cart & Checkout */}
                    <div className="w-full lg:w-5/12 flex flex-col bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Current Order</h3>
                            <button onClick={clearCart} className="text-red-600 text-sm font-semibold hover:underline">Clear</button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex justify-between items-center border-b pb-3">
                                    <div className="flex-1 pr-2">
                                        <div className="font-bold text-gray-900 truncate">{item.product.name}</div>
                                        <div className="text-sm text-gray-500">${item.product.selling_price} ea</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border rounded">
                                            <button onClick={() => updateQty(item.product.id, -1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                                            <span className="w-8 text-center font-mono font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.product.id, 1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                                        </div>
                                        <div className="w-16 text-right font-bold text-gray-900">
                                            ${(parseFloat(item.product.selling_price) * item.quantity).toFixed(2)}
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="text-center text-gray-400 py-12">Cart is empty. Scan or select items.</div>
                            )}
                        </div>

                        {/* Payment & Totals Footer */}
                        <div className="p-4 bg-gray-50 border-t">
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t">
                                    <span>Total Payable</span>
                                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')}>CASH</Button>
                                <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')}>CARD</Button>
                                <Button variant={paymentMethod === 'insurance' ? 'default' : 'outline'} onClick={() => setPaymentMethod('insurance')}>INSURANCE</Button>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded border">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tendered Cash</label>
                                        <input 
                                            type="number" 
                                            className="w-full border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 p-0 text-xl font-mono" 
                                            placeholder={total.toFixed(2)}
                                            value={tenderedCash}
                                            onChange={e => setTenderedCash(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Change Due</label>
                                        <div className="text-xl font-bold text-green-600 font-mono">${changeDue.toFixed(2)}</div>
                                    </div>
                                </div>
                            )}

                            <Button 
                                className="w-full h-12 text-lg font-bold" 
                                size="lg" 
                                disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && parseFloat(tenderedCash || total.toString()) < total)}
                                onClick={handleCheckout}
                            >
                                {isProcessing ? 'PROCESSING...' : 'COMPLETE SALE'}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
