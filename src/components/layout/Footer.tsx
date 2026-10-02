export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] px-6 py-4 text-center text-sm text-[var(--muted)]">
      <span>
        &copy; {year}{' '}
        <span className="font-semibold text-[var(--primary)]">BizManager</span>.
        All rights reserved.
      </span>
    </footer>
  );
}
