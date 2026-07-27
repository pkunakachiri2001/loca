import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { GlobalVideoBackground } from '@/components/ui/GlobalVideoBackground';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'FleetNest — Every Journey Starts Here',
    template: '%s | FleetNest',
  },
  description:
    "FleetNest is Zimbabwe's premier transportation marketplace. Book car rentals, buses, drivers, mechanics, car washes, and more from verified providers near you.",
  keywords: [
    'car rental Zimbabwe', 'bus charter', 'driver hire', 'mechanic', 'car wash', 'vehicle marketplace',
    'transportation services', 'FleetNest', 'book driver Harare', 'hire bus Bulawayo',
  ],
  authors: [{ name: 'FleetNest Technologies Ltd' }],
  creator: 'FleetNest',
  publisher: 'FleetNest Technologies Ltd',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'FleetNest',
    title: 'FleetNest — Every Journey Starts Here',
    description: 'Book car rentals, buses, drivers, mechanics, and more from verified providers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FleetNest' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FleetNest — Every Journey Starts Here',
    description: 'Book transportation services from verified providers.',
    images: ['/og-image.png'],
    creator: '@fleetnest',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased relative" style={{ background: '#0E0E10', color: '#F5F0E8' }}>
        <Providers>
          <GlobalVideoBackground />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
