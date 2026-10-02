import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ShoppingCart, Printer, PackageCheck } from 'lucide-react';

interface Suggestion {
    product_id: number;
    product_name: string;
    barcode: string | null;
    category: string;
    current_stock: number;
    reorder_level: number;
    suggested_qty: number;
    supplier_name: string;
}

interface Props {
    auth: any;
    groupedSuggestions: Record<string, Suggestion[]>;
}

export default function Index({ auth, groupedSuggestions }: Props) {
    const printOrder = () => window.print();
    const hasSuggestions = Object.keys(groupedSuggestions).length > 0;

    return (
        <AdminLayout>
            <Head title="Purchasing & Restock" />

            <div className="flex flex-col gap-6 w-full pb-12">
                {/* Print-only header */}
                <div className="hidden print:block mb-8">
                    <h1 className="text-3xl font-bold">Purchase Order</h1>
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                    <hr className="my-4 border-black" />
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 mt-6 print:hidden">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-7 w-7 text-muted-foreground" />
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Purchasing &amp; Restock</h2>
                            <p className="text-muted-foreground mt-1">Suggested reorders for products below their threshold.</p>
                        </div>
                    </div>
                    {hasSuggestions && (
                        <Button onClick={printOrder}>
                            <Printer className="mr-2 h-4 w-4" /> Print Purchase Orders
                        </Button>
                    )}
                </div>

                {!hasSuggestions && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <PackageCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-xl font-semibold text-foreground">Inventory is Healthy</h3>
                            <p className="text-muted-foreground mt-2">No products are currently below their reorder threshold.</p>
                        </CardContent>
                    </Card>
                )}

                {Object.entries(groupedSuggestions).map(([supplier, items]) => (
                    <Card key={supplier} className="print:break-inside-avoid">
                        <CardHeader>
                            <CardTitle className="text-lg">Vendor: {supplier}</CardTitle>
                            <CardDescription>Total items to order: {items.length}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Barcode</TableHead>
                                        <TableHead className="text-right">Current Stock</TableHead>
                                        <TableHead className="text-right">Reorder Lvl</TableHead>
                                        <TableHead className="text-right">Suggested Order Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.product_id}>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{item.product_name}</div>
                                                <div className="text-xs text-muted-foreground">{item.category}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-muted-foreground">{item.barcode || '—'}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600 dark:text-red-400">{item.current_stock}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.reorder_level}</TableCell>
                                            <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">{item.suggested_qty}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Force clean black-on-white when printing, regardless of the active theme. */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; }
                    nav, aside, header, button { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    * { background: transparent !important; color: #000 !important; box-shadow: none !important; border-color: #999 !important; }
                }
            `}} />
        </AdminLayout>
    );
}
