import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

interface StockBatch {
    id: number;
    batch_number: string;
    // Omitted by the server for non-admins: cost reveals the pharmacy's margin.
    cost_price?: string;
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
    canViewCost: boolean;
}

// Shared field styling for the native <select>/<textarea> controls, matching the
// theme-aware <Input> component (which handles plain inputs).
const LABEL = 'text-sm font-medium leading-none';
const CONTROL =
    'w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors ' +
    'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50';
const ERROR = 'text-red-500 text-xs mt-1';

/** Today as YYYY-MM-DD, to compare against the date-only expiry column. */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Mirrors the server's `sellableBatches` scope (`expiry_date >= today`), so a
 * batch expiring today still counts. Comparing the date strings avoids the
 * off-by-one that a millisecond diff introduces for same-day expiries.
 */
const isExpired = (expiryDate: string) => expiryDate.slice(0, 10) < today();

export default function Show({ auth, product, suppliers, canViewCost }: Props) {
    const [showBatchForm, setShowBatchForm] = useState(false);
    const isAdmin = auth.user?.roles?.includes('admin');

    // Only sellable units are "on hand". Summing every batch counted expired and
    // emptied stock as available, so this figure contradicted the product list,
    // which uses the server-side sellable total.
    const sellableBatches = product.stock_batches.filter(
        (b) => b.quantity > 0 && !isExpired(b.expiry_date),
    );
    const totalStock = sellableBatches.reduce((sum, b) => sum + b.quantity, 0);

    // The batch FEFO will actually dispense from next: earliest-expiring batch
    // that still has stock and has not expired. Previously the first row of the
    // table was labelled the priority regardless, which pointed at an expired
    // or empty batch whenever one sorted first.
    const priorityBatchId = sellableBatches[0]?.id;

    const isLowStock = totalStock <= product.reorder_level;
    // A reorder level of 0 would make the bar's denominator 0 and the width NaN.
    const stockBarWidth = product.reorder_level > 0
        ? Math.min((totalStock / (product.reorder_level * 3)) * 100, 100)
        : totalStock > 0 ? 100 : 0;

    const columnCount = canViewCost ? 8 : 6;

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_number: '',
        cost_price: '',
        quantity: '',
        expiry_date: '',
        received_date: today(),
        supplier_id: '',
    });

    const submitBatch = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('batches.store', product.id), {
            onSuccess: () => { setShowBatchForm(false); reset(); },
        });
    };

    const [adjustingBatch, setAdjustingBatch] = useState<StockBatch | null>(null);
    const adjustForm = useForm({
        quantity_change: '',
        reason: 'damaged',
        notes: '',
    });

    const openAdjustForm = (batch: StockBatch) => {
        setAdjustingBatch(batch);
        adjustForm.reset();
    };

    const submitAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingBatch) return;
        adjustForm.post(route('adjustments.store', adjustingBatch.id), {
            onSuccess: () => setAdjustingBatch(null),
        });
    };

    const daysUntilExpiry = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const statusBadge = (expired: boolean, days: number) => {
        if (expired) return <Badge variant="destructive">Expired</Badge>;
        if (days <= 30) return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">Critical</Badge>;
        if (days <= 90) return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">Monitor</Badge>;
        return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Stable</Badge>;
    };

    return (
        <AdminLayout>
            <Head title={product.name} />

            <div className="flex flex-col gap-6 w-full pb-12">
                {/* Product header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mt-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {product.requires_prescription && (
                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Rx Required</Badge>
                            )}
                            {product.is_controlled && <Badge variant="destructive">Controlled</Badge>}
                            {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Barcode: <span className="font-mono">{product.barcode || 'N/A'}</span> · Unit: {product.unit}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selling Price</div>
                        <div className="text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400">${product.selling_price}</div>
                    </div>
                </div>

                {/* Inventory health */}
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory Health</span>
                            <span className={`text-sm font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {totalStock} sellable units on hand (Reorder at {product.reorder_level})
                            </span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${stockBarWidth}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* FEFO batch ledger */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-lg font-semibold text-foreground">FEFO Batch Ledger</h3>
                    {isAdmin && (
                        <Button onClick={() => setShowBatchForm(!showBatchForm)} variant={showBatchForm ? 'outline' : 'default'}>
                            {showBatchForm ? 'Cancel' : 'Receive New Batch'}
                        </Button>
                    )}
                </div>

                {showBatchForm && (
                    <Card className="ring-emerald-500/30">
                        <CardHeader>
                            <CardTitle className="text-base">Batch Intake</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitBatch} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <label className={LABEL}>Batch Number <span className="text-red-500">*</span></label>
                                        <Input type="text" value={data.batch_number} onChange={e => setData('batch_number', e.target.value)} required />
                                        {errors.batch_number && <p className={ERROR}>{errors.batch_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={LABEL}>Supplier</label>
                                        <select className={`${CONTROL} h-8`} value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)}>
                                            <option value="">Select supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {errors.supplier_id && <p className={ERROR}>{errors.supplier_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={LABEL}>Cost Price <span className="text-red-500">*</span></label>
                                        <Input type="number" step="0.01" min="0" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required />
                                        {errors.cost_price && <p className={ERROR}>{errors.cost_price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={LABEL}>Quantity <span className="text-red-500">*</span></label>
                                        <Input type="number" min="1" value={data.quantity} onChange={e => setData('quantity', e.target.value)} required />
                                        {errors.quantity && <p className={ERROR}>{errors.quantity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={LABEL}>Expiry Date <span className="text-red-500">*</span></label>
                                        <Input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} required />
                                        {errors.expiry_date && <p className={ERROR}>{errors.expiry_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={LABEL}>Received Date <span className="text-red-500">*</span></label>
                                        <Input type="date" value={data.received_date} onChange={e => setData('received_date', e.target.value)} required />
                                        {errors.received_date && <p className={ERROR}>{errors.received_date}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>Save Batch</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>FEFO Priority</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    {canViewCost && <TableHead className="text-right">Cost</TableHead>}
                                    {canViewCost && <TableHead className="text-right">Margin</TableHead>}
                                    <TableHead>Expiry</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.stock_batches.map((batch, index) => {
                                    const days = daysUntilExpiry(batch.expiry_date);
                                    const expired = isExpired(batch.expiry_date);
                                    const cost = parseFloat(batch.cost_price ?? '0');
                                    const margin = cost > 0
                                        ? ((parseFloat(product.selling_price) - cost) / cost * 100).toFixed(1)
                                        : '0.0';
                                    const isPriority = batch.id === priorityBatchId;
                                    const depleted = batch.quantity <= 0;

                                    return (
                                        <TableRow
                                            key={batch.id}
                                            className={`${isPriority ? 'bg-emerald-500/5' : ''} ${expired || depleted ? 'opacity-60' : ''}`}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-1.5 h-6 rounded-sm shrink-0 ${expired || days <= 30 ? 'bg-red-500' : days <= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <div>
                                                        <span className="text-sm font-bold text-foreground font-mono">#{batch.batch_number}</span>
                                                        <span className="block text-xs text-muted-foreground uppercase tracking-wider">
                                                            {isPriority
                                                                ? 'Priority dispense'
                                                                : expired
                                                                    ? 'Expired — write off'
                                                                    : depleted
                                                                        ? 'Depleted'
                                                                        : `${index + 1}. Next in queue`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {batch.supplier?.name || '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground">{batch.quantity}</TableCell>
                                            {canViewCost && <TableCell className="text-right text-muted-foreground">${batch.cost_price}</TableCell>}
                                            {canViewCost && <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">+{margin}%</TableCell>}
                                            <TableCell>
                                                <span className={`font-bold ${expired || days <= 30 ? 'text-red-600 dark:text-red-400' : days <= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                                    {new Date(batch.expiry_date).toLocaleDateString()}
                                                </span>
                                                <span className={`block text-xs font-bold uppercase tracking-wider ${expired || days <= 30 ? 'text-red-600 dark:text-red-400' : days <= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {expired ? 'Expired' : `${days} days`}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">{statusBadge(expired, days)}</TableCell>
                                            <TableCell className="text-right">
                                                {/* Nothing left to write off in an empty batch. */}
                                                <Button variant="outline" size="sm" disabled={depleted} onClick={() => openAdjustForm(batch)}>
                                                    Report Issue
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {product.stock_batches.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columnCount} className="text-center h-24 text-muted-foreground">
                                            No batches received yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Adjustment dialog */}
            <Dialog open={!!adjustingBatch} onOpenChange={(o: boolean) => !o && setAdjustingBatch(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Report Issue {adjustingBatch ? `(Batch #${adjustingBatch.batch_number})` : ''}
                        </DialogTitle>
                        <DialogDescription>
                            Deduct damaged, expired, missing, or mis-counted units from this batch.
                        </DialogDescription>
                    </DialogHeader>

                    {adjustingBatch && (
                        <form onSubmit={submitAdjustment} className="flex flex-col gap-4 mt-2">
                            <div className="space-y-2">
                                <label className={LABEL}>Quantity to Deduct <span className="text-red-500">*</span></label>
                                <Input
                                    type="number"
                                    max={adjustingBatch.quantity}
                                    min="1"
                                    value={adjustForm.data.quantity_change ? Math.abs(Number(adjustForm.data.quantity_change)) : ''}
                                    onChange={e => adjustForm.setData('quantity_change', e.target.value ? `-${e.target.value}` : '')}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Currently {adjustingBatch.quantity} in stock.</p>
                                {adjustForm.errors.quantity_change && <p className={ERROR}>{adjustForm.errors.quantity_change}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className={LABEL}>Reason <span className="text-red-500">*</span></label>
                                <select className={`${CONTROL} h-8`} value={adjustForm.data.reason} onChange={e => adjustForm.setData('reason', e.target.value)} required>
                                    <option value="damaged">Damaged Product</option>
                                    <option value="expired">Expired Product</option>
                                    <option value="missing">Missing / Lost</option>
                                    <option value="correction">Inventory Audit Correction</option>
                                </select>
                                {adjustForm.errors.reason && <p className={ERROR}>{adjustForm.errors.reason}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className={LABEL}>Notes (Optional)</label>
                                <textarea className={`${CONTROL} py-2`} rows={3} value={adjustForm.data.notes} onChange={e => adjustForm.setData('notes', e.target.value)} />
                                {adjustForm.errors.notes && <p className={ERROR}>{adjustForm.errors.notes}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setAdjustingBatch(null)}>Cancel</Button>
                                <Button type="submit" variant="destructive" disabled={adjustForm.processing}>Submit Report</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
