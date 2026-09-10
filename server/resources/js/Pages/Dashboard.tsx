import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ArrowUpRight, DollarSign, Package, ShoppingCart, Activity } from 'lucide-react';

interface Props {
    auth: any;
    grossSalesToday: number;
    netProfitToday: number;
    transactionCountToday: number;
    expiringBatchesCount: number;
    expiredBatchesCount: number;
    lowStockCount: number;
    criticalAlerts: Array<any>;
    chartData: Array<{label: string, sales: number}>;
    currentTrend: string;
}

export default function Dashboard({
    auth,
    grossSalesToday,
    netProfitToday,
    transactionCountToday,
    expiringBatchesCount,
    expiredBatchesCount,
    lowStockCount,
    criticalAlerts,
    chartData,
    currentTrend
}: Props) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <AdminLayout>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h2>
                        <p className="text-muted-foreground mt-1">Here is what's happening in your pharmacy today.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Activity className="mr-2 h-4 w-4 text-emerald-600" />
                            Live Sync Active
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Sales Today</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(grossSalesToday)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {transactionCountToday} transactions processed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(netProfitToday)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                After unit costs deduction
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring/Expired Batches</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{expiringBatchesCount + expiredBatchesCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Requires immediate audit
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <Package className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Products reached reorder level
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Sales Trend</CardTitle>
                            <div className="flex gap-2">
                                <Button 
                                    variant={currentTrend === 'weekly' ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => router.get(route('dashboard'), { trend: 'weekly' }, { preserveState: true, preserveScroll: true })}
                                >Weekly</Button>
                                <Button 
                                    variant={currentTrend === 'monthly' ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => router.get(route('dashboard'), { trend: 'monthly' }, { preserveState: true, preserveScroll: true })}
                                >Monthly</Button>
                                <Button 
                                    variant={currentTrend === 'yearly' ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => router.get(route('dashboard'), { trend: 'yearly' }, { preserveState: true, preserveScroll: true })}
                                >Yearly</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-2 pt-4 flex-1">
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip 
                                            cursor={{fill: '#f1f5f9'}}
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                                            itemStyle={{ color: '#059669' }}
                                            formatter={(value: any) => [`$${value}`, 'Sales']}
                                        />
                                        <Bar dataKey="sales" fill="#4FDBC8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 flex flex-col">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Frequently used modules</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 flex-1">
                            <Link href={route('pos.index')} className="flex items-center gap-3 p-3 rounded-md border hover:bg-slate-50 transition-colors">
                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">Checkout</div>
                                    <div className="text-xs text-muted-foreground">Process new sale</div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </Link>

                            <Link href={route('products.index')} className="flex items-center gap-3 p-3 rounded-md border hover:bg-slate-50 transition-colors">
                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">Inventory</div>
                                    <div className="text-xs text-muted-foreground">Manage stock and medicines</div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </Link>

                            <Link href={route('reports.index')} className="flex items-center gap-3 p-3 rounded-md border hover:bg-slate-50 transition-colors">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">Financial Reports</div>
                                    <div className="text-xs text-muted-foreground">View detailed analytics</div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {criticalAlerts.length > 0 && (
                    <Card className="border-orange-200 shadow-sm">
                        <CardHeader className="bg-orange-50/50 pb-4">
                            <CardTitle className="text-orange-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Attention Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Batch / Details</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {criticalAlerts.map((alert, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {alert.type === 'expired' && <Badge variant="destructive">Expired</Badge>}
                                                {alert.type === 'expiring' && <Badge variant="warning" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Expiring</Badge>}
                                                {alert.type === 'low_stock' && <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Low Stock</Badge>}
                                            </TableCell>
                                            <TableCell className="font-medium">{alert.product}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {alert.type === 'low_stock' 
                                                    ? `${alert.current_stock} remaining (Threshold: ${alert.threshold})`
                                                    : `Batch ${alert.batch_number} (Expires: ${alert.expiry_date})`
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    Resolve <ArrowUpRight className="ml-1 w-3 h-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
