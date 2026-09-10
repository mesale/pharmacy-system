import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { History, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Audit Log</h2>
                        <p className="text-muted-foreground mt-1">Track all manual inventory adjustments and discrepancy resolutions.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Stock Adjustment Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Product & Batch</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Qty Change</TableHead>
                                    <TableHead className="w-[200px]">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adjustments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No adjustments logged yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adjustments.data.map((adj) => (
                                        <TableRow key={adj.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {new Date(adj.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {adj.user.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{adj.product.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">Batch: {adj.batch.batch_number}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    adj.reason === 'damaged' ? 'destructive' :
                                                    adj.reason === 'expired' ? 'secondary' :
                                                    adj.reason === 'missing' ? 'secondary' : 'outline'
                                                }>
                                                    {adj.reason}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={`inline-flex items-center gap-1 font-bold ${
                                                    adj.quantity_change < 0 ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                    {adj.quantity_change < 0 ? (
                                                        <ArrowDownRight className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    )}
                                                    {Math.abs(adj.quantity_change)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={adj.notes || ''}>
                                                {adj.notes || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
