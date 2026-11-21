import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowPlus Admin Management Portal',
  description: 'Production administration, order fulfillment, product catalog, and reward compliance for GrowPlus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
