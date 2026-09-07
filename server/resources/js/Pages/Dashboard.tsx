import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const profitMargin = grossSalesToday > 0 ? ((netProfitToday / grossSalesToday) * 100).toFixed(1) : '0.0';
    const cogs = grossSalesToday - netProfitToday;

    return (
        <AdminLayout>
            <Head title="Executive Admin Dashboard" />
            
            <div className="flex flex-col w-full pb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-gap-md py-gap-lg border-b border-border-subtle bg-surface-base">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-gap-xs">
                            <span className="font-label-sm text-label-sm bg-surface-overlay text-primary border border-border-strong px-2 py-0.5">EXECUTIVE SUITE // PHARM-OPS v4.2</span>
                            <span className="font-label-sm text-label-sm text-text-muted">CYCLE: REAL-TIME</span>
                        </div>
                        <div className="flex items-baseline gap-gap-md mt-0.5">
                            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">OPERATIONAL FISCAL OVERSIGHT</h1>
                            <span className="font-body-sm text-body-sm text-status-success flex items-center gap-1 font-semibold">
                                <span className="w-2 h-2 bg-status-success rounded-full animate-ping"></span>
                                REAL-TIME TELEMETRY CONNECTED
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-gap-sm self-stretch md:self-auto">
                        <div className="flex bg-surface-raised border border-border-subtle p-0.5">
                            <button className="px-3 py-1 font-label-sm text-label-sm bg-primary text-surface-base font-bold transition-all">DAY</button>
                            <button className="px-3 py-1 font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-all">7D TRAILING</button>
                            <button className="px-3 py-1 font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-all">M-T-D</button>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border-subtle hover:border-primary text-text-primary font-label-sm text-label-sm transition-colors">
                            <span className="material-symbols-outlined text-label-lg">print</span>
                            <span>FISCAL LEDGER</span>
                        </button>
                    </div>
                </div>
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-gap-sm py-gap-lg">
                    <div className="bg-surface-raised border border-border-subtle p-3 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-text-muted uppercase">Gross Sales Today</span>
                            <span className="font-label-sm text-label-sm bg-status-success-bg text-status-success px-1 py-0.5 border border-status-success flex items-center gap-0.5">
                                LIVE
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-data-tabular-lg text-data-tabular-lg text-text-primary font-bold tracking-tight">{formatCurrency(grossSalesToday)}</span>
                            <span className="font-label-sm text-label-sm text-text-secondary">{transactionCountToday} TRANSACTIONS</span>
                        </div>
                        <div className="mt-2 w-full bg-surface-base h-1 overflow-hidden">
                            <div className="bg-primary h-full w-[100%]"></div>
                        </div>
                    </div>
                    <div className="bg-surface-raised border border-border-subtle p-3 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-text-muted uppercase">Net Realized Profit</span>
                            <span className="font-label-sm text-label-sm text-primary font-bold">{profitMargin}% MARGIN</span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-data-tabular-lg text-data-tabular-lg text-primary font-bold tracking-tight">{formatCurrency(netProfitToday)}</span>
                            <span className="font-label-sm text-label-sm text-status-critical font-medium">COGS: -{formatCurrency(cogs)}</span>
                        </div>
                        <div className="mt-2 w-full bg-surface-base h-1 flex">
                            <div className="bg-primary h-full" style={{ width: `${profitMargin}%` }}></div>
                            <div className="bg-surface-container-highest h-full" style={{ width: `${100 - parseFloat(profitMargin)}%` }}></div>
                        </div>
                    </div>
                    <div className={`bg-surface-raised border p-3 flex flex-col justify-between relative overflow-hidden group transition-colors ${expiringBatchesCount > 0 ? 'border-status-warning hover:border-status-warning' : 'border-border-subtle hover:border-border-strong'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`font-label-sm text-label-sm uppercase font-semibold ${expiringBatchesCount > 0 ? 'text-status-warning' : 'text-text-muted'}`}>FEFO Expiry Risk</span>
                            {expiringBatchesCount > 0 && <span className="bg-status-warning-bg text-status-warning border border-status-warning font-label-sm text-label-sm px-1">&lt;30 DAYS</span>}
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className={`font-data-tabular-lg text-data-tabular-lg font-bold tracking-tight ${expiringBatchesCount > 0 ? 'text-status-warning' : 'text-text-primary'}`}>{expiringBatchesCount}</span>
                            <span className="font-label-sm text-label-sm text-text-secondary">BATCHES FLAGGED</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
                            <span>ACTION</span>
                            {expiringBatchesCount > 0 ? <span className="text-status-warning">REQUIRED</span> : <span>NONE</span>}
                        </div>
                    </div>
                </section>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gap-lg">
                    <div className="lg:col-span-8 flex flex-col gap-gap-lg">
                        <div className="bg-surface-raised border border-border-subtle p-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-status-critical text-headline-sm">fmd_bad</span>
                                    <div>
                                        <h2 className="font-headline-sm text-headline-sm text-text-primary uppercase tracking-wide">Clinical Deficit &amp; Reorder Safety Triggers</h2>
                                        <p className="font-label-sm text-label-sm text-text-muted">Automated Minimum Safety Floor Depletions (PAR Thresholds)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto mt-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-subtle font-label-sm text-label-sm text-text-muted uppercase">
                                            <th className="py-2 px-2">NDC / Molecule</th>
                                            <th className="py-2 px-2">Current Stock</th>
                                            <th className="py-2 px-2">PAR Floor / Expiry</th>
                                            <th className="py-2 px-2 text-right">Action Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle font-body-sm text-body-sm">
                                        {criticalAlerts.map((alert, idx) => (
                                            <tr key={idx} className={alert.type === 'low_stock' ? 'bg-status-critical-bg/20 hover:bg-surface-overlay transition-colors' : 'hover:bg-surface-overlay transition-colors'}>
                                                <td className="py-2 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-5 ${alert.type === 'low_stock' ? 'bg-status-critical' : 'bg-status-warning'}`}></span>
                                                        <div className="flex flex-col">
                                                            <span className="font-headline-sm text-headline-sm text-text-primary">{alert.product}</span>
                                                            <span className="font-label-sm text-label-sm text-text-muted">
                                                                {alert.type === 'low_stock' ? `Barcode: ${alert.barcode}` : `Batch: ${alert.batch_number}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`py-2 px-2 font-mono font-bold ${alert.type === 'low_stock' ? 'text-status-critical' : 'text-status-warning'}`}>
                                                    {alert.type === 'low_stock' ? `${alert.current_stock} Units` : `${alert.quantity} Units Expiring`}
                                                    <span className="text-[9px] block text-text-muted">{alert.message}</span>
                                                </td>
                                                <td className="py-2 px-2 font-mono text-text-primary">
                                                    {alert.type === 'low_stock' ? `${alert.threshold} Units` : `${alert.expiry_date}`}
                                                </td>
                                                <td className="py-2 px-2 text-right">
                                                    <Link href={route('products.index')} className={`px-2 py-1 font-label-sm text-label-sm font-bold uppercase transition-all ${alert.type === 'low_stock' ? 'bg-status-critical text-text-primary hover:brightness-110 active:scale-95' : 'bg-surface-base border border-border-strong text-text-primary hover:border-primary'}`}>
                                                        VIEW ITEM
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {criticalAlerts.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center font-body-sm text-body-sm text-text-muted">Systems nominal. No active alerts.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col gap-gap-lg">
                        <div className="bg-surface-raised border border-border-subtle p-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                                <span className="material-symbols-outlined text-primary text-headline-sm">admin_panel_settings</span>
                                <h3 className="font-headline-sm text-headline-sm text-text-primary uppercase">Executive Control Rail</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <Link href={route('products.index')} className="flex items-center justify-between p-2.5 bg-surface-base border border-border-subtle hover:border-primary text-text-primary group transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-tertiary text-headline-sm">add_box</span>
                                        <div className="flex flex-col text-left">
                                            <span className="font-headline-sm text-headline-sm text-text-primary">New Stock Batch / PO Entry</span>
                                            <span className="font-label-sm text-label-sm text-text-muted">FEFO expiration stamping and NDC ingestion</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                                <Link href={route('suppliers.index')} className="flex items-center justify-between p-2.5 bg-surface-base border border-border-subtle hover:border-primary text-text-primary group transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-secondary text-headline-sm">hub</span>
                                        <div className="flex flex-col text-left">
                                            <span className="font-headline-sm text-headline-sm text-text-primary">Supplier Management</span>
                                            <span className="font-label-sm text-label-sm text-text-muted">EDI 850 links and pricing agreements</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                                <Link href={route('categories.index')} className="flex items-center justify-between p-2.5 bg-surface-base border border-border-subtle hover:border-primary text-text-primary group transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-text-secondary text-headline-sm">category</span>
                                        <div className="flex flex-col text-left">
                                            <span className="font-headline-sm text-headline-sm text-text-primary">Category Organization</span>
                                            <span className="font-label-sm text-label-sm text-text-muted">Manage product taxonomies</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                            </div>
                        </div>
                        <div className="bg-surface-raised border border-border-subtle p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm text-text-muted uppercase">HARDWARE STATUS</span>
                                <span className="font-label-sm text-label-sm text-status-success font-bold">ALL SYSTEMS NOMINAL</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-label-sm text-label-sm">
                                <div className="bg-surface-base p-2 border border-border-subtle flex flex-col">
                                    <span className="text-text-muted">T-01 HONEYWELL 1950G</span>
                                    <span className="text-primary font-mono">ONLINE &middot; 99% BAT</span>
                                </div>
                                <div className="bg-surface-base p-2 border border-border-subtle flex flex-col">
                                    <span className="text-text-muted">EPSON TM-T88VI</span>
                                    <span className="text-primary font-mono">FEED READY &middot; PAPER OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
