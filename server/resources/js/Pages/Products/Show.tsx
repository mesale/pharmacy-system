import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface StockBatch {
    id: number;
    batch_number: string;
    cost_price: string;
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
}

export default function Show({ auth, product, suppliers }: Props) {
    const [showBatchForm, setShowBatchForm] = useState(false);
    const isAdmin = auth.user?.roles?.includes('admin');

    const totalStock = product.stock_batches.reduce((sum, b) => sum + b.quantity, 0);

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_number: '',
        cost_price: '',
        quantity: '',
        expiry_date: '',
        received_date: new Date().toISOString().split('T')[0],
        supplier_id: '',
    });

    const submitBatch = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('batches.store', product.id), {
            onSuccess: () => { setShowBatchForm(false); reset(); },
        });
    };

    const daysUntilExpiry = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{product.name}</h2>}
        >
            <Head title={product.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Product Info Card */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {product.requires_prescription && (
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">Rx Required</span>
                                    )}
                                    {product.is_controlled && (
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">Controlled</span>
                                    )}
                                    {product.category && (
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700">{product.category.name}</span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Barcode: <span className="font-mono">{product.barcode || 'N/A'}</span> · Unit: {product.unit}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Selling Price</div>
                                <div className="text-3xl font-bold text-indigo-600">${product.selling_price}</div>
                            </div>
                        </div>

                        {/* Stock Summary Bar */}
                        <div className="mt-6 bg-gray-50 rounded p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Inventory Health</span>
                                <span className={`text-sm font-bold ${totalStock <= product.reorder_level ? 'text-red-600' : 'text-green-600'}`}>
                                    {totalStock} units on hand (Reorder at {product.reorder_level})
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
                                <div
                                    className={`h-full ${totalStock <= product.reorder_level ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min((totalStock / (product.reorder_level * 3)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* FEFO Batch Table */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">FEFO Batch Ledger</h3>
                            {isAdmin && (
                                <Button onClick={() => setShowBatchForm(!showBatchForm)}>
                                    {showBatchForm ? 'Cancel' : 'Receive New Batch'}
                                </Button>
                            )}
                        </div>

                        {showBatchForm && (
                            <form onSubmit={submitBatch} className="mb-6 p-4 bg-gray-50 rounded border">
                                <h4 className="text-md font-medium mb-4">Batch Intake</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Batch Number *</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.batch_number} onChange={e => setData('batch_number', e.target.value)} required />
                                        {errors.batch_number && <p className="text-red-500 text-xs mt-1">{errors.batch_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)}>
                                            <option value="">Select supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cost Price *</label>
                                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required />
                                        {errors.cost_price && <p className="text-red-500 text-xs mt-1">{errors.cost_price}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                                        <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.quantity} onChange={e => setData('quantity', e.target.value)} required />
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
                                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} required />
                                        {errors.expiry_date && <p className="text-red-500 text-xs mt-1">{errors.expiry_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Received Date *</label>
                                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.received_date} onChange={e => setData('received_date', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={processing}>Save Batch</Button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FEFO Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {product.stock_batches.map((batch, index) => {
                                        const days = daysUntilExpiry(batch.expiry_date);
                                        const margin = ((parseFloat(product.selling_price) - parseFloat(batch.cost_price)) / parseFloat(batch.cost_price) * 100).toFixed(1);
                                        return (
                                            <tr key={batch.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-6 ${days <= 30 ? 'bg-red-500' : days <= 90 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                                        <div>
                                                            <span className="text-sm font-semibold text-gray-900">#{batch.batch_number}</span>
                                                            <span className="block text-xs text-gray-500">
                                                                {index === 0 ? 'PRIORITY DISPENSE' : `${index + 1}. NEXT IN QUEUE`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{batch.batch_number}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {batch.supplier?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">{batch.quantity}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">${batch.cost_price}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 font-semibold">+{margin}%</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <div>
                                                        <span className={`font-medium ${days <= 30 ? 'text-red-600' : days <= 90 ? 'text-yellow-600' : 'text-gray-900'}`}>
                                                            {new Date(batch.expiry_date).toLocaleDateString()}
                                                        </span>
                                                        <span className={`block text-xs font-semibold ${days <= 30 ? 'text-red-500' : days <= 90 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                            {days <= 0 ? 'EXPIRED' : `${days} DAYS`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    {days <= 0 && <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-800">EXPIRED</span>}
                                                    {days > 0 && days <= 30 && <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-800">CRITICAL</span>}
                                                    {days > 30 && days <= 90 && <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800">MONITOR</span>}
                                                    {days > 90 && <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800">STABLE</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {product.stock_batches.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No batches received yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
