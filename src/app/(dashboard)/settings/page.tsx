'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Building2, Globe, Bell, Shield, Palette } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { settingsApi } from '@/lib/api/endpoints';

const TABS = [
  { label: 'Company', icon: <Building2 size={16} /> },
  { label: 'General', icon: <Globe size={16} /> },
  { label: 'Notifications', icon: <Bell size={16} /> },
  { label: 'Security', icon: <Shield size={16} /> },
  { label: 'Appearance', icon: <Palette size={16} /> },
];

const NOTIFICATION_KEYS = [
  {
    key: 'notify_low_stock',
    label: 'Low stock alert',
    desc: 'Notify when product falls below alert threshold',
  },
  {
    key: 'notify_new_sale',
    label: 'New sale created',
    desc: 'Notify when a new sale is made',
  },
  {
    key: 'notify_payment',
    label: 'Payment received',
    desc: 'Notify when customer makes a payment',
  },
  {
    key: 'notify_overdue',
    label: 'Overdue payments',
    desc: 'Daily summary of overdue invoices',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Company');
  const [fields, setFields] = useState<Record<string, string>>({});

  const { data: rawSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApi.get();
      return res.data?.data ?? res.data;
    },
  });

  useEffect(() => {
    if (!rawSettings) return;
    const map: Record<string, string> = {};
    if (Array.isArray(rawSettings)) {
      rawSettings.forEach((s: { key: string; value: string }) => {
        map[s.key] = s.value;
      });
    } else if (typeof rawSettings === 'object') {
      Object.entries(rawSettings).forEach(([k, v]) => {
        map[k] = String(v);
      });
    }
    setFields(map);
  }, [rawSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => {
      const settings = Object.entries(data).map(([key, value]) => ({
        key,
        value,
      }));
      return settingsApi.update({ settings });
    },
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  function set(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    saveMutation.mutate(fields);
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your ERP system"
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <Button
            icon={<Save size={16} />}
            loading={saveMutation.isPending}
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
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all select-none border ${
                activeTab === tab.label
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card border-border text-foreground hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-primary'
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
              <h2 className="font-semibold text-foreground">
                Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={fields.company_name ?? ''}
                  onChange={(e) => set('company_name', e.target.value)}
                />
                <Input
                  label="Business Type"
                  value={fields.business_type ?? ''}
                  onChange={(e) => set('business_type', e.target.value)}
                />
                <Input
                  label="Phone"
                  value={fields.company_phone ?? ''}
                  onChange={(e) => set('company_phone', e.target.value)}
                />
                <Input
                  label="Email"
                  value={fields.company_email ?? ''}
                  onChange={(e) => set('company_email', e.target.value)}
                />
                <Input
                  label="Address"
                  value={fields.company_address ?? ''}
                  onChange={(e) => set('company_address', e.target.value)}
                />
                <Input
                  label="Currency"
                  value={fields.currency ?? 'BDT'}
                  onChange={(e) => set('currency', e.target.value)}
                />
                <Input
                  label="Tax / VAT Number"
                  value={fields.vat_number ?? ''}
                  onChange={(e) => set('vat_number', e.target.value)}
                />
                <Input
                  label="Invoice Prefix"
                  value={fields.invoice_prefix ?? 'INV'}
                  onChange={(e) => set('invoice_prefix', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'General' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-foreground">
                General Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date Format"
                  value={fields.date_format ?? 'DD/MM/YYYY'}
                  onChange={(e) => set('date_format', e.target.value)}
                />
                <Input
                  label="Time Zone"
                  value={fields.timezone ?? 'Asia/Dhaka'}
                  onChange={(e) => set('timezone', e.target.value)}
                />
                <Input
                  label="Language"
                  value={fields.language ?? 'English'}
                  onChange={(e) => set('language', e.target.value)}
                />
                <Input
                  label="Low Stock Threshold"
                  type="number"
                  value={fields.low_stock_threshold ?? '10'}
                  onChange={(e) => set('low_stock_threshold', e.target.value)}
                />
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { key: 'multi_branch', label: 'Enable multi-branch mode' },
                  {
                    key: 'auto_invoice',
                    label: 'Auto-generate invoice numbers',
                  },
                  {
                    key: 'require_approval',
                    label: 'Require approval for large purchases',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="cursor-pointer flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={fields[item.key] === 'true'}
                      onChange={(e) => set(item.key, String(e.target.checked))}
                      className="cursor-pointer accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">
                Notification Preferences
              </h2>
              {NOTIFICATION_KEYS.map((item) => (
                <label
                  key={item.key}
                  className="cursor-pointer flex items-start justify-between p-4 rounded-xl border border-border bg-background hover:border-primary transition-colors gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={fields[item.key] !== 'false'}
                    onChange={(e) => set(item.key, String(e.target.checked))}
                    className="cursor-pointer accent-primary w-4 h-4 mt-0.5 shrink-0"
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-foreground">
                Security Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  value={fields.session_timeout ?? '60'}
                  onChange={(e) => set('session_timeout', e.target.value)}
                />
                <Input
                  label="Max Login Attempts"
                  type="number"
                  value={fields.max_login_attempts ?? '5'}
                  onChange={(e) => set('max_login_attempts', e.target.value)}
                />
              </div>
              <div className="space-y-3 pt-2">
                {[
                  {
                    key: 'strong_password',
                    label: 'Require strong passwords (min 8 chars)',
                  },
                  { key: 'log_activities', label: 'Log all user activities' },
                  { key: 'force_logout', label: 'Force logout on inactivity' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="cursor-pointer flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={fields[item.key] !== 'false'}
                      onChange={(e) => set(item.key, String(e.target.checked))}
                      className="cursor-pointer accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-foreground">Appearance</h2>
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
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
                      className={`cursor-pointer w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${(fields.primary_color ?? '#16a34a') === color ? 'border-gray-500 scale-110 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'}`}
                      style={{ background: color }}
                      onClick={() => set('primary_color', color)}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">
                  Green is the recommended theme color
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
