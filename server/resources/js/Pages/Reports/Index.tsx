import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, FileSpreadsheet, Activity, DollarSign, ArrowUpRight, ArrowDownRight, CalendarDays, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
    auth: any;
    summary: {
        total_revenue: number;
        total_profit: number;
        total_transactions: number;
        total_cogs: number;
    };
    dailyData: any[];
    startDate: string;
    endDate: string;
}

export default function Index({ auth, summary, dailyData, startDate: initialStartDate, endDate: initialEndDate }: Props) {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayItems, setDayItems] = useState<any[]>([]);
    const [isLoadingDay, setIsLoadingDay] = useState(false);

    const currency = (val: string | number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    };

    const filterReport = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('reports.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const openDayDetails = async (date: string) => {
        setSelectedDate(date);
        setIsLoadingDay(true);
        try {
            const response = await axios.get(route('reports.day', { date }));
            setDayItems(response.data);
        } catch (error) {
            console.error("Failed to load day details", error);
        } finally {
            setIsLoadingDay(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Sales Reports" />

            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Financial Reports</h2>
                        <p className="text-muted-foreground mt-1">Detailed breakdown of sales, revenue, and profit margins.</p>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Filter Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={filterReport} className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full sm:w-auto">
                                <label className="text-sm font-medium leading-none mb-2 block">Start Date</label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            </div>
                            <div className="w-full sm:w-auto">
                                <label className="text-sm font-medium leading-none mb-2 block">End Date</label>
                                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full sm:w-auto">
                                <CalendarDays className="mr-2 h-4 w-4" /> Generate Report
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currency(summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Gross sales
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{currency(summary.total_cogs)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total inventory cost
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{currency(summary.total_profit)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                After unit costs deduction
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_transactions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Completed sales
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                            Daily Ledger Breakdown
                        </CardTitle>
                        <CardDescription>Click on a row to see the exact products sold on that day.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Transactions</TableHead>
                                    <TableHead className="text-right">Gross Revenue</TableHead>
                                    <TableHead className="text-right">COGS</TableHead>
                                    <TableHead className="text-right">Net Profit</TableHead>
                                    <TableHead className="text-right">Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailyData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No sales recorded for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dailyData.map((day) => {
                                        const margin = (Number(day.profit) / Number(day.revenue) * 100) || 0;
                                        return (
                                            <TableRow 
                                                key={day.date} 
                                                className="cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                onClick={() => openDayDetails(day.date)}
                                            >
                                                <TableCell className="font-medium">
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {day.total_transactions}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {currency(day.revenue)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-amber-600">
                                                    {currency(day.cogs)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-emerald-600">
                                                    {currency(day.profit)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {margin.toFixed(1)}%
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

            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Sales Detail for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}</DialogTitle>
                        <DialogDescription>List of all products sold on this date across all transactions.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-auto mt-4">
                        {isLoadingDay ? (
                            <div className="h-32 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : dayItems.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                                <p>No specific products found for this day.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead className="text-right">Quantity Sold</TableHead>
                                        <TableHead className="text-right">Revenue Generated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dayItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">{item.total_quantity}</TableCell>
                                            <TableCell className="text-right font-medium text-emerald-600">{currency(item.total_revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t mt-auto">
                        <Button variant="outline" onClick={() => setSelectedDate(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
