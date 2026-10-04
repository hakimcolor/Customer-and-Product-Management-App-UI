<div align="center">

# 🖥️ Business ERP — Frontend

**Next.js · TypeScript · Tailwind CSS · TanStack Query**

A modern, responsive ERP frontend for managing sales, inventory, customers, suppliers, accounts, and more — built with a clean green & white design system.

</div>

---

## ✨ Tech Stack

| Tool                    | Purpose                |
| ----------------------- | ---------------------- |
| Next.js 14 (App Router) | Framework              |
| TypeScript              | Type safety            |
| Tailwind CSS            | Styling                |
| TanStack Query          | Server state & caching |
| React Hook Form + Zod   | Forms & validation     |
| Recharts                | Charts & analytics     |
| Lucide React            | Icons                  |

---

## 🎨 Design System

**Identity:** White · Green · Light Gray · Dark Gray

```
Primary Green    #16A34A
Dark Green       #15803D
Light Green      #DCFCE7
Background       #F8FAFC
Card             #FFFFFF
Border           #E5E7EB
Text             #1F2937
Muted            #6B7280
```

- Light & Dark mode toggle
- Fully responsive — Desktop · Tablet · Mobile
- Consistent CRUD pattern across all modules
- Reusable component library

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── (dashboard)/
│       ├── dashboard/
│       ├── pos/
│       ├── sales/
│       ├── purchases/
│       ├── products/
│       ├── customers/
│       ├── suppliers/
│       ├── inventory/
│       ├── accounts/
│       ├── ledger/
│       ├── reports/
│       ├── users/
│       └── settings/
├── components/
│   ├── ui/          # Button, Input, Card, Badge, Modal, Toast...
│   ├── layout/      # Sidebar, Navbar, Breadcrumb
│   ├── tables/
│   ├── forms/
│   └── charts/
├── lib/
│   ├── api/         # API client & endpoints
│   ├── utils/       # format, helpers
│   └── validations/ # Zod schemas
├── hooks/
├── types/
└── providers/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend README)

### Install & Run

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local → set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🗺️ Layout

```
┌─────────────────────────────────────────────────────┐
│ Sidebar │  Search    Branch ▼   🔔  Theme   👤 User │
│         ├─────────────────────────────────────────── │
│         │                                           │
│         │           Main Content                   │
│         │                                           │
└─────────────────────────────────────────────────────┘
```

- **Sidebar** — Collapsible, icons + labels, active state, grouped navigation
- **Top Navbar** — Global search, branch selector, notifications, theme toggle, user profile
- **Main Area** — Breadcrumb, page header, filters, data table / cards

---

## 📦 Key Pages & Features

### Dashboard

- KPI cards (Sales, Purchases, Profit, Cash Balance)
- Sales & Profit charts with period filters (7D · 30D · 3M · 1Y)
- Inventory alerts (Low Stock, Out of Stock, Slow Moving)
- Recent sales & customer dues overview
- 🤖 AI Business Copilot widget

### POS

- Barcode scanner & fast product search
- Cart with quantity, item discount, VAT
- Customer selection & walk-in support
- Cash · Card · Mobile payment
- Hold & resume sale
- Print invoice

### Products

- Full CRUD with image upload
- SKU, barcode, category, brand, unit
- Multi-tier pricing (purchase / wholesale / retail / min)
- Stock alerts, variants, import/export CSV

### Customers & Suppliers

- Profile with KPI summary (total sales, paid, due, orders)
- Tabs: Overview · Transactions · Payments · Returns · Ledger

### Ledger

- Date range & party filter
- Opening balance, total debit/credit, closing balance
- Paginated transaction table with running balance

### Reports

- Sales · Purchases · Inventory · Finance
- Date range, branch, warehouse filters
- Export PDF · Excel · Print

---

## 🧩 Reusable UI Components

```
Button     Input       Select      Modal
Card       Badge       Toast       Table
Dropdown   Pagination  DatePicker  SearchInput
PageHeader EmptyState  LoadingState ErrorState
```

---

## 📱 Responsive Behaviour

**Desktop** — Full sidebar + top navbar

**Tablet** — Collapsed sidebar with icon tooltips

**Mobile** — Bottom navigation bar

```
┌─────────────────────────────────┐
│         Main Content            │
├─────────────────────────────────┤
│  Home │ POS │ Sales │ Stock │ ☰ │
└─────────────────────────────────┘
```

---

## 🔐 Auth & Permissions

- JWT + HTTP-only cookies via backend
- Protected routes with session check
- Permission-based UI rendering (hide buttons/pages the user can't access)
- Branch-scoped data access

---

## 🛠️ Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run type-check # TypeScript check
```

---

## 🔗 Related

- [Backend README](../../backend/README.md)
- API base: `NEXT_PUBLIC_API_URL`

---

<div align="center">
Built with ❤️ using Next.js + TypeScript
</div>
