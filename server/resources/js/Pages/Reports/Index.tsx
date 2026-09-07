import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface DailyData {
    date: string;
    total_transactions: number;
    revenue: string;
    cogs: string;
    profit: string;
}

interface Summary {
    total_transactions: number;
    total_revenue: string;
    total_cogs: string;
    total_profit: string;
}

interface Props {
    filters: {
        start_date: string;
        end_date: string;
    };
    dailyData: DailyData[];
    summary: Summary;
}

export default function Index({ filters, dailyData, summary }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('reports.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const currency = (val: string | number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    };

    return (
        <AdminLayout>
            <Head title="Financial Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Filter Controls */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                            </div>
                            <Button type="submit">Generate Report</Button>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <div className="text-sm font-medium text-gray-500 truncate">Total Transactions</div>
                            <div className="mt-1 text-3xl font-semibold text-gray-900">{summary.total_transactions}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <div className="text-sm font-medium text-gray-500 truncate">Gross Revenue</div>
                            <div className="mt-1 text-3xl font-semibold text-gray-900">{currency(summary.total_revenue)}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-orange-500">
                            <div className="text-sm font-medium text-gray-500 truncate">Cost of Goods Sold</div>
                            <div className="mt-1 text-3xl font-semibold text-gray-900">{currency(summary.total_cogs)}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-green-500">
                            <div className="text-sm font-medium text-gray-500 truncate">Net Profit</div>
                            <div className="mt-1 text-3xl font-semibold text-green-600">{currency(summary.total_profit)}</div>
                        </div>
                    </div>

                    {/* Daily Ledger Table */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Ledger Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dailyData.map((day) => {
                                        const margin = (Number(day.profit) / Number(day.revenue) * 100) || 0;
                                        return (
                                            <tr key={day.date}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                    {day.total_transactions}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                                                    {currency(day.revenue)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                    {currency(day.cogs)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                                                    {currency(day.profit)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-mono">
                                                    {margin.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {dailyData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No sales recorded for this period.</td>
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
