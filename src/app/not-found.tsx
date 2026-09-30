import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-center p-4">
      <div className="mb-6 p-5 rounded-2xl bg-[var(--primary-light)]">
        <span className="text-5xl">🔍</span>
      </div>
      <h1 className="text-6xl font-bold text-[var(--primary)] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        Page Not Found
      </h2>
      <p className="text-[var(--muted)] mb-6 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
