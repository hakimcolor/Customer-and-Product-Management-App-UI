'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user } = useAuthStore();
  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information"
        breadcrumbs={[{ label: 'Profile' }]}
        actions={
          <Button
            icon={<Save size={15} />}
            onClick={() => toast.success('Profile updated')}
          >
            Save Changes
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center py-8 gap-4">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-4xl font-bold select-none">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-[var(--foreground)] text-lg">
              {user?.name ?? 'User'}
            </h2>
            <p className="text-[var(--muted)] text-sm">
              {user?.role ?? 'Admin'}
            </p>
            <p className="text-[var(--muted)] text-xs mt-1">
              {user?.email ?? 'user@example.com'}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Change Avatar
          </Button>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={user?.name ?? ''} />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.email ?? ''}
            />
            <Input label="Phone" defaultValue="+880 1XXX-XXXXXX" />
            <Input label="Role" defaultValue={user?.role ?? 'Admin'} disabled />
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">
              Change Password
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <Button
              className="mt-4"
              onClick={() => toast.success('Password changed successfully')}
            >
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
