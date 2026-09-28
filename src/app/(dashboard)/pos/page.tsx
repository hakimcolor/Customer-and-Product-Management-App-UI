'use client';
import { useState } from 'react';
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

const PRODUCTS = [
  { id: '1', name: 'Samsung A55', price: 45000, sku: 'SM-A55', stock: 12 },
  { id: '2', name: 'iPhone 15', price: 120000, sku: 'IP-15', stock: 5 },
  { id: '3', name: 'USB Cable', price: 250, sku: 'USB-01', stock: 55 },
  { id: '4', name: 'Wireless Mouse', price: 1800, sku: 'WM-01', stock: 3 },
  { id: '5', name: 'Keyboard', price: 5500, sku: 'KB-01', stock: 18 },
  { id: '6', name: 'Monitor 24"', price: 28000, sku: 'MON-24', stock: 8 },
  { id: '7', name: 'Laptop Bag', price: 3500, sku: 'LB-01', stock: 22 },
  { id: '8', name: 'HDMI Cable', price: 800, sku: 'HDM-01', stock: 42 },
  { id: '9', name: 'Power Bank', price: 4500, sku: 'PB-01', stock: 15 },
  { id: '10', name: 'Earphones', price: 1200, sku: 'EP-01', stock: 30 },
  { id: '11', name: 'Smart Watch', price: 15000, sku: 'SW-01', stock: 7 },
  { id: '12', name: 'Tablet Stand', price: 2200, sku: 'TS-01', stock: 19 },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState('Walk-in Customer');
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('cash');
  const [paid, setPaid] = useState('');

  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: (typeof PRODUCTS)[0]) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) {
        if (ex.qty >= product.stock) {
          toast.warning(`Only ${product.stock} in stock`);
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
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
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, Number(paid) - total);

  const handlePay = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Payment successful! Receipt printed.');
    clearCart();
    setPaid('');
    setPayOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-5 overflow-hidden bg-[var(--background)]">
      {/* Products */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-[var(--border)]">
        <div className="p-4 bg-[var(--card)] border-b border-[var(--border)] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-[var(--foreground)]">
              Point of Sale
            </h1>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option>Walk-in Customer</option>
              <option>Rahim Enterprise</option>
              <option>Karim Store</option>
              <option>ABC Ltd.</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or scan barcode..."
              className="cursor-text w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
                className="cursor-pointer flex flex-col items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:shadow-md active:scale-95 transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center mb-2.5 text-[var(--primary)] font-bold text-lg transition-colors select-none">
                  {p.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-[var(--foreground)] text-center leading-tight mb-1 line-clamp-2">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-[var(--primary)]">
                  {formatCurrency(p.price)}
                </p>
                {p.stock <= 5 && p.stock > 0 && (
                  <Badge variant="warning" className="mt-1 text-[10px]">
                    Low: {p.stock}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 lg:w-96 flex flex-col bg-[var(--card)] shrink-0">
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)] text-white select-none">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted)] gap-3">
              <ShoppingCart size={44} className="opacity-20" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs">Click products to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="cursor-pointer w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 text-[var(--foreground)] active:scale-90 transition-all"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-[var(--foreground)] select-none">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="cursor-pointer w-6 h-6 rounded-md bg-[var(--primary-light)] flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/40 text-[var(--primary)] active:scale-90 transition-all"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">
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
          <div className="p-4 border-t border-[var(--border)] shrink-0">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[var(--muted)]">
                <span>Discount</span>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) =>
                    setDiscount(Math.max(0, Number(e.target.value)))
                  }
                  placeholder="0"
                  className="cursor-text w-24 text-right px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                />
              </div>
              <div className="flex justify-between font-bold text-base text-[var(--foreground)] pt-2 border-t border-[var(--border)]">
                <span>Total</span>
                <span className="text-[var(--primary)] text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.success('Sale held')}
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
            <Button onClick={handlePay} icon={<CreditCard size={15} />}>
              Confirm Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--primary-light)] dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              Amount Due
            </p>
            <p className="text-3xl font-bold text-[var(--primary)] mt-1">
              {formatCurrency(total)}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">{customer}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">
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
                      ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-gray-50 dark:hover:bg-slate-800'
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
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                  Amount Tendered
                </label>
                <input
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder={String(total)}
                  className="cursor-text w-full px-3 py-2.5 text-lg font-bold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                />
              </div>
              {paid && Number(paid) >= total && (
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">
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
