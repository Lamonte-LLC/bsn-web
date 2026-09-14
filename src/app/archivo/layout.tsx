import type { ReactNode } from 'react';
import { Barlow_Condensed } from 'next/font/google';

// The site layout loads Barlow Condensed 400 only. The archive wordmark needs the 800 italic, so it is loaded
// here and exposed as a CSS variable scoped to /archivo (see lib/tokens.ts `cls.wordmark`).
const barlowCondensedHeavy = Barlow_Condensed({
  variable: '--font-bc-heavy',
  subsets: ['latin'],
  weight: ['800'],
  style: ['italic'],
  display: 'swap',
});

export default function ArchivoLayout({ children }: { children: ReactNode }) {
  return <div className={barlowCondensedHeavy.variable}>{children}</div>;
}
