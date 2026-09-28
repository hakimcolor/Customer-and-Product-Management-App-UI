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
        {/* Tab nav */}
        <div className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all select-none border ${
                activeTab === tab.label
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-[var(--primary)]'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              {tab.label}
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
                <Input label="Tax / VAT Number" defaultValue="VAT-12345678" />
                <Input label="Currency" defaultValue="BDT (৳)" />
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
              <div className="space-y-3 pt-2">
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
                    className="cursor-pointer flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="cursor-pointer accent-[var(--primary)] w-4 h-4"
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
                  desc: 'Notify when product falls below alert threshold',
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
                <label
                  key={item.label}
                  className="cursor-pointer flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] transition-colors gap-4"
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
                    className="cursor-pointer accent-[var(--primary)] w-4 h-4 mt-0.5 shrink-0"
                  />
                </label>
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
              <div className="space-y-3 pt-2">
                {[
                  {
                    label: 'Require strong passwords (min 8 chars)',
                    checked: true,
                  },
                  { label: 'Two-factor authentication', checked: false },
                  { label: 'Log all user activities', checked: true },
                  { label: 'Force logout on inactivity', checked: true },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="cursor-pointer flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="cursor-pointer accent-[var(--primary)] w-4 h-4"
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
            <div className="space-y-6">
              <h2 className="font-semibold text-[var(--foreground)]">
                Appearance
              </h2>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                  Theme Mode
                </p>
                <div className="flex gap-3">
                  {[
                    { mode: 'Light', emoji: '☀️' },
                    { mode: 'Dark', emoji: '🌙' },
                  ].map(({ mode, emoji }) => (
                    <button
                      key={mode}
                      className={`cursor-pointer flex-1 py-4 rounded-xl border-2 text-sm font-medium transition-all select-none ${
                        mode === 'Light'
                          ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => toast.success(`${mode} mode selected`)}
                    >
                      {emoji} {mode} Mode
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                  Primary Color
                </p>
                <div className="flex gap-3">
                  {[
                    { color: '#16a34a', label: 'Green' },
                    { color: '#2563eb', label: 'Blue' },
                    { color: '#9333ea', label: 'Purple' },
                    { color: '#dc2626', label: 'Red' },
                    { color: '#ea580c', label: 'Orange' },
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      title={label}
                      className={`cursor-pointer w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${color === '#16a34a' ? 'border-gray-500 scale-110 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'}`}
                      style={{ background: color }}
                      onClick={() => toast.success(`${label} theme selected`)}
                    />
                  ))}
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  Green is the current theme color
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
