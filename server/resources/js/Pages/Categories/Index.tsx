import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Categories</h2>}
        >
            <Head title="Categories" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Product Categories</h3>
                            {isAdmin && (
                                <Button onClick={() => setIsCreating(!isCreating)}>
                                    {isCreating ? 'Cancel' : 'Add Category'}
                                </Button>
                            )}
                        </div>

                        {isCreating && (
                            <form onSubmit={submit} className="mb-8 p-4 bg-gray-50 rounded border flex items-end gap-4">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700">Category Name *</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <Button type="submit" disabled={processing}>Save</Button>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Products Count</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{category.products_count}</td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No categories found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

