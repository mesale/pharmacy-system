import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Truck, Plus, X, Save, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Suppliers</h2>
                        <p className="text-muted-foreground mt-1">Manage external vendors and pharmaceutical suppliers.</p>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={isCreating ? "outline" : "default"} 
                                onClick={() => setIsCreating(!isCreating)}
                            >
                                {isCreating ? (
                                    <><X className="mr-2 h-4 w-4" /> Cancel</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Add Supplier</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {isCreating && (
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 pb-4">
                            <CardTitle className="text-emerald-800 text-lg">New Supplier</CardTitle>
                            <CardDescription>Enter the contact and business details of the new supplier.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Name <span className="text-red-500">*</span></label>
                                        <Input type="text" placeholder="Supplier Name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="tel" className="pl-8" placeholder="Phone Number" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="email" className="pl-8" placeholder="Email Address" value={data.email} onChange={e => setData('email', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="text" className="pl-8" placeholder="Physical Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" /> Save Supplier
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            Supplier Directory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier Name</TableHead>
                                    <TableHead>Contact Information</TableHead>
                                    <TableHead className="text-right">Batches Provided</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No suppliers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">{supplier.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3" /> {supplier.phone || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3" /> {supplier.email || '—'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-emerald-600">
                                                {supplier.stock_batches_count}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
