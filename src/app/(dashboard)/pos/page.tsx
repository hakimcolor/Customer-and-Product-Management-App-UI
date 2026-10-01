'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';
import { customersApi } from '@/lib/api/endpoints';

interface POSProduct {
  id: number;
  title: string;
  sellingPrice: number;
  sku?: string;
  stocks?: { quantity: number }[];
  alertQuantity: number;
}
interface Customer {
  id: number;
  name: string;
}
interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('cash');
  const [paid, setPaid] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: productsRaw, isLoading: productsLoading } = useQuery<
    POSProduct[]
  >({
    queryKey: ['pos-products', debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/pos/search', {
        params: { q: debouncedSearch || undefined, limit: 24 },
      });
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const { data: customersRaw } = useQuery<Customer[]>({
    queryKey: ['customers-pos'],
    queryFn: async () => {
      const res = await customersApi.getAll({ limit: 200 });
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post('/pos/checkout', payload),
    onSuccess: (res) => {
      const inv = res.data?.data?.invoiceNo ?? res.data?.invoiceNo ?? '';
      toast.success(`Payment successful! ${inv}`);
      clearCart();
      setPaid('');
      setPayOpen(false);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Payment failed');
    },
  });

  const products: POSProduct[] = productsRaw ?? [];
  const customers: Customer[] = customersRaw ?? [];

  function getStock(p: POSProduct) {
    return p.stocks?.reduce((s, st) => s + st.quantity, 0) ?? 0;
  }

  function addToCart(p: POSProduct) {
    const stock = getStock(p);
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) {
        if (ex.qty >= stock) {
          toast.warning(`Only ${stock} in stock`);
          return prev;
        }
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { id: p.id, name: p.title, price: p.sellingPrice, qty: 1, stock },
      ];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next = i.qty + delta;
        if (next > i.stock) {
          toast.warning(`Only ${i.stock} in stock`);
          return i;
        }
        return next < 1 ? i : { ...i, qty: next };
      })
    );
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }
  function clearCart() {
    setCart([]);
    setDiscount(0);
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, Number(paid) - total);

  function handlePay() {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    checkoutMutation.mutate({
      customerId: customerId ? parseInt(customerId) : undefined,
      items: cart.map((i) => ({
        productId: i.id,
        quantity: i.qty,
        price: i.price,
      })),
      discount,
      paidAmount: Number(paid) || total,
      paymentMethod: payMethod.toUpperCase(),
    });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-5 overflow-hidden bg-[var(--background)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="p-4 bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-foreground">Point of Sale</h1>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or scan barcode..."
              className="cursor-text w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse bg-gray-200 dark:bg-slate-700 rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((p) => {
                const stock = getStock(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={stock === 0}
                    className="cursor-pointer flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-[var(--primary-light)] hover:shadow-md active:scale-95 transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center mb-2.5 text-primary font-bold text-lg transition-colors select-none">
                      {p.title.charAt(0)}
                    </div>
                    <p className="text-xs font-medium text-foreground text-center leading-tight mb-1 line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(p.sellingPrice)}
                    </p>
                    {stock <= p.alertQuantity && stock > 0 && (
                      <Badge variant="warning" className="mt-1 text-[10px]">
                        Low: {stock}
                      </Badge>
                    )}
                    {stock === 0 && (
                      <Badge variant="danger" className="mt-1 text-[10px]">
                        Out
                      </Badge>
                    )}
                  </button>
                );
              })}
              {!productsLoading && products.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No products found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 lg:w-96 flex flex-col bg-card shrink-0">
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-white select-none">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted gap-3">
              <ShoppingCart size={44} className="opacity-20" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs">Click products to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-background hover:border-primary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="cursor-pointer w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 text-foreground active:scale-90 transition-all"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-foreground select-none">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="cursor-pointer w-6 h-6 rounded-md bg-[var(--primary-light)] flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/40 text-primary active:scale-90 transition-all"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="cursor-pointer text-red-400 hover:text-red-600 transition-colors mt-0.5"
                      aria-label="Remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-border shrink-0">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Discount</span>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) =>
                    setDiscount(Math.max(0, Number(e.target.value)))
                  }
                  placeholder="0"
                  className="cursor-text w-24 text-right px-2 py-1 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info('Hold feature coming soon')}
              >
                Hold
              </Button>
              <Button className="w-full" onClick={() => setPayOpen(true)}>
                Pay Now
              </Button>
            </div>
            <button
              onClick={clearCart}
              className="cursor-pointer w-full flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Complete Payment"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              icon={<CreditCard size={15} />}
              loading={checkoutMutation.isPending}
            >
              Confirm Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--primary-light)] dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted uppercase tracking-wider">
              Amount Due
            </p>
            <p className="text-3xl font-bold text-primary mt-1">
              {formatCurrency(total)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
                { id: 'card', label: 'Card', icon: <CreditCard size={16} /> },
                {
                  id: 'mobile',
                  label: 'Mobile',
                  icon: <span className="text-sm">📱</span>,
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all select-none ${
                    payMethod === m.id
                      ? 'border-primary bg-[var(--primary-light)] text-primary'
                      : 'border-border text-foreground hover:border-primary hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {payMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Amount Tendered
                </label>
                <input
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder={String(total)}
                  className="cursor-text w-full px-3 py-2.5 text-lg font-bold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              {paid && Number(paid) >= total && (
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Change
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
