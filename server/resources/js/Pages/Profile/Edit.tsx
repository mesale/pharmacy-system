import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }: { mustVerifyEmail?: boolean; status?: string }) {
    return (
        <AdminLayout>
            <Head title="Profile Settings" />

            <div className="flex flex-col gap-6 w-full max-w-3xl pb-12">
                <div className="mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h2>
                    <p className="text-muted-foreground mt-1">Manage your account information, password, and account removal.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                        <CardDescription>Update your account's name and email address.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Update Password</CardTitle>
                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>

                <Card className="ring-red-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-700 dark:text-red-400">Delete Account</CardTitle>
                        <CardDescription>Once your account is deleted, all of its data is permanently removed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeleteUserForm />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
