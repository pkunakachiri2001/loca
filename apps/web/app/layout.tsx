import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { GlobalVideoBackground } from '@/components/ui/GlobalVideoBackground';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Famba — Move More. Live Better.',
    template: '%s | Famba',
  },
  description:
    "Famba is Zimbabwe's premier all-in-one transportation & delivery platform. Book car rentals, buses, drivers, mechanics, deliveries, and more from verified providers near you.",
  keywords: [
    'car rental Zimbabwe', 'bus charter', 'driver hire', 'mechanic', 'car wash', 'vehicle marketplace',
    'transportation services', 'Famba', 'book driver Harare', 'hire bus Bulawayo', 'deliveries Zimbabwe',
  ],
  authors: [{ name: 'Famba Technologies Ltd' }],
  creator: 'Famba',
  publisher: 'Famba Technologies Ltd',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Famba',
    title: 'Famba — Move More. Live Better.',
    description: 'Book car rentals, buses, drivers, mechanics, deliveries, and more from verified providers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Famba' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Famba — Move More. Live Better.',
    description: 'Book transportation & delivery services from verified providers.',
    images: ['/og-image.png'],
    creator: '@famba',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased relative bg-[#FAFCFB] text-[#0B192C]">
        <Providers>
          <GlobalVideoBackground />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
