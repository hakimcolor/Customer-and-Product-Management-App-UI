'use client';
import { useState } from 'react';
import { Save, Building2, Globe, Bell, Shield, Palette } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

const TABS = [
  { label: 'Company', icon: <Building2 size={16} /> },
  { label: 'General', icon: <Globe size={16} /> },
  { label: 'Notifications', icon: <Bell size={16} /> },
  { label: 'Security', icon: <Shield size={16} /> },
  { label: 'Appearance', icon: <Palette size={16} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Company');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your ERP system"
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <Button
            icon={<Save size={16} />}
            loading={saving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.label
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[var(--foreground)]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          {activeTab === 'Company' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[var(--foreground)]">
                Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" defaultValue="Business ERP Ltd." />
                <Input label="Business Type" defaultValue="Trading" />
                <Input label="Phone" defaultValue="+880 1XXX-XXXXXX" />
                <Input label="Email" defaultValue="info@businesserp.com" />
                <Input label="Address" defaultValue="Dhaka, Bangladesh" />
                <Input label="Website" defaultValue="https://businesserp.com" />
                <Input
                  label="Tax ID / VAT Number"
                  defaultValue="VAT-12345678"
                />
                <Input label="Currency" defaultValue="BDT (৳)" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center w-48">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Click to change</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'General' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[var(--foreground)]">
                General Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date Format" defaultValue="DD/MM/YYYY" />
                <Input label="Time Zone" defaultValue="Asia/Dhaka (GMT+6)" />
                <Input label="Language" defaultValue="English" />
                <Input label="Fiscal Year Start" defaultValue="January" />
                <Input
                  label="Low Stock Alert Threshold"
                  type="number"
                  defaultValue="10"
                />
                <Input label="Invoice Prefix" defaultValue="INV" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Enable multi-branch mode', checked: true },
                  { label: 'Auto-generate invoice numbers', checked: true },
                  { label: 'Send email on new sale', checked: false },
                  {
                    label: 'Require approval for large purchases',
                    checked: true,
                  },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="accent-[var(--primary)] w-4 h-4"
                    />
                    <span className="text-sm text-[var(--foreground)]">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-[var(--foreground)]">
                Notification Preferences
              </h2>
              {[
                {
                  label: 'Low stock alert',
                  desc: 'Notify when product quantity falls below alert threshold',
                },
                {
                  label: 'New sale created',
                  desc: 'Notify when a new sale is made',
                },
                {
                  label: 'Payment received',
                  desc: 'Notify when customer makes a payment',
                },
                {
                  label: 'Overdue payments',
                  desc: 'Daily summary of overdue invoices',
                },
                {
                  label: 'New purchase order',
                  desc: 'Notify when a new purchase is created',
                },
                {
                  label: 'Expense approval needed',
                  desc: 'Notify admins when expenses need approval',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[var(--primary)] w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[var(--foreground)]">
                Security Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  defaultValue="60"
                />
                <Input
                  label="Max Login Attempts"
                  type="number"
                  defaultValue="5"
                />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Require strong passwords', checked: true },
                  { label: 'Two-factor authentication', checked: false },
                  { label: 'Log all user activities', checked: true },
                  { label: 'Force logout on inactivity', checked: true },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="accent-[var(--primary)] w-4 h-4"
                    />
                    <span className="text-sm text-[var(--foreground)]">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[var(--foreground)]">
                Appearance
              </h2>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                  Theme Mode
                </p>
                <div className="flex gap-3">
                  {['Light', 'Dark'].map((mode) => (
                    <button
                      key={mode}
                      className={`flex-1 py-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                        mode === 'Light'
                          ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {mode === 'Light' ? '☀️' : '🌙'} {mode} Mode
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                  Primary Color
                </p>
                <div className="flex gap-2">
                  {['#16a34a', '#2563eb', '#9333ea', '#dc2626', '#ea580c'].map(
                    (color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === '#16a34a' ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                        style={{ background: color }}
                      />
                    )
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  Green is the default theme color
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
