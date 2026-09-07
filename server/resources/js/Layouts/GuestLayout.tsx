import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="dark bg-surface-base font-body-md text-body-md text-on-surface antialiased flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            <div className="flex flex-col items-center mb-8">
                <span className="material-symbols-outlined text-primary text-6xl mb-4">terminal</span>
                <span className="font-headline-sm text-headline-sm text-text-primary uppercase tracking-wider mb-1">ST. JUDE DISP</span>
                <span className="font-label-sm text-label-sm text-text-muted">CLINICAL SYSTEM 4.2 &middot; SECURE-NET</span>
            </div>

            <div className="w-full bg-surface-raised border border-border-subtle p-8 shadow-lg sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
