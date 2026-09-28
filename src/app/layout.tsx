import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastContainer } from '@/components/ui/Toast';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Business ERP',
  description: 'Customer & Product Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${merriweather.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
            <ToastContainer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
