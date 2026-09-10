import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, Plus, X, Save, Pencil, Trash2, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserObj {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: { name: string }[];
}

interface Props {
    auth: any;
    users: UserObj[];
}

export default function Index({ auth, users }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<UserObj | null>(null);
    const isAdmin = auth.user?.roles?.includes('admin');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'worker',
    });

    const closeForm = () => {
        setIsCreating(false);
        setEditingUser(null);
        reset();
        clearErrors();
    };

    const openEdit = (user: UserObj) => {
        setIsCreating(false);
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || 'worker',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => closeForm(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => closeForm(),
            });
        }
    };

    const deleteUser = (user: UserObj) => {
        if (confirm(`Are you sure you want to completely remove ${user.name}? This action cannot be undone.`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Staff Accounts" />

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Staff Accounts</h2>
                        <p className="text-muted-foreground mt-1">Manage system access, worker credentials, and roles.</p>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={isCreating ? "outline" : "default"} 
                                onClick={() => {
                                    if (isCreating) { closeForm(); } 
                                    else { setEditingUser(null); setIsCreating(true); reset(); }
                                }}
                            >
                                {isCreating ? (
                                    <><X className="mr-2 h-4 w-4" /> Cancel</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Add Staff Member</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {(isCreating || editingUser) && (
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 pb-4">
                            <CardTitle className="text-emerald-800 text-lg">
                                {isCreating ? 'Provision New Account' : `Edit Account: ${editingUser?.name}`}
                            </CardTitle>
                            <CardDescription>
                                {isCreating ? 'Set up a new system user with their appropriate role.' : 'Update user details, role, or reset their password.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Full Name <span className="text-red-500">*</span></label>
                                        <Input type="text" placeholder="John Doe" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Email Address <span className="text-red-500">*</span></label>
                                        <Input type="email" placeholder="john@example.com" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">System Role <span className="text-red-500">*</span></label>
                                        <Select value={data.role} onValueChange={v => setData('role', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="worker">Worker (Checkout & Stock)</SelectItem>
                                                <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            {isCreating ? 'Password *' : 'New Password (leave blank to keep)'}
                                        </label>
                                        <Input type="password" placeholder="••••••••" value={data.password} onChange={e => setData('password', e.target.value)} required={isCreating} />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            {isCreating ? 'Confirm Password *' : 'Confirm New Password'}
                                        </label>
                                        <Input type="password" placeholder="••••••••" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={isCreating || data.password.length > 0} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                                    <Button type="button" variant="outline" onClick={closeForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" /> {isCreating ? 'Create Account' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Personnel Directory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Added On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No staff members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const isCurrentUser = user.id === auth.user.id;
                                        const role = user.roles[0]?.name || 'Unknown';
                                        
                                        return (
                                            <TableRow key={user.id} className={isCurrentUser ? 'bg-emerald-50/30' : ''}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {role === 'admin' ? <Shield className="h-4 w-4 text-amber-600" /> : <User className="h-4 w-4 text-gray-500" />}
                                                        {user.name}
                                                        {isCurrentUser && <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">You</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={role === 'admin' ? 'default' : 'secondary'} className={role === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : ''}>
                                                        {role === 'admin' ? 'Administrator' : 'Worker'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                                                            <Pencil className="h-3 w-3 mr-1" /> Edit
                                                        </Button>
                                                        {!isCurrentUser && (
                                                            <Button variant="destructive" size="sm" onClick={() => deleteUser(user)}>
                                                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
