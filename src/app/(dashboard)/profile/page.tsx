'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toast';
import { authApi, usersApi } from '@/lib/api/endpoints';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      usersApi.update(String(user?.id), data),
    onSuccess: () => toast.success('Profile updated'),
    onError: () => toast.error('Failed to update profile'),
  });

  const changePassMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    },
    onError: () => toast.error('Failed to change password'),
  });

  function handleSaveProfile() {
    const updates: Record<string, unknown> = {};
    if (phone) updates.phone = phone;
    if (Object.keys(updates).length === 0) {
      toast.info('No changes to save');
      return;
    }
    updateMutation.mutate(updates);
  }

  function handleChangePassword() {
    if (!currentPass || !newPass) {
      toast.error('Fill all password fields');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePassMutation.mutate({
      currentPassword: currentPass,
      newPassword: newPass,
    });
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information"
        breadcrumbs={[{ label: 'Profile' }]}
        actions={
          <Button
            icon={<Save size={15} />}
            onClick={handleSaveProfile}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center py-8 gap-4">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold select-none">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-foreground text-lg">
              {user?.name ?? 'User'}
            </h2>
            <p className="text-muted text-sm">{user?.role ?? 'Admin'}</p>
            <p className="text-muted text-xs mt-1">{user?.email ?? ''}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-foreground mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={user?.name ?? ''} disabled />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.email ?? ''}
              disabled
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
            />
            <Input label="Role" defaultValue={user?.role ?? 'Admin'} disabled />
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">
              Change Password
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>
            <Button
              className="mt-4"
              onClick={handleChangePassword}
              loading={changePassMutation.isPending}
            >
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
