import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

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

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-gap-md">
                    
                    {/* Filter Controls */}
                    <div className="bg-surface-raised border border-border-subtle p-gap-md shadow">
                        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-gap-md">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Start Date</label>
                                <input type="date" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">End Date</label>
                                <input type="date" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                            </div>
                            <button type="submit" className="bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2 flex items-center gap-1 h-[38px]">
                                Generate Report
                            </button>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-gap-md">
                        <div className="bg-surface-raised overflow-hidden shadow border border-border-subtle p-gap-md border-l-4 border-l-status-info">
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider truncate mb-1">Total Transactions</div>
                            <div className="text-3xl font-bold text-text-primary">{summary.total_transactions}</div>
                        </div>
                        <div className="bg-surface-raised overflow-hidden shadow border border-border-subtle p-gap-md border-l-4 border-l-primary">
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider truncate mb-1">Gross Revenue</div>
                            <div className="text-3xl font-bold text-text-primary">{currency(summary.total_revenue)}</div>
                        </div>
                        <div className="bg-surface-raised overflow-hidden shadow border border-border-subtle p-gap-md border-l-4 border-l-status-warning">
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider truncate mb-1">Cost of Goods Sold</div>
                            <div className="text-3xl font-bold text-status-warning">{currency(summary.total_cogs)}</div>
                        </div>
                        <div className="bg-surface-raised overflow-hidden shadow border border-border-subtle p-gap-md border-l-4 border-l-status-success">
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider truncate mb-1">Net Profit</div>
                            <div className="text-3xl font-bold text-status-success">{currency(summary.total_profit)}</div>
                        </div>
                    </div>

                    {/* Daily Ledger Table */}
                    <div className="bg-surface-raised border border-border-subtle shadow p-gap-md">
                        <div className="flex items-center gap-gap-sm text-text-primary mb-gap-md">
                            <span className="material-symbols-outlined">query_stats</span>
                            <h3 className="text-lg font-bold uppercase tracking-wider">Daily Ledger Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto border border-border-subtle bg-surface-base">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Date</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Transactions</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Gross Revenue</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">COGS</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Net Profit</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {dailyData.map((day) => {
                                        const margin = (Number(day.profit) / Number(day.revenue) * 100) || 0;
                                        return (
                                            <tr key={day.date} className="hover:bg-surface-container-low transition-colors">
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm font-bold text-text-primary">
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right font-mono text-text-secondary">
                                                    {day.total_transactions}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-text-primary font-bold">
                                                    {currency(day.revenue)}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-status-warning font-bold">
                                                    {currency(day.cogs)}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-status-success font-bold">
                                                    {currency(day.profit)}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-text-secondary font-mono">
                                                    {margin.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {dailyData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-gap-md py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">query_stats</span>
                                                No sales recorded for this period.
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

