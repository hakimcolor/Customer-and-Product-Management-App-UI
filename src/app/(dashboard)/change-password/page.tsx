'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { authApi } from '@/lib/api/endpoints';

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const mutation = useMutation({
    mutationFn: (d: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(d),
    onSuccess: () => {
      toast.success('Password updated successfully');
      setCurrent('');
      setNewPass('');
      setConfirm('');
    },
    onError: () => toast.error('Failed to update password'),
  });

  function handleSubmit() {
    if (!current || !newPass || !confirm) {
      toast.error('All fields are required');
      return;
    }
    if (newPass !== confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    mutation.mutate({ currentPassword: current, newPassword: newPass });
  }

  return (
    <div>
      <PageHeader
        title="Change Password"
        breadcrumbs={[{ label: 'Account' }, { label: 'Change Password' }]}
        actions={
          <Link href="/profile">
            <Button variant="outline" icon={<ArrowLeft size={15} />}>
              Back to Profile
            </Button>
          </Link>
        }
      />
      <Card className="max-w-md">
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min 6 characters"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            loading={mutation.isPending}
          >
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
}
