import { PropsWithChildren } from 'react';
import { Activity, Sun, Moon, Monitor } from 'lucide-react';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

const THEME_OPTIONS: { key: Appearance; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'Auto', icon: Monitor },
];

function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    return (
        <div className="inline-flex items-center rounded-lg border border-border bg-card overflow-hidden">
            {THEME_OPTIONS.map((opt) => {
                const active = appearance === opt.key;
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => updateAppearance(opt.key)}
                        aria-label={opt.label}
                        className={
                            'flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ' +
                            (active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')
                        }
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative bg-background text-foreground antialiased flex min-h-screen flex-col items-center justify-center p-6">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="bg-primary p-3 rounded-xl mb-4">
                    <Activity className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Pharmacy</h1>
                <p className="text-sm text-muted-foreground mt-1">Management System</p>
            </div>

            <div className="w-full sm:max-w-md bg-card text-card-foreground rounded-xl ring-1 ring-foreground/10 p-6 sm:p-8 shadow-sm">
                {children}
            </div>
        </div>
    );
}
