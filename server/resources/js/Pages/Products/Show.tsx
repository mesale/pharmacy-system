import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

interface StockBatch {
    id: number;
    batch_number: string;
    // Omitted by the server for non-admins: cost reveals the pharmacy's margin.
    cost_price?: string;
    quantity: number;
    expiry_date: string;
    received_date: string;
    supplier: { id: number; name: string } | null;
}

interface Product {
    id: number;
    name: string;
    barcode: string | null;
    unit: string;
    selling_price: string;
    reorder_level: number;
    requires_prescription: boolean;
    is_controlled: boolean;
    category: { id: number; name: string } | null;
    stock_batches: StockBatch[];
}

interface Supplier {
    id: number;
    name: string;
}

interface Props {
    auth: any;
    product: Product;
    suppliers: Supplier[];
    canViewCost: boolean;
}

const INPUT_CLASS =
    'mt-1 block w-full bg-white shadow-sm rounded-lg border border-gray-300 text-gray-900 ' +
    'placeholder:text-gray-500 focus:border-emerald-600 focus:ring-1 focus:ring-primary py-2 px-3 text-sm';
const LABEL_CLASS =
    'block text-xs font-bold text-gray-600 uppercase tracking-wider';
const ERROR_CLASS = 'text-red-600 text-xs mt-1 font-bold';

/** Today as YYYY-MM-DD, to compare against the date-only expiry column. */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Mirrors the server's `sellableBatches` scope (`expiry_date >= today`), so a
 * batch expiring today still counts. Comparing the date strings avoids the
 * off-by-one that a millisecond diff introduces for same-day expiries.
 */
const isExpired = (expiryDate: string) => expiryDate.slice(0, 10) < today();

export default function Show({ auth, product, suppliers, canViewCost }: Props) {
    const [showBatchForm, setShowBatchForm] = useState(false);
    const isAdmin = auth.user?.roles?.includes('admin');

    // Only sellable units are "on hand". Summing every batch counted expired and
    // emptied stock as available, so this figure contradicted the product list,
    // which uses the server-side sellable total.
    const sellableBatches = product.stock_batches.filter(
        (b) => b.quantity > 0 && !isExpired(b.expiry_date),
    );
    const totalStock = sellableBatches.reduce((sum, b) => sum + b.quantity, 0);

    // The batch FEFO will actually dispense from next: earliest-expiring batch
    // that still has stock and has not expired. Previously the first row of the
    // table was labelled the priority regardless, which pointed at an expired
    // or empty batch whenever one sorted first.
    const priorityBatchId = sellableBatches[0]?.id;

    const isLowStock = totalStock <= product.reorder_level;
    // A reorder level of 0 would make the bar's denominator 0 and the width NaN.
    const stockBarWidth = product.reorder_level > 0
        ? Math.min((totalStock / (product.reorder_level * 3)) * 100, 100)
        : totalStock > 0 ? 100 : 0;

    const columnCount = canViewCost ? 8 : 6;

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_number: '',
        cost_price: '',
        quantity: '',
        expiry_date: '',
        received_date: today(),
        supplier_id: '',
    });

    const submitBatch = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('batches.store', product.id), {
            onSuccess: () => { setShowBatchForm(false); reset(); },
        });
    };

    const [adjustingBatch, setAdjustingBatch] = useState<StockBatch | null>(null);
    const adjustForm = useForm({
        quantity_change: '',
        reason: 'damaged',
        notes: '',
    });

    const openAdjustForm = (batch: StockBatch) => {
        setAdjustingBatch(batch);
        adjustForm.reset();
    };

    const submitAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingBatch) return;
        adjustForm.post(route('adjustments.store', adjustingBatch.id), {
            onSuccess: () => setAdjustingBatch(null),
        });
    };

    const daysUntilExpiry = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <AdminLayout>
            <Head title={product.name} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-gap-lg">

                    {/* Product Info Card */}
                    <div className="bg-transparent">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {product.requires_prescription && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-status-info-bg text-status-info border border-status-info">Rx Required</span>
                                    )}
                                    {product.is_controlled && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">Controlled</span>
                                    )}
                                    {product.category && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-gray-100 rounded text-gray-600 border border-gray-200">{product.category.name}</span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Barcode: <span className="font-mono">{product.barcode || 'N/A'}</span> · Unit: {product.unit}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Selling Price</div>
                                <div className="text-3xl font-mono font-bold tracking-tight text-emerald-600">${product.selling_price}</div>
                            </div>
                        </div>

                        {/* Stock Summary Bar */}
                        <div className="mt-6 bg-gray-50 rounded border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Inventory Health</span>
                                <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                    {totalStock} sellable units on hand (Reorder at {product.reorder_level})
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
                                <div
                                    className={`h-full transition-all ${isLowStock ? 'bg-status-critical' : 'bg-status-success'}`}
                                    style={{ width: `${stockBarWidth}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* FEFO Batch Table */}
                    <div className="bg-transparent">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <h3 className="text-lg font-medium text-gray-900 uppercase tracking-wider">FEFO Batch Ledger</h3>
                            {isAdmin && (
                                <Button onClick={() => setShowBatchForm(!showBatchForm)} variant={showBatchForm ? 'outline' : 'default'}>
                                    {showBatchForm ? 'Cancel' : 'Receive New Batch'}
                                </Button>
                            )}
                        </div>

                        {showBatchForm && (
                            <form onSubmit={submitBatch} className="mb-6 p-4 bg-gray-50 rounded border border-emerald-600">
                                <h4 className="text-md font-bold text-gray-900 uppercase tracking-wider mb-4">Batch Intake</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className={LABEL_CLASS}>Batch Number *</label>
                                        <input type="text" className={INPUT_CLASS} value={data.batch_number} onChange={e => setData('batch_number', e.target.value)} required />
                                        {errors.batch_number && <p className={ERROR_CLASS}>{errors.batch_number}</p>}
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Supplier</label>
                                        <select className={INPUT_CLASS} value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)}>
                                            <option value="">Select supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {errors.supplier_id && <p className={ERROR_CLASS}>{errors.supplier_id}</p>}
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Cost Price *</label>
                                        <input type="number" step="0.01" min="0" className={INPUT_CLASS} value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required />
                                        {errors.cost_price && <p className={ERROR_CLASS}>{errors.cost_price}</p>}
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Quantity *</label>
                                        <input type="number" min="1" className={INPUT_CLASS} value={data.quantity} onChange={e => setData('quantity', e.target.value)} required />
                                        {errors.quantity && <p className={ERROR_CLASS}>{errors.quantity}</p>}
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Expiry Date *</label>
                                        <input type="date" className={INPUT_CLASS} value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} required />
                                        {errors.expiry_date && <p className={ERROR_CLASS}>{errors.expiry_date}</p>}
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Received Date *</label>
                                        <input type="date" className={INPUT_CLASS} value={data.received_date} onChange={e => setData('received_date', e.target.value)} required />
                                        {errors.received_date && <p className={ERROR_CLASS}>{errors.received_date}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={processing}>Save Batch</Button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto border border-gray-200 bg-white shadow-sm rounded-lg">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-gray-100 rounded">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">FEFO Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                                        {canViewCost && <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Cost</th>}
                                        {canViewCost && <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Margin</th>}
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-white shadow-sm rounded-lg">
                                    {product.stock_batches.map((batch, index) => {
                                        const days = daysUntilExpiry(batch.expiry_date);
                                        const expired = isExpired(batch.expiry_date);
                                        const cost = parseFloat(batch.cost_price ?? '0');
                                        const margin = cost > 0
                                            ? ((parseFloat(product.selling_price) - cost) / cost * 100).toFixed(1)
                                            : '0.0';
                                        const isPriority = batch.id === priorityBatchId;
                                        const depleted = batch.quantity <= 0;

                                        return (
                                            <tr
                                                key={batch.id}
                                                className={`${isPriority ? 'bg-yellow-50/30' : ''} ${expired || depleted ? 'opacity-60' : ''} hover:bg-gray-50 rounded transition-colors`}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-1.5 h-6 ${expired ? 'bg-status-critical' : days <= 30 ? 'bg-status-critical' : days <= 90 ? 'bg-status-warning' : 'bg-status-success'}`}></span>
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-900 font-mono">#{batch.batch_number}</span>
                                                            <span className="block text-xs text-gray-500 uppercase tracking-wider">
                                                                {isPriority
                                                                    ? 'Priority dispense'
                                                                    : expired
                                                                        ? 'Expired — write off'
                                                                        : depleted
                                                                            ? 'Depleted'
                                                                            : `${index + 1}. Next in queue`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {batch.supplier?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">{batch.quantity}</td>
                                                {canViewCost && <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">${batch.cost_price}</td>}
                                                {canViewCost && <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 font-bold">+{margin}%</td>}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <div>
                                                        <span className={`font-bold ${expired || days <= 30 ? 'text-red-600' : days <= 90 ? 'text-yellow-600' : 'text-gray-900'}`}>
                                                            {new Date(batch.expiry_date).toLocaleDateString()}
                                                        </span>
                                                        <span className={`block text-xs font-bold uppercase tracking-wider ${expired || days <= 30 ? 'text-red-600' : days <= 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            {expired ? 'Expired' : `${days} days`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    {expired && <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">Expired</span>}
                                                    {!expired && days <= 30 && <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200">Critical</span>}
                                                    {!expired && days > 30 && days <= 90 && <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-status-info-bg text-status-info border border-status-info">Monitor</span>}
                                                    {!expired && days > 90 && <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200">Stable</span>}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    {/* Nothing left to write off in an empty batch. */}
                                                    <Button variant="outline" size="sm" disabled={depleted} onClick={() => openAdjustForm(batch)}>
                                                        Report Issue
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {product.stock_batches.length === 0 && (
                                        <tr>
                                            <td colSpan={columnCount} className="px-4 py-8 text-center text-gray-500">
                                                No batches received yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {adjustingBatch && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white shadow-md rounded-lg border border-gray-300 shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 uppercase tracking-wider mb-4">
                            Report Issue (Batch #{adjustingBatch.batch_number})
                        </h3>
                        <form onSubmit={submitAdjustment}>
                            <div className="space-y-gap-md">
                                <div>
                                    <label className={LABEL_CLASS}>Quantity to Deduct *</label>
                                    <input
                                        type="number"
                                        max={adjustingBatch.quantity}
                                        min="1"
                                        className={INPUT_CLASS}
                                        value={adjustForm.data.quantity_change ? Math.abs(Number(adjustForm.data.quantity_change)) : ''}
                                        onChange={e => adjustForm.setData('quantity_change', e.target.value ? `-${e.target.value}` : '')}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Currently {adjustingBatch.quantity} in stock.</p>
                                    {adjustForm.errors.quantity_change && <p className={ERROR_CLASS}>{adjustForm.errors.quantity_change}</p>}
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Reason *</label>
                                    <select className={INPUT_CLASS} value={adjustForm.data.reason} onChange={e => adjustForm.setData('reason', e.target.value)} required>
                                        <option value="damaged">Damaged Product</option>
                                        <option value="expired">Expired Product</option>
                                        <option value="missing">Missing / Lost</option>
                                        <option value="correction">Inventory Audit Correction</option>
                                    </select>
                                    {adjustForm.errors.reason && <p className={ERROR_CLASS}>{adjustForm.errors.reason}</p>}
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Notes (Optional)</label>
                                    <textarea className={INPUT_CLASS} rows={3} value={adjustForm.data.notes} onChange={e => adjustForm.setData('notes', e.target.value)}></textarea>
                                    {adjustForm.errors.notes && <p className={ERROR_CLASS}>{adjustForm.errors.notes}</p>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setAdjustingBatch(null)}>Cancel</Button>
                                <Button type="submit" variant="destructive" disabled={adjustForm.processing}>Submit Report</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
