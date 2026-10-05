'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  Package,
  AlertTriangle,
  Tag,
  Boxes,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { productsApi } from '@/lib/api/endpoints';

// Backend uses: title, sellingPrice, purchasePrice, alertQuantity
interface Product {
  id: number;
  title: string;
  sku?: string;
  sellingPrice: number;
  purchasePrice: number;
  alertQuantity: number;
  status: boolean;
  category?: { name: string };
  brand?: { name: string };
  stocks?: { quantity: number }[];
}

interface ProductsResponse {
  data: Product[];
  total: number;
  totalPages: number;
}
interface Category {
  id: number;
  name: string;
}
interface Brand {
  id: number;
  name: string;
}

type FormState = {
  title: string;
  sku: string;
  sellingPrice: string;
  purchasePrice: string;
  alertQuantity: string;
  categoryId: string;
  brandId: string;
};
const emptyForm: FormState = {
  title: '',
  sku: '',
  sellingPrice: '',
  purchasePrice: '0',
  alertQuantity: '5',
  categoryId: '',
  brandId: '',
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') setPage(1);
  }

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', page, search, categoryFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (statusFilter)
        params.status = statusFilter === 'active' ? 'true' : 'false';
      const res = await productsApi.getAll(params);
      return res.data?.data ?? res.data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      return res.data?.data ?? res.data;
    },
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await productsApi.getBrands();
      return res.data?.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => productsApi.create(d),
    onSuccess: () => {
      toast.success('Product created');
      qc.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      toast.success('Product updated');
      qc.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      // Fetch product then create a copy
      const res = await productsApi.getOne(String(id));
      const p = res.data?.data ?? res.data;
      return productsApi.create({
        title: `${p.title} (Copy)`,
        sellingPrice: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        alertQuantity: p.alertQuantity,
        sku: p.sku ? `${p.sku}-copy` : undefined,
        categoryId: p.categoryId,
      });
    },
    onSuccess: () => {
      toast.success('Product duplicated');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Duplicate failed'),
  });

  function openAdd() {
    setEditProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      title: p.title ?? '',
      sku: p.sku ?? '',
      sellingPrice: String(p.sellingPrice),
      purchasePrice: String(p.purchasePrice),
      alertQuantity: String(p.alertQuantity),
      categoryId: '',
      brandId: '',
    });
    setFormErrors({});
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditProduct(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.title.trim()) e.title = 'Product name is required';
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice)))
      e.sellingPrice = 'Valid selling price required';
    if (form.purchasePrice && isNaN(Number(form.purchasePrice)))
      e.purchasePrice = 'Valid purchase price';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      sellingPrice: parseFloat(form.sellingPrice),
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      alertQuantity: parseInt(form.alertQuantity) || 5,
      ...(form.sku && { sku: form.sku }),
      ...(form.categoryId && { categoryId: parseInt(form.categoryId) }),
      ...(form.brandId && { brandId: parseInt(form.brandId) }),
    };
    if (editProduct)
      updateMutation.mutate({ id: String(editProduct.id), data: payload });
    else createMutation.mutate(payload);
  }

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const lowStock = products.filter((p) => {
    const qty = p.stocks?.reduce((s, st) => s + st.quantity, 0) ?? 0;
    return qty <= p.alertQuantity;
  }).length;
  const outOfStock = products.filter((p) => {
    const qty = p.stocks?.reduce((s, st) => s + st.quantity, 0) ?? 0;
    return qty === 0;
  }).length;
  const active = products.filter((p) => p.status).length;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Products' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Product
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Products',
            value: total,
            icon: <Package size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'Active',
            value: active,
            icon: <Tag size={20} className="text-blue-500" />,
          },
          {
            label: 'Low Stock',
            value: lowStock,
            icon: <AlertTriangle size={20} className="text-amber-500" />,
          },
          {
            label: 'Out of Stock',
            value: outOfStock,
            icon: <Boxes size={20} className="text-red-500" />,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {isLoading ? '—' : s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={handleSearchKey}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-56 transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Product',
                  'SKU',
                  'Category',
                  'Purchase',
                  'Selling',
                  'Status',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">No products found</p>
                    <p className="text-sm mt-1">
                      Add your first product to get started
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs shrink-0">
                          {p.title.charAt(0)}
                        </div>
                        <span className="font-semibold text-[var(--foreground)] text-base">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {p.sku ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {p.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] font-medium">
                      {formatCurrency(p.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status ? 'success' : 'default'}>
                        {p.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === p.id ? null : p.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === p.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'View / Edit',
                              icon: <Eye size={14} />,
                              onClick: () => {
                                setOpenMenuId(null);
                                openEdit(p);
                              },
                            },
                            {
                              label: 'Edit',
                              icon: <Edit size={14} />,
                              onClick: () => {
                                setOpenMenuId(null);
                                openEdit(p);
                              },
                            },
                            {
                              label: 'Duplicate',
                              icon: <Copy size={14} />,
                              onClick: () => {
                                setOpenMenuId(null);
                                duplicateMutation.mutate(p.id);
                              },
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => setDeleteId(p.id),
                            },
                          ]}
                        />
                      </DropdownTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={Math.max(1, totalPages)}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editProduct ? `Edit: ${editProduct.title}` : 'Add New Product'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Product Name *"
            placeholder="e.g. Samsung Galaxy A55"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={formErrors.title}
          />
          <Input
            label="SKU (optional)"
            placeholder="e.g. SKU-0001"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Purchase Price"
              type="number"
              placeholder="0.00"
              value={form.purchasePrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, purchasePrice: e.target.value }))
              }
              error={formErrors.purchasePrice}
            />
            <Input
              label="Selling Price *"
              type="number"
              placeholder="0.00"
              value={form.sellingPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, sellingPrice: e.target.value }))
              }
              error={formErrors.sellingPrice}
            />
          </div>
          <Input
            label="Alert Quantity"
            type="number"
            placeholder="5"
            value={form.alertQuantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, alertQuantity: e.target.value }))
            }
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select category...</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Brand
            </label>
            <select
              value={form.brandId}
              onChange={(e) =>
                setForm((f) => ({ ...f, brandId: e.target.value }))
              }
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select brand...</option>
              {(brands ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmLabel="Delete"
      />
    </div>
  );
}
