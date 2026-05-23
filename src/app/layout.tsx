import type { Metadata } from 'next';
import './globals.css';
import { TenantProvider } from '@/lib/TenantProvider';

export const metadata: Metadata = {
  title: 'Proyecto Terra - GIS Ventas',
  description: 'Sistema GIS de administración de ventas para lotificadora',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--color-map-bg)' }}>
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}
