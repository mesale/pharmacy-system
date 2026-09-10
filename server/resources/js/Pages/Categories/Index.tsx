import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Tags, Plus, X, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h2>
                        <p className="text-muted-foreground mt-1">Manage product categories for your inventory.</p>
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
                                    <><Plus className="mr-2 h-4 w-4" /> Add Category</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {isCreating && (
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 pb-4">
                            <CardTitle className="text-emerald-800 text-lg">New Category</CardTitle>
                            <CardDescription>Create a new category to group your products.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                <div className="w-full sm:max-w-md">
                                    <label className="text-sm font-medium leading-none mb-2 block">Category Name</label>
                                    <Input 
                                        type="text" 
                                        placeholder="e.g. Painkillers" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        required 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" /> Save Category
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="h-5 w-5 text-muted-foreground" />
                            Category Database
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Products</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-mono text-muted-foreground">{category.id}</TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-right font-medium text-emerald-600">
                                                {category.products_count}
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
