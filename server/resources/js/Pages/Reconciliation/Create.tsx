import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Props {
    shiftStartTime: string;
    expectedCash: string | number;
}

export default function Create({ shiftStartTime, expectedCash }: Props) {
    const expected = Number(expectedCash);
    
    const { data, setData, post, processing, errors } = useForm({
        shift_start_time: shiftStartTime,
        actual_counted_cash: '',
        notes: '',
    });

    const [difference, setDifference] = useState<number | null>(null);

    useEffect(() => {
        if (data.actual_counted_cash !== '') {
            setDifference(Number(data.actual_counted_cash) - expected);
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

    return (
        <AdminLayout>
            <Head title="Close Shift & Reconcile" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="text-center mb-8">
                            <span className="material-symbols-outlined text-5xl text-indigo-500 mb-2">point_of_sale</span>
                            <h2 className="text-2xl font-bold text-gray-900">End of Shift Reconciliation</h2>
                            <p className="text-gray-500">Count the physical cash in your drawer and submit.</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center border">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Expected Cash</h3>
                            <div className="text-4xl font-mono font-bold text-gray-900 mt-2">{currency(expected)}</div>
                            <div className="text-xs text-gray-400 mt-2">
                                Shift started: {new Date(shiftStartTime).toLocaleString()}
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Actual Cash Counted ($)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="block w-full rounded-md border-gray-300 pl-7 text-xl font-mono focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="0.00"
                                        value={data.actual_counted_cash}
                                        onChange={e => setData('actual_counted_cash', e.target.value)}
                                    />
                                </div>
                                {errors.actual_counted_cash && <p className="text-red-500 text-sm mt-1">{errors.actual_counted_cash}</p>}
                            </div>

                            {difference !== null && (
                                <div className={`p-4 rounded-md flex items-center justify-between font-bold ${
                                    difference === 0 ? 'bg-green-50 text-green-700 border border-green-200' :
                                    difference > 0 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    <span>Variance:</span>
                                    <span className="text-xl">
                                        {difference > 0 ? '+' : ''}{currency(difference)}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes (Required if Short/Over)</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={3}
                                    placeholder="Explain any discrepancies here..."
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    required={difference !== null && difference !== 0}
                                />
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto text-lg py-6 px-8">
                                    Submit & Close Shift
                                </Button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
