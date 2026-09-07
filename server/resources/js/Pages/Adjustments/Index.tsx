import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface StockAdjustment {
    id: number;
    product: { name: string; barcode: string | null };
    batch: { batch_number: string };
    user: { name: string };
    quantity_change: number;
    reason: string;
    notes: string | null;
    created_at: string;
}

interface Props {
    auth: any;
    adjustments: {
        data: StockAdjustment[];
        links: any[];
    };
}

export default function Index({ auth, adjustments }: Props) {
    return (
        <AdminLayout>
            <Head title="Audit Log: Adjustments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Stock Adjustment Audit Log</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product & Batch</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Change</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {adjustments.data.map((adj) => (
                                        <tr key={adj.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(adj.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {adj.user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{adj.product.name}</div>
                                                <div className="text-xs text-gray-500">Batch: {adj.batch.batch_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                                                    adj.reason === 'damaged' ? 'bg-red-100 text-red-800' :
                                                    adj.reason === 'expired' ? 'bg-orange-100 text-orange-800' :
                                                    adj.reason === 'missing' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {adj.reason}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                                                adj.quantity_change < 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {adj.notes || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {adjustments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No adjustments logged yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

