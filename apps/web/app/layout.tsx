import type { Metadata, Viewport } from 'next';
import { OfflineBanner, ToastProvider } from '@aki/ui';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource-variable/inter';
import './globals.css';

export const metadata: Metadata = {
  title: 'AKI Admin',
  description: 'Gestión de restaurantes — AKI Cocina Oriental',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>
        <ToastProvider>
          <OfflineBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
