import React, { PropsWithChildren } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }: PropsWithChildren) {
    const user = usePage().props.auth.user;
    const { url } = usePage();

    return (
        <>
            <Head>
                <link href="https://fonts.googleapis.com" rel="preconnect"/>
                <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
                <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
                <style>{`
                    @layer base {
                        html, body { margin: 0; padding: 0; }
                        body { overscroll-behavior: none; }
                        main > :first-child { margin-top: 0 !important; }
                        main > :last-child { margin-bottom: 0 !important; }
                    }
                    ::-webkit-scrollbar { display: none; }
                `}</style>
            </Head>

            <div className="dark bg-surface-base font-body-md text-body-md text-on-surface antialiased min-h-screen flex">
                <aside className="fixed left-0 top-0 h-full w-64 bg-surface-raised border-r border-border-subtle z-50 flex flex-col justify-between">
                    <div className="flex flex-col">
                        <div className="h-16 px-gutter-mobile flex items-center justify-between border-b border-border-subtle bg-surface-base">
                            <div className="flex items-center gap-gap-sm">
                                <span className="material-symbols-outlined text-primary text-headline-sm">terminal</span>
                                <div className="flex flex-col">
                                    <span className="font-label-lg text-label-lg text-text-primary uppercase tracking-wider">ST. JUDE DISP</span>
                                    <span className="font-label-sm text-label-sm text-text-muted">CLINICAL SYSTEM 4.2</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-gap-2xs bg-status-success-bg border border-status-success px-1.5 py-0.5">
                                <div className="w-1.5 h-1.5 bg-status-success animate-pulse"></div>
                                <span className="font-label-sm text-label-sm text-status-success">SYS:OK</span>
                            </div>
                        </div>
                        <div className="p-gutter-mobile border-b border-border-subtle bg-surface-raised">
                            <div className="flex items-center justify-between mb-gap-xs">
                                <span className="font-label-sm text-label-sm text-text-muted uppercase">Active Station</span>
                                <span className="font-label-sm text-label-sm text-primary font-bold">SECURE-NET</span>
                            </div>
                            <div className="flex items-center justify-between bg-surface-base border border-border-subtle p-gap-sm">
                                <div className="flex items-center gap-gap-xs">
                                    <span className="material-symbols-outlined text-primary text-body-md">point_of_sale</span>
                                    <span className="font-headline-sm text-headline-sm text-text-primary">T-04 MAIN</span>
                                </div>
                                <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant px-1 py-0.5 border border-outline-variant">DISP-BAY</span>
                            </div>
                        </div>
                        <div className="px-gutter-mobile py-gap-sm">
                            <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider block mb-gap-xs">Core Modules</span>
                            <nav className="flex flex-col gap-1">
                                <Link href={route('pos.index')} className="flex items-center gap-gap-sm px-gap-sm py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                                    <span className="material-symbols-outlined text-headline-sm">barcode_scanner</span>
                                    <span className="font-headline-sm text-headline-sm">Dispense &amp; POS</span>
                                </Link>
                                <Link href={route('products.index')} className={`flex items-center gap-gap-sm px-gap-sm py-2 transition-colors ${url.startsWith('/products') ? 'bg-surface-container text-primary border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                                    <span className="material-symbols-outlined text-headline-sm">medication</span>
                                    <span className="font-headline-sm text-headline-sm">FEFO Inventory</span>
                                </Link>
                                <Link href={route('categories.index')} className={`flex items-center gap-gap-sm px-gap-sm py-2 transition-colors ${url.startsWith('/categories') ? 'bg-surface-container text-primary border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                                    <span className="material-symbols-outlined text-headline-sm">category</span>
                                    <span className="font-headline-sm text-headline-sm">Categories</span>
                                </Link>
                                <Link href={route('suppliers.index')} className={`flex items-center gap-gap-sm px-gap-sm py-2 transition-colors ${url.startsWith('/suppliers') ? 'bg-surface-container text-primary border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                                    <span className="material-symbols-outlined text-headline-sm">hub</span>
                                    <span className="font-headline-sm text-headline-sm">Suppliers</span>
                                </Link>
                                <Link href={route('dashboard')} className={`flex items-center gap-gap-sm px-gap-sm py-2 transition-colors ${url === '/dashboard' ? 'bg-surface-container text-primary border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                                    <span className="material-symbols-outlined text-headline-sm">monitoring</span>
                                    <span className="font-headline-sm text-headline-sm">Executive Admin</span>
                                </Link>
                            </nav>
                        </div>
                    </div>
                    <div className="p-gutter-mobile border-t border-border-subtle bg-surface-base">
                        <div className="flex items-center justify-between font-label-sm text-label-sm text-text-muted mb-gap-xs">
                            <span>HARDWARE SYNC</span>
                            <span className="text-primary">OPTICAL READY</span>
                        </div>
                        <div className="flex items-center gap-gap-xs text-text-secondary font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-status-success text-body-md">qr_code_scanner</span>
                            <span>Honeywell 1950g On</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border-subtle">
                             <Link href={route('logout')} method="post" as="button" className="w-full text-left font-label-sm text-label-sm text-status-critical hover:text-red-400">
                                LOGOUT {user.name.toUpperCase()}
                            </Link>
                        </div>
                    </div>
                </aside>
                
                <div className="flex-1 ml-64 flex flex-col min-h-screen">
                    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-raised border-b border-border-subtle z-40 flex items-center justify-between px-gutter-mobile">
                        <div className="flex items-center gap-gap-lg">
                            <div className="flex items-center gap-gap-sm">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-gap-xs">
                                        <span className="font-headline-sm text-headline-sm text-text-primary">ST. JUDE CLINICAL PHARMACY</span>
                                        <span className="font-label-sm text-label-sm bg-surface-overlay text-primary border border-border-strong px-1.5 py-0.5">DISPENSARY T-04</span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-text-muted">Main Inpatient Dispensary Tower &middot; Station Lock #9420</span>
                                </div>
                            </div>
                            <nav className="hidden xl:flex items-center gap-gap-lg">
                                <Link href={route('pos.index')} className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors uppercase">Worker POS / Dispense</Link>
                                <Link href={route('products.index')} className={`font-label-lg text-label-lg transition-colors uppercase ${url.startsWith('/products') ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Inventory &amp; FEFO Batches</Link>
                                <Link href={route('dashboard')} className={`font-label-lg text-label-lg transition-colors uppercase ${url === '/dashboard' ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Admin Executive Dashboard</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-gap-md">
                            <div className="flex items-center gap-gap-sm pl-gap-xs">
                                <div className="flex flex-col text-right">
                                    <span className="font-headline-sm text-headline-sm text-text-primary">{user.name}</span>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="font-label-sm text-label-sm text-text-muted">PharmD</span>
                                        <span className="font-label-sm text-label-sm bg-surface-overlay text-primary border border-primary px-1 font-bold">ADMIN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 mt-16 px-gutter-mobile bg-surface-base">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

