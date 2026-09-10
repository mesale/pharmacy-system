import os

file_path = 'server/resources/js/Pages/Dashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';",
    "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\nimport { router } from '@inertiajs/react';"
)

# 2. Props
props_old = "    criticalAlerts: Array<any>;\n}"
props_new = "    criticalAlerts: Array<any>;\n    chartData: Array<{label: string, sales: number}>;\n    currentTrend: string;\n}"
content = content.replace(props_old, props_new)

# 3. Destructuring
dest_old = "    criticalAlerts\n}: Props) {"
dest_new = "    criticalAlerts,\n    chartData,\n    currentTrend\n}: Props) {"
content = content.replace(dest_old, dest_new)

# 4. Remove old chartData array
chart_data_old = """    const chartData = [
        { time: '08:00', sales: Math.max(0, grossSalesToday * 0.1) },
        { time: '10:00', sales: Math.max(0, grossSalesToday * 0.25) },
        { time: '12:00', sales: Math.max(0, grossSalesToday * 0.5) },
        { time: '14:00', sales: Math.max(0, grossSalesToday * 0.7) },
        { time: '16:00', sales: grossSalesToday },
    ];"""
content = content.replace(chart_data_old, "")

# 5. Replace Card
card_old = """                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                                            itemStyle={{ color: '#2563eb' }}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>"""

card_new = """                    <Card className="col-span-4 flex flex-col">
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
                                            itemStyle={{ color: '#2563eb' }}
                                            formatter={(value) => [`$${value}`, 'Sales']}
                                        />
                                        <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>"""

content = content.replace(card_old, card_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully!")

