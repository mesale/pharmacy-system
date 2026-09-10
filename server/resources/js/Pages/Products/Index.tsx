import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, Plus, X, Search, Filter, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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

    const { data, setData, post, processing, errors, reset } = useForm({
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
        router.get(route('products.index'), { search, category_id: categoryFilter || undefined }, { preserveState: true });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Stock</h2>
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
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 pb-4">
                            <CardTitle className="text-emerald-800 text-lg">New Product Registration</CardTitle>
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
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Unit Measure</label>
                                        <Input type="text" placeholder="e.g. Boxes, Bottles, Pieces" value={data.unit} onChange={e => setData('unit', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Selling Price ($) <span className="text-red-500">*</span></label>
                                        <Input type="number" step="0.01" min="0" placeholder="0.00" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
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
                                        const isLowStock = product.total_stock <= product.reorder_level;
                                        const isOutOfStock = product.total_stock <= 0;
                                        
                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
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
                                                        isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
                                                    }`}>
                                                        {isLowStock && <AlertCircle className="h-3 w-3" />}
                                                        {product.total_stock} {product.unit}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {product.requires_prescription && <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Rx Required</Badge>}
                                                        {product.is_controlled && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">Controlled</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={route('products.show', product.id)}>
                                                            Manage Stock
                                                        </Link>
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
                                            asChild
                                            disabled={!link.url}
                                            className={link.url ? "" : "opacity-50 pointer-events-none"}
                                        >
                                            <Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
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
