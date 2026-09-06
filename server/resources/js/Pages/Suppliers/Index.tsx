import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Supplier {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    stock_batches_count: number;
}

interface Props {
    auth: any;
    suppliers: Supplier[];
}

export default function Index({ auth, suppliers }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const isAdmin = auth.user?.roles?.includes('admin');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => {
                setIsCreating(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Suppliers</h2>}
        >
            <Head title="Suppliers" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Suppliers</h3>
                            {isAdmin && (
                                <Button onClick={() => setIsCreating(!isCreating)}>
                                    {isCreating ? 'Cancel' : 'Add Supplier'}
                                </Button>
                            )}
                        </div>

                        {isCreating && (
                            <form onSubmit={submit} className="mb-8 p-4 bg-gray-50 rounded border">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.address} onChange={e => setData('address', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>Save Supplier</Button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Batches Provided</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{supplier.phone || 'No phone'}</div>
                                                <div>{supplier.email || 'No email'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{supplier.stock_batches_count}</td>
                                        </tr>
                                    ))}
                                    {suppliers.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No suppliers found.</td>
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

