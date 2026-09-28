'use client';
import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';

const mockProducts = [
  { id: '1', name: 'Samsung A55', price: 45000, sku: 'SM-A55' },
  { id: '2', name: 'iPhone 15', price: 120000, sku: 'IP-15' },
  { id: '3', name: 'USB Cable', price: 250, sku: 'USB-01' },
  { id: '4', name: 'Wireless Mouse', price: 1800, sku: 'WM-01' },
  { id: '5', name: 'Keyboard', price: 5500, sku: 'KB-01' },
  { id: '6', name: 'Monitor 24"', price: 28000, sku: 'MON-24' },
  { id: '7', name: 'Laptop Bag', price: 3500, sku: 'LB-01' },
  { id: '8', name: 'HDMI Cable', price: 800, sku: 'HDM-01' },
  { id: '9', name: 'Power Bank', price: 4500, sku: 'PB-01' },
  { id: '10', name: 'Earphones', price: 1200, sku: 'EP-01' },
  { id: '11', name: 'Smart Watch', price: 15000, sku: 'SW-01' },
  { id: '12', name: 'Tablet Stand', price: 2200, sku: 'TS-01' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState('Walk-in Customer');

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: (typeof mockProducts)[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, qty: 1 },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal - discount;

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-5 overflow-hidden">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col border-r border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-[var(--foreground)]">POS</h1>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option>Walk-in Customer</option>
              <option>Rahim Enterprise</option>
              <option>Karim Store</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or scan barcode..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center mb-2 text-[var(--primary)] font-bold transition-colors">
                  {product.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-[var(--foreground)] text-center leading-tight mb-1">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-[var(--primary)]">
                  {formatCurrency(product.price)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 lg:w-96 flex flex-col bg-[var(--card)]">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                {cart.reduce((s, i) => s + i.qty, 0)} items
              </span>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted)]">
              <ShoppingCart size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Click products to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-[var(--primary-light)] flex items-center justify-center hover:bg-green-200 transition-colors text-[var(--primary)]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 mt-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[var(--border)]">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--muted)]">
                <span>Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 text-right px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="flex justify-between font-bold text-base text-[var(--foreground)] pt-2 border-t border-[var(--border)]">
                <span>Total</span>
                <span className="text-[var(--primary)]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full">
                Hold
              </Button>
              <Button className="w-full">Pay Now</Button>
            </div>
            <button
              onClick={() => setCart([])}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors py-1"
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
