import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

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

const INPUT_CLASS =
    'mt-1 block w-full bg-white shadow-sm rounded-lg border border-gray-300 text-gray-900 ' +
    'placeholder:text-gray-500 focus:border-emerald-600 focus:ring-1 focus:ring-primary py-2 px-3 text-sm';
const LABEL_CLASS =
    'block text-xs font-bold text-gray-600 uppercase tracking-wider';
const ERROR_CLASS = 'text-red-600 text-xs mt-1 font-bold';

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

            <div className="py-6">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {isEditing ? 'Edit' : 'Add'} Product
                    </h2>
                    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 shadow">
                        <form onSubmit={submit} className="space-y-gap-lg">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={LABEL_CLASS}>Product Name *</label>
                                    <input type="text" className={INPUT_CLASS} value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className={ERROR_CLASS}>{errors.name}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Category</label>
                                    <select className={INPUT_CLASS} value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        <option value="">None</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className={ERROR_CLASS}>{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Barcode</label>
                                    <input type="text" className={`${INPUT_CLASS} font-mono`} value={data.barcode} onChange={e => setData('barcode', e.target.value)} placeholder="Scan or enter barcode" />
                                    {errors.barcode && <p className={ERROR_CLASS}>{errors.barcode}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Unit</label>
                                    <select className={INPUT_CLASS} value={data.unit} onChange={e => setData('unit', e.target.value)}>
                                        <option value="tablet">Tablet</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="box">Box</option>
                                        <option value="strip">Strip</option>
                                        <option value="tube">Tube</option>
                                        <option value="vial">Vial</option>
                                        <option value="ampoule">Ampoule</option>
                                    </select>
                                    {errors.unit && <p className={ERROR_CLASS}>{errors.unit}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Selling Price *</label>
                                    <input type="number" step="0.01" min="0" className={INPUT_CLASS} value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                                    {errors.selling_price && <p className={ERROR_CLASS}>{errors.selling_price}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Reorder Level</label>
                                    <input type="number" min="0" className={INPUT_CLASS} value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} />
                                    {errors.reorder_level && <p className={ERROR_CLASS}>{errors.reorder_level}</p>}
                                </div>

                                <div className="sm:col-span-2 flex gap-6 border-t border-gray-300 pt-gap-md">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="bg-white shadow-sm rounded-lg border-gray-300 text-emerald-600 focus:ring-primary" checked={data.requires_prescription} onChange={e => setData('requires_prescription', e.target.checked)} />
                                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Requires Prescription</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="bg-white shadow-sm rounded-lg border-gray-300 text-red-600 focus:ring-status-critical" checked={data.is_controlled} onChange={e => setData('is_controlled', e.target.checked)} />
                                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Controlled Substance</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{isEditing ? 'Update' : 'Create'} Product</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
