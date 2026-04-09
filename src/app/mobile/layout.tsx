import type { Metadata, Viewport } from 'next';
import {
  Barlow,
  Barlow_Condensed,
  Special_Gothic_Condensed_One,
} from 'next/font/google';
import '../globals.css';

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['400'],
});

const specialGothicCondensedOne = Special_Gothic_Condensed_One({
  variable: '--font-special-gothic-condensed-one',
  subsets: ['latin'],
  weight: ['400'],
  adjustFontFallback: false,
});

const siteTitle =
  'BSN – Baloncesto Superior Nacional | Juegos, Resultados y Stats';
const siteDescription =
  'Sitio oficial del Baloncesto Superior Nacional. Sigue resultados en vivo, calendario de juegos, estadísticas, noticias y highlights de la liga.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://bsnpr.com'
  ),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    siteName: 'BSN – Baloncesto Superior Nacional',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F171F',
};

export default function MobileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${specialGothicCondensedOne.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
