import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent } from '@/Components/ui/card';

interface Category {
    id: number;
    name: string;
}

interface Props {
    auth: any;
    categories: Category[];
    product?: {
        id: number;
        name: string;
        category_id: number | null;
        barcode: string | null;
        unit: string;
        selling_price: string;
        reorder_level: number;
        requires_prescription: boolean;
        is_controlled: boolean;
    };
}

const LABEL = 'text-sm font-medium leading-none';
const CONTROL =
    'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors ' +
    'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50';
const ERROR = 'text-red-500 text-xs mt-1';

export default function Create({ auth, categories, product }: Props) {
    const isEditing = !!product;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: product?.name ?? '',
        category_id: product?.category_id ?? '',
        barcode: product?.barcode ?? '',
        unit: product?.unit ?? 'tablet',
        selling_price: product?.selling_price ?? '',
        // Held as a string so that clearing the field yields '' rather than the
        // NaN that parseInt('') produced, which was then submitted as-is.
        reorder_level: String(product?.reorder_level ?? 10),
        requires_prescription: product?.requires_prescription ?? false,
        is_controlled: product?.is_controlled ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('products.update', product!.id));
        } else {
            post(route('products.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? 'Edit Product' : 'Add Product'} />

            <div className="flex flex-col gap-6 w-full max-w-3xl pb-12">
                <div className="mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{isEditing ? 'Edit' : 'Add'} Product</h2>
                    <p className="text-muted-foreground mt-1">
                        {isEditing ? 'Update the catalogue details for this product.' : 'Register a new medication or item in the catalogue.'}
                    </p>
                </div>

                <Card>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <label className={LABEL}>Product Name <span className="text-red-500">*</span></label>
                                    <Input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className={ERROR}>{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className={LABEL}>Category</label>
                                    <select className={CONTROL} value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        <option value="">None</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className={ERROR}>{errors.category_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className={LABEL}>Barcode</label>
                                    <Input type="text" className="font-mono" value={data.barcode} onChange={e => setData('barcode', e.target.value)} placeholder="Scan or enter barcode" />
                                    {errors.barcode && <p className={ERROR}>{errors.barcode}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className={LABEL}>Unit</label>
                                    <select className={CONTROL} value={data.unit} onChange={e => setData('unit', e.target.value)}>
                                        <option value="tablet">Tablet</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="box">Box</option>
                                        <option value="strip">Strip</option>
                                        <option value="tube">Tube</option>
                                        <option value="vial">Vial</option>
                                        <option value="ampoule">Ampoule</option>
                                    </select>
                                    {errors.unit && <p className={ERROR}>{errors.unit}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className={LABEL}>Selling Price <span className="text-red-500">*</span></label>
                                    <Input type="number" step="0.01" min="0" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                                    {errors.selling_price && <p className={ERROR}>{errors.selling_price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className={LABEL}>Reorder Level</label>
                                    <Input type="number" min="0" value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} />
                                    {errors.reorder_level && <p className={ERROR}>{errors.reorder_level}</p>}
                                </div>

                                <div className="sm:col-span-2 flex flex-wrap gap-6 border-t border-border pt-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="req_rx" checked={data.requires_prescription} onCheckedChange={(c) => setData('requires_prescription', !!c)} />
                                        <label htmlFor="req_rx" className="text-sm font-medium leading-none cursor-pointer">Requires Prescription</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="ctrl" checked={data.is_controlled} onCheckedChange={(c) => setData('is_controlled', !!c)} />
                                        <label htmlFor="ctrl" className="text-sm font-medium leading-none cursor-pointer">Controlled Substance</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{isEditing ? 'Update' : 'Create'} Product</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
