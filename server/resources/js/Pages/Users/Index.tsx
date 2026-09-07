import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';

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

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-transparent">
                        
                        <div className="flex flex-wrap justify-between items-center mb-gap-md gap-4">
                            <div className="flex items-center gap-gap-sm text-text-primary">
                                <span className="material-symbols-outlined">group</span>
                                <h3 className="text-lg font-bold uppercase tracking-wider">Staff Management</h3>
                            </div>
                            <button 
                                onClick={isCreating || editingUser ? closeForm : openCreate}
                                className={`font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-1 transition-colors border ${isCreating || editingUser ? 'bg-surface-overlay text-text-secondary border-border-strong hover:text-primary' : 'bg-primary text-on-primary border-primary hover:bg-primary-hover'}`}
                            >
                                <span className="material-symbols-outlined text-sm">{isCreating || editingUser ? 'close' : 'add'}</span>
                                {isCreating || editingUser ? 'Cancel' : 'Add Staff Member'}
                            </button>
                        </div>

                        {(isCreating || editingUser) && (
                            <form onSubmit={isCreating ? submitCreate : submitEdit} className="mb-gap-lg p-gap-md bg-surface-overlay border border-primary">
                                <h4 className="text-md font-bold text-text-primary uppercase tracking-wider mb-gap-md">{isCreating ? 'New Staff Member' : `Edit ${editingUser.name}`}</h4>
                                <div className="grid grid-cols-1 gap-gap-md sm:grid-cols-2 lg:grid-cols-2 mb-gap-md">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Full Name *</label>
                                        <input type="text" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-status-critical text-xs mt-1 font-bold">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address *</label>
                                        <input type="email" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                        {errors.email && <p className="text-status-critical text-xs mt-1 font-bold">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">System Role *</label>
                                        <select className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm" value={data.role} onChange={e => setData('role', e.target.value)} required>
                                            <option value="worker">Worker (POS Only)</option>
                                            <option value="admin">Administrator (Full Access)</option>
                                        </select>
                                        {errors.role && <p className="text-status-critical text-xs mt-1 font-bold">{errors.role}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-gap-md sm:grid-cols-2 lg:grid-cols-2 mb-gap-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                                            {isCreating ? 'Password *' : 'New Password (leave blank to keep current)'}
                                        </label>
                                        <input type="password" placeholder="••••••••" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm placeholder:text-text-muted" value={data.password} onChange={e => setData('password', e.target.value)} required={isCreating} />
                                        {errors.password && <p className="text-status-critical text-xs mt-1 font-bold">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                                            {isCreating ? 'Confirm Password *' : 'Confirm New Password'}
                                        </label>
                                        <input type="password" placeholder="••••••••" className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm placeholder:text-text-muted" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={isCreating || data.password.length > 0} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-gap-sm">
                                    <button type="button" onClick={closeForm} className="bg-surface-base text-text-secondary border border-border-strong hover:text-primary transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm px-6 py-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">save</span> {isCreating ? 'Create Account' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto border border-border-subtle bg-surface-base">
                            <table className="min-w-full divide-y divide-border-subtle">
                                <thead className="bg-surface-container">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Email</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Added On</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle bg-surface-base">
                                    {users.map((user) => {
                                        const isCurrentUser = user.id === auth.user.id;
                                        const role = user.roles[0]?.name || 'Unknown';
                                        
                                        return (
                                            <tr key={user.id} className={`${isCurrentUser ? 'bg-surface-container-high' : ''} hover:bg-surface-container-low transition-colors`}>
                                                <td className="px-gap-md py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm font-bold text-text-primary">{user.name}</div>
                                                        {isCurrentUser && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm border border-primary bg-primary/10 text-primary uppercase tracking-wider">You</span>}
                                                    </div>
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                                <td className="px-gap-md py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-sm border uppercase tracking-wider ${role === 'admin' ? 'bg-status-warning-bg text-status-warning border-status-warning' : 'bg-surface-overlay text-text-secondary border-border-strong'}`}>
                                                        {role}
                                                    </span>
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-sm text-text-muted">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-gap-md py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-gap-xs">
                                                        <button onClick={() => openEdit(user)} className="text-xs font-bold text-primary uppercase tracking-wider border border-primary px-2 py-1 hover:bg-primary hover:text-on-primary transition-colors">
                                                            EDIT
                                                        </button>
                                                        {!isCurrentUser && (
                                                            <button onClick={() => deleteUser(user)} className="text-xs font-bold text-status-critical uppercase tracking-wider border border-status-critical px-2 py-1 hover:bg-status-critical hover:text-on-primary transition-colors">
                                                                REMOVE
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-gap-md py-8 text-center text-text-muted flex-col items-center flex">
                                                <span className="material-symbols-outlined text-4xl mb-2">group</span>
                                                No staff members found.
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
