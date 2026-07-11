import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';
import ClientShell from '@/components/ClientShell';
import { AppProvider } from '@/context/AppContext';

const fontSans = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const fontMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stadium-guardian.vercel.app';

export const metadata: Metadata = {
  // ─── Core ────────────────────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Stadium Guardian AI — Smart Stadium Operations',
    template: '%s | Stadium Guardian AI',
  },
  description:
    'Real-time AI crowd control, smart waste management, and emergency response orchestration for FIFA World Cup-scale stadiums. Powered by Google Gemini & Firebase.',
  keywords: [
    'stadium operations',
    'crowd management AI',
    'smart stadium',
    'FIFA World Cup',
    'emergency response',
    'sustainability',
    'Google Gemini',
    'real-time telemetry',
  ],
  authors: [{ name: 'Stadium Guardian AI', url: BASE_URL }],
  creator: 'Stadium Guardian AI',
  publisher: 'Stadium Guardian AI',
  category: 'Sports Technology',

  // ─── Canonical & Robots ──────────────────────────────────────────────────
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },

  // ─── OpenGraph ───────────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Stadium Guardian AI',
    title: 'Stadium Guardian AI — Smart Stadium Operations',
    description:
      'Explainable AI-powered real-time safety, crowd, and sustainability control for FIFA World Cup mega-stadium operations.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stadium Guardian AI — Smart Stadium Operations Dashboard',
      },
    ],
  },

  // ─── Twitter / X Card ────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Stadium Guardian AI — Smart Stadium Operations',
    description:
      'Explainable AI-powered real-time safety, crowd, and sustainability control for FIFA World Cup mega-stadium operations.',
    images: ['/og-image.png'],
    creator: '@stadium_guardian',
  },

  // ─── Icons & PWA ─────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',

  // ─── App Links ───────────────────────────────────────────────────────────
  applicationName: 'Stadium Guardian AI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stadium Guardian AI',
  },

  // ─── Verification ────────────────────────────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} h-full dark antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans">
        <AppProvider>
          <ClientShell>{children}</ClientShell>
        </AppProvider>
      </body>
    </html>
  );
}
