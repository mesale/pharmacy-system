import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import { FormEvent } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                    <Input id="email" type="email" name="email" value={data.email} autoComplete="username" autoFocus onChange={(e) => setData('email', e.target.value)} required />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                    <Input id="password" type="password" name="password" value={data.password} autoComplete="current-password" onChange={(e) => setData('password', e.target.value)} required />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={data.remember} onCheckedChange={(c) => setData('remember', !!c)} />
                        <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                            Forgot password?
                        </Link>
                    )}
                </div>

                <Button type="submit" size="lg" disabled={processing} className="w-full mt-2">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
            </form>
        </GuestLayout>
    );
}
