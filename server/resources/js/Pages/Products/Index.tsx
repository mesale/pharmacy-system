import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

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

    const isAdmin = auth.user?.roles?.includes('admin');

    return (
        <AdminLayout>
            <Head title="Products" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-transparent">

                        <div className="flex flex-wrap justify-between items-center mb-gap-md gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-gap-sm">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="bg-surface-overlay border border-border-strong text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary text-sm py-1.5 pl-9 pr-3"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="bg-surface-overlay border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary text-sm py-1.5 pl-3 pr-8"
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button type="submit" className="bg-surface-overlay border border-border-strong text-text-secondary hover:text-primary hover:border-primary transition-colors text-sm font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">filter_alt</span> Filter
                                </button>
                            </form>
                            {isAdmin && (
                                <button onClick={() => setIsCreating(!isCreating)} className={`font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-1 transition-colors border ${isCreating ? 'bg-surface-overlay text-text-secondary border-border-strong hover:text-primary' : 'bg-primary text-on-primary border-primary hover:bg-primary-hover'}`}>
                                    <span className="material-symbols-outlined text-sm">{isCreating ? 'close' : 'add'}</span> {isCreating ? 'Cancel' : 'Add Product'}
                                </button>
                            )}
                        </div>

                        {isCreating && (
                            <form onSubmit={submitCreate} className="mb-gap-lg p-gap-md bg-surface-overlay border border-primary">
                                <h4 className="text-md font-bold text-text-primary uppercase tracking-wider mb-gap-md">New Product Entry</h4>
                                <div className="grid grid-cols-1 gap-gap-md sm:grid-cols-3 mb-gap-md">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Product Name *</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-status-critical text-xs mt-1 font-bold">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Category</label>
                                        <select className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                            <option value="">No Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-status-critical text-xs mt-1 font-bold">{errors.category_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Barcode</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.barcode} onChange={e => setData('barcode', e.target.value)} />
                                        {errors.barcode && <p className="text-status-critical text-xs mt-1 font-bold">{errors.barcode}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Selling Price *</label>
                                        <input type="number" step="0.01" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                                        {errors.selling_price && <p className="text-status-critical text-xs mt-1 font-bold">{errors.selling_price}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Unit</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.unit} onChange={e => setData('unit', e.target.value)} placeholder="e.g. Tablets, Box, Bottle" />
                                        {errors.unit && <p className="text-status-critical text-xs mt-1 font-bold">{errors.unit}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Reorder Level</label>
                                        <input type="number" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} />
                                        {errors.reorder_level && <p className="text-status-critical text-xs mt-1 font-bold">{errors.reorder_level}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-gap-md mb-gap-lg border-t border-border-strong pt-gap-md">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="bg-surface-base border-border-strong text-primary focus:ring-primary" checked={data.requires_prescription} onChange={e => setData('requires_prescription', e.target.checked)} />
                                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Requires Prescription</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="bg-surface-base border-border-strong text-primary focus:ring-primary" checked={data.is_controlled} onChange={e => setData('is_controlled', e.target.checked)} />
                                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Controlled Substance</span>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-gap-sm">
                                    <button type="button" onClick={() => setIsCreating(false)} className="bg-surface-base text-text-secondary border border-border-strong hover:text-primary transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">save</span> Create Product
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto border border-border-subtle bg-surface-base rounded-lg shadow-sm">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container-low">
                                    <tr>
                                        <th className="px-gap-sm py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                        <th className="px-gap-sm py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Category</th>
                                        <th className="px-gap-sm py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Barcode</th>
                                        <th className="px-gap-sm py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Price</th>
                                        <th className="px-gap-sm py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Stock</th>
                                        <th className="px-gap-sm py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Flags</th>
                                        <th className="px-gap-sm py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {products.data.map(product => {
                                        const lowStock = product.total_stock <= product.reorder_level;
                                        return (
                                            <tr key={product.id} className={`${lowStock ? 'bg-status-warning-bg/10' : ''} hover:bg-surface-container-low transition-colors`}>
                                                <td className="px-gap-sm py-3 whitespace-nowrap">
                                                    <Link href={route('products.show', product.id)} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                                        {product.name}
                                                    </Link>
                                                </td>
                                                <td className="px-gap-sm py-3 whitespace-nowrap text-sm text-text-secondary">
                                                    {product.category?.name || '—'}
                                                </td>
                                                <td className="px-gap-sm py-3 whitespace-nowrap text-sm text-text-muted font-mono">
                                                    {product.barcode || '—'}
                                                </td>
                                                <td className="px-gap-sm py-3 whitespace-nowrap text-sm text-right font-bold text-text-primary">
                                                    ${product.selling_price}
                                                </td>
                                                <td className={`px-gap-sm py-3 whitespace-nowrap text-sm text-right font-bold ${lowStock ? 'text-status-warning' : 'text-status-success'}`}>
                                                    {product.total_stock ?? 0}
                                                </td>
                                                <td className="px-gap-sm py-3 whitespace-nowrap text-center">
                                                    {product.requires_prescription && (
                                                        <span className="px-1.5 py-0.5 text-xs font-bold rounded-sm bg-status-info-bg text-status-info border border-status-info uppercase tracking-wider mr-1">Rx</span>
                                                    )}
                                                    {product.is_controlled && (
                                                        <span className="px-1.5 py-0.5 text-xs font-bold rounded-sm bg-status-critical-bg text-status-critical border border-status-critical uppercase tracking-wider">Ctrl</span>
                                                    )}
                                                </td>
                                                <td className="px-gap-sm py-3 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-gap-xs">
                                                        <Link href={route('products.show', product.id)} className="text-xs font-bold text-primary uppercase tracking-wider border border-primary px-2 py-1 hover:bg-primary hover:text-on-primary transition-colors">
                                                            VIEW
                                                        </Link>
                                                        {isAdmin && (
                                                            <Link href={route('products.edit', product.id)} className="text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-strong px-2 py-1 hover:border-primary hover:text-primary transition-colors">
                                                                EDIT
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {products.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-gap-sm py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">medication</span>
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center gap-1 mt-gap-md">
                                {products.links.map((link: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm font-bold border transition-colors ${link.active ? 'bg-primary text-on-primary border-primary' : 'bg-surface-overlay text-text-secondary border-border-strong hover:bg-surface-container-high'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
