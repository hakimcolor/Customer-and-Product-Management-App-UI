'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function ChangePasswordPage() {
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
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
          />
          <Button
            className="w-full"
            onClick={() => toast.success('Password updated successfully')}
          >
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
}
