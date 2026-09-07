import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Props {
    auth: any;
    grossSalesToday: number;
    netProfitToday: number;
    transactionCountToday: number;
    expiringBatchesCount: number;
    criticalAlerts: Array<{
        type: 'low_stock' | 'expiring';
        product: string;
        barcode?: string;
        batch_number?: string;
        current_stock?: number;
        quantity?: number;
        threshold?: number;
        expiry_date?: string;
        message: string;
    }>;
}

export default function Dashboard({
    auth,
    grossSalesToday,
    netProfitToday,
    transactionCountToday,
    expiringBatchesCount,
    criticalAlerts
}: Props) {
    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const profitMargin = grossSalesToday > 0 ? ((netProfitToday / grossSalesToday) * 100).toFixed(1) : '0.0';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Executive Admin Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Telemetry Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gross Sales */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Gross Sales Today</span>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-gray-900">{formatCurrency(grossSalesToday)}</span>
                                <span className="text-sm font-semibold text-gray-500">{transactionCountToday} TRANSACTIONS</span>
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-indigo-100 p-6 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Net Realized Profit</span>
                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold">{profitMargin}% MARGIN</span>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-indigo-700">{formatCurrency(netProfitToday)}</span>
                                <span className="text-sm font-semibold text-red-500">COGS: {formatCurrency(grossSalesToday - netProfitToday)}</span>
                            </div>
                        </div>

                        {/* FEFO Expiry Risk */}
                        <div className={`overflow-hidden shadow-sm sm:rounded-lg border p-6 flex flex-col ${expiringBatchesCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold uppercase tracking-wider ${expiringBatchesCount > 0 ? 'text-red-700' : 'text-gray-500'}`}>FEFO Expiry Risk</span>
                                {expiringBatchesCount > 0 && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">&lt;30 DAYS</span>}
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className={`text-3xl font-bold ${expiringBatchesCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>{expiringBatchesCount}</span>
                                <span className="text-sm font-semibold text-gray-500">BATCHES FLAGGED</span>
                            </div>
                        </div>
                    </div>

                    {/* Lower Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Clinical Deficit & Reorder Safety Triggers */}
                        <div className="lg:col-span-2 bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 uppercase">Clinical Deficit & Reorder Safety Triggers</h2>
                                    <p className="text-xs text-gray-500">Automated Minimum Safety Floor Depletions & FEFO Alerts</p>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                                            <th className="py-2 px-2">Alert / Product</th>
                                            <th className="py-2 px-2">Status</th>
                                            <th className="py-2 px-2 text-right">Action Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {criticalAlerts.map((alert, idx) => (
                                            <tr key={idx} className={alert.type === 'low_stock' ? 'bg-red-50' : 'bg-orange-50'}>
                                                <td className="py-3 px-2">
                                                    <div className="font-bold text-gray-900">{alert.product}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {alert.type === 'low_stock' ? `Barcode: ${alert.barcode}` : `Batch: ${alert.batch_number}`}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-mono font-bold text-red-600">
                                                    {alert.type === 'low_stock' ? `${alert.current_stock} Units` : `Expires: ${alert.expiry_date}`}
                                                    <div className="text-[10px] text-gray-500 font-sans mt-1">{alert.message}</div>
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <Link href={route('products.index')} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded shadow-sm hover:bg-gray-50">
                                                        VIEW ITEM
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {criticalAlerts.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="py-8 text-center text-gray-400">All systems nominal. No alerts.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Executive Control Rail */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h2 className="text-lg font-bold text-gray-900 uppercase">Executive Control Rail</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <Link href={route('products.index')} className="flex items-center justify-between p-3 border rounded hover:border-indigo-500 hover:bg-indigo-50 transition-colors group">
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-700">Receive Stock Batch</div>
                                        <div className="text-xs text-gray-500">FEFO expiration stamping</div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                                <Link href={route('suppliers.index')} className="flex items-center justify-between p-3 border rounded hover:border-indigo-500 hover:bg-indigo-50 transition-colors group">
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-700">Supplier Management</div>
                                        <div className="text-xs text-gray-500">Manage vendors & contacts</div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                                <Link href={route('users.index')} className="flex items-center justify-between p-3 border rounded hover:border-indigo-500 hover:bg-indigo-50 transition-colors group">
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-700">Staff Management</div>
                                        <div className="text-xs text-gray-500">Roles & permissions</div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
