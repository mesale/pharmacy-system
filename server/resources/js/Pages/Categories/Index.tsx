import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    products_count: number;
}

interface Props {
    auth: any;
    categories: Category[];
}

export default function Index({ auth, categories }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const isAdmin = auth.user?.roles?.includes('admin');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                setIsCreating(false);
                reset();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Categories" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-transparent">
                        
                        <div className="flex flex-wrap justify-between items-center mb-gap-md gap-4">
                            <div className="flex items-center gap-gap-sm text-text-primary">
                                <span className="material-symbols-outlined">category</span>
                                <h3 className="text-lg font-bold uppercase tracking-wider">Product Categories</h3>
                            </div>
                            {isAdmin && (
                                <button 
                                    onClick={() => setIsCreating(!isCreating)}
                                    className={`font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-1 transition-colors border ${isCreating ? 'bg-surface-overlay text-text-secondary border-border-strong hover:text-primary' : 'bg-primary text-on-primary border-primary hover:bg-primary-hover'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{isCreating ? 'close' : 'add'}</span>
                                    {isCreating ? 'Cancel' : 'Add Category'}
                                </button>
                            )}
                        </div>

                        {isCreating && (
                            <form onSubmit={submit} className="mb-gap-lg p-gap-md bg-surface-overlay border border-primary flex flex-col sm:flex-row sm:items-end items-stretch gap-gap-md">
                                <div className="flex-grow">
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Category Name *</label>
                                    <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-status-critical text-xs mt-1 font-bold">{errors.name}</p>}
                                </div>
                                <button type="submit" disabled={processing} className="bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2 h-[42px] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">save</span> Save
                                </button>
                            </form>
                        )}

                        <div className="overflow-x-auto border border-border-subtle bg-surface-base">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">ID</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Products Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-text-muted font-mono">{category.id}</td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm font-bold text-text-primary">{category.name}</td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right font-bold text-primary">{category.products_count}</td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-gap-md py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">category</span>
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

