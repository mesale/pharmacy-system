import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, Plus, X, Search, Filter, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';

interface Product {
    id: number;
    name: string;
    barcode: string | null;
    unit: string;
    selling_price: string;
    reorder_level: number;
    requires_prescription: boolean;
    is_controlled: boolean;
    total_stock: number;
    sellable_stock: number;
    category: { id: number; name: string } | null;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    auth: any;
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
}

export default function Index({ auth, products, categories }: Props) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        name: '',
        barcode: '',
        unit: 'Pieces',
        selling_price: '',
        reorder_level: '10',
        requires_prescription: false,
        is_controlled: false,
        category_id: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // "none" is the sentinel for "All Categories" (Radix Select forbids an
        // empty-string item value). It must not be sent as a real category_id,
        // or the query filters to a category that cannot exist and returns nothing.
        const category_id = categoryFilter && categoryFilter !== 'none' ? categoryFilter : undefined;
        router.get(route('products.index'), { search, category_id }, { preserveState: true });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        // Map the "No Category" sentinel to empty so Laravel's nullable rule
        // accepts it; sending "none" fails the exists rule and the product is
        // silently never created.
        transform((d) => ({
            ...d,
            category_id: d.category_id === 'none' ? '' : d.category_id,
        }));
        post(route('products.store'), {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            }
        });
    };

    const currency = (val: string | number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    };

    return (
        <AdminLayout>
            <Head title="Inventory Stock" />

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory Stock</h2>
                        <p className="text-muted-foreground mt-1">Manage medicines, pricing, and stock levels.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={isCreating ? "outline" : "default"} 
                            onClick={() => setIsCreating(!isCreating)}
                        >
                            {isCreating ? (
                                <><X className="mr-2 h-4 w-4" /> Cancel</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> Add Product</>
                            )}
                        </Button>
                    </div>
                </div>

                {isCreating && (
                    <Card className="ring-emerald-500/30">
                        <CardHeader className="bg-emerald-500/5 pb-4">
                            <CardTitle className="text-emerald-700 dark:text-emerald-400 text-lg">New Product Registration</CardTitle>
                            <CardDescription>Enter the details of the new medication or item into the system.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submitCreate} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Product Name <span className="text-red-500">*</span></label>
                                        <Input type="text" placeholder="e.g. Paracetamol 500mg" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Barcode</label>
                                        <Input type="text" placeholder="Scan or enter barcode" value={data.barcode} onChange={e => setData('barcode', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Category</label>
                                        <Select value={data.category_id} onValueChange={v => setData('category_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Category</SelectItem>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Unit Measure</label>
                                        <Input type="text" placeholder="e.g. Boxes, Bottles, Pieces" value={data.unit} onChange={e => setData('unit', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Selling Price ($) <span className="text-red-500">*</span></label>
                                        <Input type="number" step="0.01" min="0" placeholder="0.00" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                                        {errors.selling_price && <p className="text-red-500 text-xs mt-1">{errors.selling_price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Reorder Alert Level</label>
                                        <Input type="number" min="0" value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2 flex items-center gap-6 pt-6">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="req_rx" checked={data.requires_prescription} onCheckedChange={(c) => setData('requires_prescription', !!c)} />
                                            <label htmlFor="req_rx" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Requires Prescription</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="ctrl_sub" checked={data.is_controlled} onCheckedChange={(c) => setData('is_controlled', !!c)} />
                                            <label htmlFor="ctrl_sub" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Controlled Substance</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" /> Save Product
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="text" placeholder="Search by product name or barcode..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="w-full sm:w-[200px]">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">All Categories</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                                <Filter className="h-4 w-4 mr-2" /> Filter
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock Available</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No products found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.data.map((product) => {
                                        // "Available" must mean stock that can actually be dispensed:
                                        // in date and on hand. total_stock includes expired units, so
                                        // using it here overstated what a worker could sell. withSum
                                        // yields null when a product has no batches at all.
                                        const sellable = product.sellable_stock ?? 0;
                                        const onHand = product.total_stock ?? 0;
                                        const expired = Math.max(0, onHand - sellable);
                                        const isLowStock = sellable <= product.reorder_level;
                                        const isOutOfStock = sellable <= 0;

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{product.barcode || 'No Barcode'}</div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {product.category?.name || 'Uncategorized'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {currency(product.selling_price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className={`font-bold inline-flex items-center gap-1 ${
                                                        isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                        {isLowStock && <AlertCircle className="h-3 w-3" />}
                                                        {sellable} {product.unit}
                                                    </div>
                                                    {expired > 0 && (
                                                        <div className="text-[11px] text-muted-foreground mt-0.5">
                                                            +{expired} expired
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {product.requires_prescription && <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Rx Required</Badge>}
                                                        {product.is_controlled && <Badge variant="destructive">Controlled</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button render={<Link href={route('products.show', product.id)} />} variant="outline" size="sm">
                                                        Manage Stock
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        
                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center border-t p-4">
                                <div className="flex items-center gap-1">
                                    {products.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            render={<Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />}
                                            disabled={!link.url}
                                            className={link.url ? "" : "opacity-50 pointer-events-none"}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
