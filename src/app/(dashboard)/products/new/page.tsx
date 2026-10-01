'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(1, 'Required'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Required'),
  brand: z.string().optional(),
  unit: z.string().min(1, 'Required'),
  purchasePrice: z.string().min(1, 'Required'),
  wholesalePrice: z.string().optional(),
  retailPrice: z.string().min(1, 'Required'),
  minSellingPrice: z.string().optional(),
  alertQty: z.string().min(1, 'Required'),
  openingStock: z.string().optional(),
  vat: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddProductPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { alertQty: '10', openingStock: '0', vat: '0' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { productsApi } = await import('@/lib/api/endpoints');
      await productsApi.create({
        title: data.name,
        sku: data.sku || undefined,
        barcode: data.barcode || undefined,
        purchasePrice: parseFloat(data.purchasePrice) || 0,
        wholesalePrice: data.wholesalePrice
          ? parseFloat(data.wholesalePrice)
          : undefined,
        sellingPrice: parseFloat(data.retailPrice),
        minSellingPrice: data.minSellingPrice
          ? parseFloat(data.minSellingPrice)
          : undefined,
        alertQuantity: parseInt(data.alertQty) || 5,
        vat: data.vat ? parseFloat(data.vat) : undefined,
        description: data.description || undefined,
      });
      toast.success('Product created successfully');
      window.location.href = '/products';
    } catch {
      toast.error('Failed to create product');
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Product"
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Products', href: '/products' },
          { label: 'Add Product' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              <a href="/products">Back</a>
            </Button>
            <Button
              icon={<Save size={16} />}
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Save Product
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card>
              <h2 className="font-semibold text-[var(--foreground)] mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name *"
                  placeholder="e.g. Samsung A55"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="SKU *"
                  placeholder="e.g. SKU-0001"
                  error={errors.sku?.message}
                  {...register('sku')}
                />
                <Input
                  label="Barcode"
                  placeholder="Scan or enter barcode"
                  {...register('barcode')}
                />
                <Select
                  label="Category *"
                  options={[
                    { label: 'Electronics', value: 'electronics' },
                    { label: 'Accessories', value: 'accessories' },
                  ]}
                  placeholder="Select category"
                  error={errors.category?.message}
                  {...register('category')}
                />
                <Select
                  label="Brand"
                  options={[
                    { label: 'Samsung', value: 'samsung' },
                    { label: 'Apple', value: 'apple' },
                    { label: 'Dell', value: 'dell' },
                  ]}
                  placeholder="Select brand"
                  {...register('brand')}
                />
                <Select
                  label="Unit *"
                  options={[
                    { label: 'Piece', value: 'piece' },
                    { label: 'Box', value: 'box' },
                    { label: 'KG', value: 'kg' },
                  ]}
                  placeholder="Select unit"
                  error={errors.unit?.message}
                  {...register('unit')}
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  {...register('description')}
                />
              </div>
            </Card>

            {/* Pricing */}
            <Card>
              <h2 className="font-semibold text-[var(--foreground)] mb-4">
                Pricing
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <Input
                  label="Purchase Price *"
                  type="number"
                  placeholder="0"
                  error={errors.purchasePrice?.message}
                  {...register('purchasePrice')}
                />
                <Input
                  label="Wholesale Price"
                  type="number"
                  placeholder="0"
                  {...register('wholesalePrice')}
                />
                <Input
                  label="Retail Price *"
                  type="number"
                  placeholder="0"
                  error={errors.retailPrice?.message}
                  {...register('retailPrice')}
                />
                <Input
                  label="Min Selling Price"
                  type="number"
                  placeholder="0"
                  {...register('minSellingPrice')}
                />
                <Input
                  label="VAT %"
                  type="number"
                  placeholder="0"
                  {...register('vat')}
                />
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <Card>
              <h2 className="font-semibold text-[var(--foreground)] mb-4">
                Inventory
              </h2>
              <div className="space-y-4">
                <Input
                  label="Alert Quantity *"
                  type="number"
                  placeholder="10"
                  error={errors.alertQty?.message}
                  {...register('alertQty')}
                />
                <Input
                  label="Opening Stock"
                  type="number"
                  placeholder="0"
                  {...register('openingStock')}
                />
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-[var(--foreground)] mb-4">
                Product Image
              </h2>
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-3">
                  <span className="text-[var(--primary)] text-xl">+</span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              icon={<Save size={16} />}
            >
              Save Product
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
