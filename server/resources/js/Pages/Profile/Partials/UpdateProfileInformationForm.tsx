import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail?: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">Name</label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className="text-sm text-muted-foreground">
                    <p>
                        Your email address is unverified.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="text-emerald-600 underline hover:text-emerald-700"
                        >
                            Click here to re-send the verification email.
                        </Link>
                    </p>
                    {status === 'verification-link-sent' && (
                        <div className="mt-2 font-medium text-emerald-600">
                            A new verification link has been sent to your email address.
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 mt-2">
                <Button type="submit" disabled={processing}>Save</Button>
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-muted-foreground">Saved.</p>
                </Transition>
            </div>
        </form>
    );
}
