import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Calculator } from 'lucide-react';

interface Props {
    shiftStartTime: string;
    expectedCash: string | number;
}

const CONTROL =
    'w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors ' +
    'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50';

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
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
        : (difference ?? 0) > 0
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
            : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';

    return (
        <AdminLayout>
            <Head title="Close Shift & Reconcile" />

            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
                <Card>
                    <CardContent>
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                                <Calculator className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">End of Shift Reconciliation</h2>
                            <p className="text-sm text-muted-foreground mt-1">Count the physical cash in your drawer and submit.</p>
                        </div>

                        <div className="bg-muted rounded-lg border border-border p-6 mb-6 text-center">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Expected Cash</h3>
                            <div className="text-3xl font-mono font-bold tracking-tight text-foreground mt-2">{currency(expected)}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Shift started: {new Date(shiftStartTime).toLocaleString()}
                            </div>
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Actual Cash Counted</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-muted-foreground text-sm">$</span>
                                    </div>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="pl-7 h-11 text-xl font-mono"
                                        placeholder="0.00"
                                        value={data.actual_counted_cash}
                                        onChange={e => setData('actual_counted_cash', e.target.value)}
                                    />
                                </div>
                                {errors.actual_counted_cash && <p className="text-red-500 text-sm mt-1">{errors.actual_counted_cash}</p>}
                            </div>

                            {difference !== null && (
                                <div className={`p-4 rounded-lg border flex items-center justify-between font-bold uppercase tracking-wider ${varianceClass}`}>
                                    <span className="text-xs">Variance</span>
                                    <span className="text-xl font-mono">
                                        {difference > 0 ? '+' : ''}{currency(difference)}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Notes (Required if Short/Over)</label>
                                <textarea
                                    className={`${CONTROL} py-2`}
                                    rows={3}
                                    placeholder="Explain any discrepancies here..."
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    required={difference !== null && difference !== 0}
                                />
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-border">
                                <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto">
                                    Submit &amp; Close Shift
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
