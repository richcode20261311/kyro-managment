import type { Metadata, Viewport } from 'next';
import { SerwistProvider } from '@serwist/turbopack/react';
import { OfflineBanner, ToastProvider } from '@aki/ui';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource-variable/inter';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AKI Admin',
  description: 'Gestión de restaurantes — AKI Cocina Oriental',
  manifest: '/manifest.webmanifest',
  applicationName: 'AKI Admin',
  appleWebApp: {
    capable: true,
    title: 'AKI Admin',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F5F5',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>
        <SerwistProvider swUrl="/serwist/sw.js" reloadOnOnline>
          <Providers>
            <ToastProvider>
              <OfflineBanner />
              {children}
            </ToastProvider>
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
