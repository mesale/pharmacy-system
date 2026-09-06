import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Index({ auth, users, permissions }: { auth: any, users: any[], permissions: any[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsCreating(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">User Management</h2>}
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                            <Button onClick={() => setIsCreating(!isCreating)}>
                                {isCreating ? 'Cancel' : 'Add New Worker'}
                            </Button>
                        </div>

                        {isCreating && (
                            <form onSubmit={submit} className="mb-8 p-4 bg-gray-50 rounded border">
                                <h4 className="text-md font-medium mb-4">Create Worker</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={processing}>Save Worker</Button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.roles.map((r: any) => r.name).join(', ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Button variant="outline" size="sm" className="mr-2 text-indigo-600">Edit Permissions</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

