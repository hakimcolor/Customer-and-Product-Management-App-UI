'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/endpoints';
import { toast } from '@/components/ui/Toast';
import { useState } from 'react';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-[var(--primary)]" />
              </div>
              <h2 className="font-bold text-[var(--foreground)] mb-2">
                Check your email
              </h2>
              <p className="text-sm text-[var(--muted)] mb-5">
                We sent a password reset link to your email.
              </p>
              <a
                href="/login"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Back to login
              </a>
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-5 transition-colors"
              >
                <ArrowLeft size={14} /> Back to login
              </a>
              <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">
                Forgot password
              </h1>
              <p className="text-sm text-[var(--muted)] mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={15} />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
