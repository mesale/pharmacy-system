import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('products.index'), { search, category_id: categoryFilter || undefined }, { preserveState: true });
    };

    const isAdmin = auth.user?.roles?.includes('admin');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">

                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="rounded-md border-gray-300 shadow-sm text-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <select
                                    className="rounded-md border-gray-300 shadow-sm text-sm"
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <Button type="submit" variant="outline" size="sm">Search</Button>
                            </form>
                            {isAdmin && (
                                <Link href={route('products.store')} method="get">
                                    <Button>Add Product</Button>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Flags</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.map(product => {
                                        const lowStock = product.total_stock <= product.reorder_level;
                                        return (
                                            <tr key={product.id} className={lowStock ? 'bg-red-50' : ''}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Link href={route('products.show', product.id)} className="text-sm font-medium text-indigo-600 hover:underline">
                                                        {product.name}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {product.category?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {product.barcode || '—'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                                                    ${product.selling_price}
                                                </td>
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                    {product.total_stock ?? 0}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    {product.requires_prescription && (
                                                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 mr-1">Rx</span>
                                                    )}
                                                    {product.is_controlled && (
                                                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">Ctrl</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                    <Link href={route('products.show', product.id)}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {products.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No products found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center gap-1 mt-4">
                                {products.links.map((link: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
