'use client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PageHeader
        title="Edit Product"
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Products', href: '/products' },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/products">
              <Button variant="outline" icon={<ArrowLeft size={15} />}>
                Back
              </Button>
            </Link>
            <Button
              icon={<Save size={15} />}
              onClick={() => toast.success('Product updated successfully')}
            >
              Save Changes
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h2 className="font-semibold text-[var(--foreground)] mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Name" defaultValue="Samsung A55" />
              <Input
                label="SKU"
                defaultValue={`SKU-${params.id.padStart(4, '0')}`}
              />
              <Input label="Barcode" defaultValue="" />
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                  Category
                </label>
                <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Computers</option>
                </select>
              </div>
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--foreground)] mb-4">
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Purchase Price"
                type="number"
                defaultValue="38000"
              />
              <Input label="Retail Price" type="number" defaultValue="45000" />
              <Input
                label="Wholesale Price"
                type="number"
                defaultValue="42000"
              />
              <Input label="VAT %" type="number" defaultValue="0" />
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <h2 className="font-semibold text-[var(--foreground)] mb-4">
              Inventory
            </h2>
            <div className="space-y-4">
              <Input label="Alert Quantity" type="number" defaultValue="10" />
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                  Status
                </label>
                <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Card>
          <Button
            className="w-full"
            icon={<Save size={15} />}
            onClick={() => toast.success('Product updated')}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
