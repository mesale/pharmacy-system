import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head>
                <title>Log in</title>
                <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
            </Head>

            {status && (
                <div className="mb-gap-md text-sm font-bold text-status-success uppercase tracking-wider">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-gap-md">
                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Auth Identifier (Email)</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-status-critical text-xs mt-2 font-bold uppercase">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Security Key (Password)</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-surface-base border border-border-strong text-text-primary focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 text-sm"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <p className="text-status-critical text-xs mt-2 font-bold uppercase">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="bg-surface-base border-border-strong text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Persist Session
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-bold text-primary uppercase tracking-wider hover:underline"
                        >
                            Reset Key
                        </Link>
                    )}
                </div>

                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-primary text-on-primary hover:bg-primary-hover transition-colors font-bold uppercase tracking-wider text-sm py-3 flex items-center justify-center gap-2 border border-primary"
                    >
                        <span className="material-symbols-outlined text-sm">login</span>
                        Authenticate
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
