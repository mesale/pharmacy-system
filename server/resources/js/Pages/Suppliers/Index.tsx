import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

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
        <AdminLayout>
            <Head title="Suppliers" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-surface-raised border border-border-subtle p-gap-md shadow">
                        
                        <div className="flex justify-between items-center mb-gap-md">
                            <div className="flex items-center gap-gap-sm text-text-primary">
                                <span className="material-symbols-outlined">hub</span>
                                <h3 className="text-lg font-bold uppercase tracking-wider">Suppliers</h3>
                            </div>
                            {isAdmin && (
                                <button 
                                    onClick={() => setIsCreating(!isCreating)}
                                    className={`font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-1 transition-colors border ${isCreating ? 'bg-surface-overlay text-text-secondary border-border-strong hover:text-primary' : 'bg-primary text-on-primary border-primary hover:bg-primary-hover'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{isCreating ? 'close' : 'add'}</span>
                                    {isCreating ? 'Cancel' : 'Add Supplier'}
                                </button>
                            )}
                        </div>

                        {isCreating && (
                            <form onSubmit={submit} className="mb-gap-lg p-gap-md bg-surface-overlay border border-primary">
                                <div className="grid grid-cols-1 gap-gap-md sm:grid-cols-2 lg:grid-cols-4 mb-gap-md">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Name *</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-status-critical text-xs mt-1 font-bold">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Phone</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Email</label>
                                        <input type="email" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Address</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.address} onChange={e => setData('address', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={processing} className="bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">save</span> Save Supplier
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto border border-border-subtle bg-surface-base">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Contact</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Batches Provided</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm font-bold text-text-primary">{supplier.name}</td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <div className="flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-sm">phone</span> {supplier.phone || '—'}</div>
                                                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">email</span> {supplier.email || '—'}</div>
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right font-bold text-primary">{supplier.stock_batches_count}</td>
                                        </tr>
                                    ))}
                                    {suppliers.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-gap-md py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">hub</span>
                                                No suppliers found.
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

