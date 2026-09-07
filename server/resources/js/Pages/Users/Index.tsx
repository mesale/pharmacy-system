import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    created_at: string;
}

interface Props {
    auth: any;
    users: User[];
}

export default function Index({ auth, users }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'worker',
    });

    const openCreate = () => {
        setEditingUser(null);
        reset();
        setIsCreating(true);
    };

    const openEdit = (user: User) => {
        setIsCreating(false);
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || 'worker',
        });
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingUser(null);
        reset();
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => closeForm(),
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        patch(route('users.update', editingUser.id), {
            onSuccess: () => closeForm(),
        });
    };

    const deleteUser = (user: User) => {
        if (confirm(`Are you sure you want to remove ${user.name}? This cannot be undone.`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Staff Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
                            <Button onClick={isCreating || editingUser ? closeForm : openCreate}>
                                {isCreating || editingUser ? 'Cancel' : 'Add Staff Member'}
                            </Button>
                        </div>

                        {(isCreating || editingUser) && (
                            <form onSubmit={isCreating ? submitCreate : submitEdit} className="mb-8 p-6 bg-gray-50 rounded border">
                                <h4 className="text-md font-medium mb-4">{isCreating ? 'New Staff Member' : `Edit ${editingUser.name}`}</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">System Role *</label>
                                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.role} onChange={e => setData('role', e.target.value)} required>
                                            <option value="worker">Worker (POS Only)</option>
                                            <option value="admin">Administrator (Full Access)</option>
                                        </select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {isCreating ? 'Password *' : 'New Password (leave blank to keep current)'}
                                        </label>
                                        <input type="password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.password} onChange={e => setData('password', e.target.value)} required={isCreating} />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {isCreating ? 'Confirm Password *' : 'Confirm New Password'}
                                        </label>
                                        <input type="password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={isCreating || data.password.length > 0} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                                    <Button type="submit" disabled={processing}>{isCreating ? 'Create Account' : 'Save Changes'}</Button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added On</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const isCurrentUser = user.id === auth.user.id;
                                        const role = user.roles[0]?.name || 'Unknown';
                                        
                                        return (
                                            <tr key={user.id} className={isCurrentUser ? 'bg-blue-50/50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        {isCurrentUser && <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 uppercase">You</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                                                        {!isCurrentUser && (
                                                            <Button variant="destructive" size="sm" onClick={() => deleteUser(user)}>Remove</Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No staff members found.</td>
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
