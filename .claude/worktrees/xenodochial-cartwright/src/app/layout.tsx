import type { Metadata, Viewport } from 'next';
import {
  Barlow,
  Barlow_Condensed,
  Special_Gothic_Condensed_One,
} from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';
import './globals.css';
import { ApolloWrapper } from './ApolloWrapper';
import AdManager from '@/shared/client/components/gtm/AdManager';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      {/*
        Chunk 404 after deploy → ChunkLoadError before/during hydration; body bg shows as “black screen”.
        Runs in initial HTML (beforeInteractive), no React chunk required.
      */}
      <Script
        id="bsn-chunk-load-recovery"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var k='bsn-chunk-load-reload-used';function hit(m){m=String(m||'').toLowerCase();return m.indexOf('chunkloaderror')>=0||m.indexOf('failed to load chunk')>=0||m.indexOf('loading chunk')>=0||m.indexOf('failed to fetch dynamically imported module')>=0||m.indexOf('importing a module script failed')>=0;}function go(m){if(!hit(m)||sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');location.reload();}window.addEventListener('error',function(e){go((e&&e.message||'')+' '+(e.filename||''));});window.addEventListener('unhandledrejection',function(e){var r=e.reason;go(r&&r.message||String(r));});})();`,
        }}
      />
      <Script
        async
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="afterInteractive"
      />
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${specialGothicCondensedOne.variable}  antialiased`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
        <AdManager />
      </body>
    </html>
  );
}
