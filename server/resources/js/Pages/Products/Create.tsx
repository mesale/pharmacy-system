import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

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

export default function Create({ auth, categories, product }: Props) {
    const isEditing = !!product;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: product?.name ?? '',
        category_id: product?.category_id ?? '',
        barcode: product?.barcode ?? '',
        unit: product?.unit ?? 'tablet',
        selling_price: product?.selling_price ?? '',
        reorder_level: product?.reorder_level ?? 10,
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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{isEditing ? 'Edit' : 'Add'} Product</h2>}
        >
            <Head title={isEditing ? 'Edit Product' : 'Add Product'} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        <option value="">None</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono" value={data.barcode} onChange={e => setData('barcode', e.target.value)} placeholder="Scan or enter barcode" />
                                    {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.unit} onChange={e => setData('unit', e.target.value)}>
                                        <option value="tablet">Tablet</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="box">Box</option>
                                        <option value="strip">Strip</option>
                                        <option value="tube">Tube</option>
                                        <option value="vial">Vial</option>
                                        <option value="ampoule">Ampoule</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Selling Price *</label>
                                    <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                                    {errors.selling_price && <p className="text-red-500 text-xs mt-1">{errors.selling_price}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
                                    <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.reorder_level} onChange={e => setData('reorder_level', parseInt(e.target.value))} />
                                </div>

                                <div className="sm:col-span-2 flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm" checked={data.requires_prescription} onChange={e => setData('requires_prescription', e.target.checked)} />
                                        <span className="text-sm text-gray-700">Requires Prescription</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded border-gray-300 text-red-600 shadow-sm" checked={data.is_controlled} onChange={e => setData('is_controlled', e.target.checked)} />
                                        <span className="text-sm text-gray-700">Controlled Substance</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{isEditing ? 'Update' : 'Create'} Product</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
