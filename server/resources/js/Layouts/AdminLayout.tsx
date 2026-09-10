import React, { PropsWithChildren } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    SidebarProvider, 
    Sidebar, 
    SidebarHeader, 
    SidebarContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
    SidebarFooter,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import {
    Activity,
    ShoppingCart,
    Package,
    History,
    Users,
    Tags,
    Truck,
    LogOut,
    Menu,
    Sun,
    Moon,
    Monitor
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppearance, type Appearance } from "@/hooks/use-appearance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS: { key: Appearance; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'Auto', icon: Monitor },
];

function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    return (
        <div className="flex items-center rounded-md border border-border overflow-hidden">
            {THEME_OPTIONS.map((opt) => {
                const active = appearance === opt.key;
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => updateAppearance(opt.key)}
                        className={
                            "flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors " +
                            (active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground")
                        }
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

export default function AdminLayout({ children }: PropsWithChildren) {
    const user = usePage().props.auth.user;
    const { url } = usePage();
    const isAdmin = user.roles && user.roles.includes('admin');

    const navItems = [
        { name: 'Dashboard', icon: Activity, href: route('dashboard'), active: url.startsWith('/dashboard') },
        { name: 'Checkout', icon: ShoppingCart, href: route('pos.index'), active: url.startsWith('/pos') },
        { name: 'Sales', icon: Activity, href: route('reports.index'), active: url.startsWith('/reports'), adminOnly: true },
        { name: 'Stock', icon: Package, href: route('products.index'), active: url.startsWith('/products') },
        { name: 'Categories', icon: Tags, href: route('categories.index'), active: url.startsWith('/categories'), adminOnly: true },
        { name: 'Suppliers', icon: Truck, href: route('suppliers.index'), active: url.startsWith('/suppliers'), adminOnly: true },
        { name: 'Users', icon: Users, href: route('users.index'), active: url.startsWith('/users'), adminOnly: true },
        { name: 'Audit Log', icon: History, href: route('adjustments.index'), active: url.startsWith('/adjustments'), adminOnly: true },
    ];

    return (
        <SidebarProvider>
            <Head>
                <link href="https://fonts.googleapis.com" rel="preconnect"/>
                <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                `}</style>
            </Head>

            <Sidebar>
                <SidebarHeader className="border-b border-border p-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-1.5 rounded-md text-white dark:bg-primary dark:text-primary-foreground">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Pharmacy</span>
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-2 py-4">
                    <SidebarMenu>
                        {navItems.map((item) => {
                            if (item.adminOnly && !isAdmin) return null;
                            return (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton  
                                        isActive={item.active} 
                                        tooltip={item.name}
                                        render={<Link href={item.href} />}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarFooter className="border-t border-border p-4 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Appearance</span>
                        <ThemeToggle />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start h-auto p-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col items-start flex-1 text-sm overflow-hidden">
                                        <span className="font-semibold truncate">{user.name}</span>
                                        <span className="text-xs text-muted-foreground truncate">{isAdmin ? 'Administrator' : 'Worker'}</span>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')} className="cursor-pointer w-full">Profile Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                <Link href={route('logout')} method="post" as="button" className="w-full flex items-center">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex-1 flex justify-between items-center">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Pharmacy Operating System
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
