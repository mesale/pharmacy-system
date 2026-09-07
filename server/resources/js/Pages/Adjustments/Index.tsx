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

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-transparent">
                        
                        <div className="flex flex-wrap justify-between items-center mb-gap-md gap-4">
                            <div className="flex items-center gap-gap-sm text-text-primary">
                                <span className="material-symbols-outlined">history</span>
                                <h3 className="text-lg font-bold uppercase tracking-wider">Stock Adjustment Audit Log</h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-border-subtle bg-surface-base">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Timestamp</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">User</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Product & Batch</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Reason</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Qty Change</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {adjustments.data.map((adj) => (
                                        <tr key={adj.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-text-muted font-mono">
                                                {new Date(adj.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm font-bold text-text-primary">
                                                {adj.user.name}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-text-primary">{adj.product.name}</div>
                                                <div className="text-xs text-text-secondary font-mono">Batch: {adj.batch.batch_number}</div>
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-sm border uppercase tracking-wider ${
                                                    adj.reason === 'damaged' ? 'bg-status-critical-bg text-status-critical border-status-critical' :
                                                    adj.reason === 'expired' ? 'bg-status-warning-bg text-status-warning border-status-warning' :
                                                    adj.reason === 'missing' ? 'bg-status-warning-bg text-status-warning border-status-warning' :
                                                    'bg-status-info-bg text-status-info border-status-info'
                                                }`}>
                                                    {adj.reason}
                                                </span>
                                            </td>
                                            <td className={`px-gap-md py-4 whitespace-nowrap text-right text-sm font-bold ${
                                                adj.quantity_change < 0 ? 'text-status-critical' : 'text-status-success'
                                            }`}>
                                                {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                                            </td>
                                            <td className="px-gap-md py-4 text-sm text-text-muted max-w-xs truncate">
                                                {adj.notes || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {adjustments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-gap-md py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                                                No adjustments logged yet.
                                            </td>
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

