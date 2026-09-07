import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';

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
            // No unit_price is sent: the server always prices from the
            // catalogue, so sending one here would only be misleading.
            items: cart.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
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
        <AdminLayout>
            <Head title="POS terminal" />
            
            {/* Flash Message */}
            {flash.success && (
                <div className="bg-status-success-bg border border-status-success text-status-success px-4 py-3 rounded relative text-center mb-6" role="alert">
                    <span className="block sm:inline font-bold">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-88px)] gap-gap-md pb-6">
                
                {/* LEFT COLUMN: Search & Catalog */}
                <div className="w-full lg:w-7/12 flex flex-col h-[50vh] lg:h-auto bg-surface-raised border border-border-subtle overflow-hidden">
                    <div className="p-gap-md border-b border-border-subtle bg-surface-base">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">search</span>
                            <input 
                                type="text" 
                                placeholder="Scan barcode or type name..." 
                                className="w-full bg-surface-overlay border border-border-strong text-text-primary placeholder:text-text-muted font-mono text-lg py-3 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-gap-md space-y-gap-sm bg-surface-base">
                        {filteredProducts.map(product => {
                            // Find nearest expiry to show alert badge
                            const nearestBatch = product.sellable_batches.length > 0 ? product.sellable_batches[0] : null;
                            const nearestExpiryDays = nearestBatch ? daysUntilExpiry(nearestBatch.expiry_date) : 999;
                            
                            return (
                                <div key={product.id} className="bg-surface-raised p-gap-md border border-border-subtle hover:border-primary cursor-pointer flex justify-between items-center transition-colors" onClick={() => addToCart(product)}>
                                    <div>
                                        <div className="flex items-center gap-gap-xs mb-1">
                                            <h3 className="font-bold text-text-primary text-lg">{product.name}</h3>
                                            {nearestExpiryDays <= 30 && <span className="text-xs bg-status-critical-bg text-status-critical px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-status-critical">FEFO {nearestExpiryDays}d</span>}
                                            {product.is_controlled && <span className="text-xs bg-status-warning-bg text-status-warning px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-status-warning">CTRL</span>}
                                        </div>
                                        <div className="text-sm text-text-muted flex gap-gap-md">
                                            <span>Stock: <span className="font-bold text-status-success">{product.total_stock}</span></span>
                                            <span>Barcode: <span className="font-mono text-text-secondary">{product.barcode || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-2xl text-primary">${product.selling_price}</div>
                                        <div className="text-xs text-primary font-bold mt-1 uppercase tracking-wider flex items-center justify-end gap-1"><span className="material-symbols-outlined text-sm">add_shopping_cart</span> Add</div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="text-center text-text-muted py-12 flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                <span>No items found matching "{search}"</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Cart & Checkout */}
                <div className="w-full lg:w-5/12 flex flex-col bg-surface-raised border border-border-subtle overflow-hidden">
                    <div className="p-gap-md border-b border-border-subtle bg-surface-base flex justify-between items-center">
                        <div className="flex items-center gap-gap-xs">
                            <span className="material-symbols-outlined text-primary">shopping_cart</span>
                            <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">Current Order</h3>
                        </div>
                        <button onClick={clearCart} className="text-status-critical text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">delete</span> Clear
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-gap-md space-y-gap-sm bg-surface-base">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-border-subtle pb-gap-sm">
                                <div className="flex-1 pr-2">
                                    <div className="font-bold text-text-primary text-lg truncate">{item.product.name}</div>
                                    <div className="text-sm text-text-muted">${item.product.selling_price} ea</div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-gap-sm sm:gap-gap-md mt-2 sm:mt-0">
                                    <div className="flex items-center border border-border-strong bg-surface-overlay">
                                        <button onClick={() => updateQty(item.product.id, -1)} className="px-2 py-1 text-text-primary hover:bg-surface-container-high transition-colors font-bold text-lg">-</button>
                                        <span className="w-8 text-center font-mono font-bold text-text-primary border-x border-border-strong bg-surface-base">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.product.id, 1)} className="px-2 py-1 text-text-primary hover:bg-surface-container-high transition-colors font-bold text-lg">+</button>
                                    </div>
                                    <div className="w-20 text-right font-bold text-text-primary text-lg">
                                        ${(parseFloat(item.product.selling_price) * item.quantity).toFixed(2)}
                                    </div>
                                    <button onClick={() => removeFromCart(item.product.id)} className="text-text-muted hover:text-status-critical transition-colors">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center text-text-muted py-12 flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-2">shopping_basket</span>
                                <span>Cart is empty. Scan or select items.</span>
                            </div>
                        )}
                    </div>

                    {/* Payment & Totals Footer */}
                    <div className="p-gap-md bg-surface-raised border-t border-border-subtle">
                        <div className="space-y-2 mb-gap-md text-sm">
                            <div className="flex justify-between text-text-secondary">
                                <span className="uppercase tracking-wider">Subtotal</span>
                                <span className="font-mono">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span className="uppercase tracking-wider">Tax</span>
                                <span className="font-mono">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-2xl text-text-primary pt-2 border-t border-border-strong mt-2">
                                <span className="uppercase tracking-wider">Total Payable</span>
                                <span className="text-primary font-mono">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-gap-md">
                            <button 
                                className={`py-2 px-4 text-center font-bold uppercase tracking-wider text-sm border transition-colors ${paymentMethod === 'cash' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-base text-text-secondary border-border-strong hover:border-primary'}`}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                CASH
                            </button>
                            <button 
                                className={`py-2 px-4 text-center font-bold uppercase tracking-wider text-sm border transition-colors ${paymentMethod === 'card' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-base text-text-secondary border-border-strong hover:border-primary'}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                CARD
                            </button>
                            <button 
                                className={`py-2 px-4 text-center font-bold uppercase tracking-wider text-sm border transition-colors ${paymentMethod === 'insurance' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-base text-text-secondary border-border-strong hover:border-primary'}`}
                                onClick={() => setPaymentMethod('insurance')}
                            >
                                INSURANCE
                            </button>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-gap-md mb-gap-md p-gap-sm bg-surface-base border border-border-strong">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Tendered Cash</label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xl">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent border-0 border-b-2 border-border-strong focus:ring-0 focus:border-primary px-0 pl-6 text-2xl font-mono text-text-primary placeholder:text-text-muted" 
                                            placeholder={total.toFixed(2)}
                                            value={tenderedCash}
                                            onChange={e => setTenderedCash(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 text-right">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Change Due</label>
                                    <div className="text-3xl font-bold text-status-success font-mono">${changeDue.toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        <button 
                            className={`w-full py-4 text-xl font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${cart.length === 0 || isProcessing || (paymentMethod === 'cash' && parseFloat(tenderedCash || total.toString()) < total) ? 'bg-surface-overlay text-text-muted cursor-not-allowed border border-border-subtle' : 'bg-status-success text-black hover:bg-green-400'}`}
                            disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && parseFloat(tenderedCash || total.toString()) < total)}
                            onClick={handleCheckout}
                        >
                            <span className="material-symbols-outlined">task_alt</span>
                            {isProcessing ? 'PROCESSING...' : 'COMPLETE SALE'}
                        </button>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

