import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-sm text-muted-foreground">
                This is a secure area of the application. Please confirm your password before continuing.
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                    <Input id="password" type="password" name="password" value={data.password} autoFocus onChange={(e) => setData('password', e.target.value)} required />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-end">
                    <Button type="submit" disabled={processing}>Confirm</Button>
                </div>
            </form>
        </GuestLayout>
    );
}
