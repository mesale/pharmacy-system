import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

interface Props {
    shiftStartTime: string;
    expectedCash: string | number;
}

export default function Create({ shiftStartTime, expectedCash }: Props) {
    const expected = Number(expectedCash);

    const { data, setData, post, processing, errors } = useForm({
        actual_counted_cash: '',
        notes: '',
    });

    const [difference, setDifference] = useState<number | null>(null);

    useEffect(() => {
        if (data.actual_counted_cash !== '') {
            // Rounded to cents, matching the server. Raw float subtraction left
            // a balanced till showing a variance of -1.4e-14, which reported as
            // "over" and made the notes field wrongly required.
            const raw = Number(data.actual_counted_cash) - expected;
            setDifference(Number.isFinite(raw) ? Math.round(raw * 100) / 100 : null);
        } else {
            setDifference(null);
        }
    }, [data.actual_counted_cash, expected]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reconciliation.store'));
    };

    const currency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const varianceClass = difference === 0
        ? 'bg-green-50 text-green-600 border-green-200'
        : (difference ?? 0) > 0
            ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
            : 'bg-red-50 text-red-600 border-red-200';

    return (
        <AdminLayout>
            <Head title="Close Shift & Reconcile" />

            <div className="py-6">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden shadow p-6">
                        <div className="text-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-emerald-600 mb-2">point_of_sale</span>
                            <h2 className="text-2xl font-bold text-gray-900">End of Shift Reconciliation</h2>
                            <p className="text-sm text-gray-500">Count the physical cash in your drawer and submit.</p>
                        </div>

                        <div className="bg-gray-50 rounded border border-gray-300 p-6 mb-6 text-center">
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Expected Cash</h3>
                            <div className="text-3xl font-mono font-bold tracking-tight font-mono text-gray-900 mt-2">{currency(expected)}</div>
                            <div className="text-xs text-gray-500 mt-2">
                                Shift started: {new Date(shiftStartTime).toLocaleString()}
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-gap-lg">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Actual Cash Counted</label>
                                <div className="mt-1 relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="block w-full bg-white shadow-sm rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 pl-7 py-2 text-xl font-mono focus:border-emerald-600 focus:ring-1 focus:ring-primary"
                                        placeholder="0.00"
                                        value={data.actual_counted_cash}
                                        onChange={e => setData('actual_counted_cash', e.target.value)}
                                    />
                                </div>
                                {errors.actual_counted_cash && <p className="text-red-600 text-sm mt-1 font-bold">{errors.actual_counted_cash}</p>}
                            </div>

                            {difference !== null && (
                                <div className={`p-4 border flex items-center justify-between font-bold uppercase tracking-wider ${varianceClass}`}>
                                    <span className="text-xs">Variance</span>
                                    <span className="text-xl font-mono">
                                        {difference > 0 ? '+' : ''}{currency(difference)}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Notes (Required if Short/Over)</label>
                                <textarea
                                    className="mt-1 block w-full bg-white shadow-sm rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:ring-1 focus:ring-primary py-2 px-3 text-sm"
                                    rows={3}
                                    placeholder="Explain any discrepancies here..."
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    required={difference !== null && difference !== 0}
                                />
                                {errors.notes && <p className="text-red-600 text-sm mt-1 font-bold">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end pt-gap-md border-t border-gray-300">
                                <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto">
                                    Submit &amp; Close Shift
                                </Button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
