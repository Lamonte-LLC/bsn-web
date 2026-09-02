import type { ReactNode } from 'react';
import Link from 'next/link';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import ArchivoNav from './ArchivoNav';

interface Props {
  children: ReactNode;
  /** Optional hero content rendered inside the dark band, under the archive nav. */
  hero?: ReactNode;
  /** Extra bottom padding on the band so the first paper section can pull up into it. */
  overlap?: boolean;
}

export function ArchivoWordmark({ className = '' }: { className?: string }) {
  return (
    <Link href="/archivo" className={`inline-flex items-baseline gap-[6px] ${className}`} aria-label="Archivo BSN">
      <span className="text-[26px] italic tracking-[0.5px] text-white lg:text-[30px]">ARCHIVO</span>
      <span className="text-[26px] italic tracking-[0.5px] text-[#E51F1F] lg:text-[30px]">BSN</span>
    </Link>
  );
}

/**
 * Page shell for every /archivo route: the site header and footer from bsn-web, plus the archive's own
 * sub-header (wordmark, section tabs, optional hero) inside the ink band.
 */
export default function ArchivoShell({ children, hero, overlap = false }: Props) {
  return (
    <FullWidthLayout
      divider
      subheader={
        <div className={overlap ? 'pb-[60px] lg:pb-[70px]' : ''}>
          <div className="container">
            <div className="flex flex-row items-center justify-between gap-4 pt-[14px] lg:pt-[20px]">
              <ArchivoWordmark />
              <Link
                href="/archivo/jugadores"
                className="font-barlow text-[13px] font-medium text-white/70 transition-colors duration-150 hover:text-white lg:text-[14px]"
              >
                Buscar jugador
              </Link>
            </div>
            <div className="mt-[12px] lg:mt-[16px]">
              <ArchivoNav />
            </div>
          </div>
          {hero ? <div className="container pt-[24px] pb-[28px] lg:pt-[40px] lg:pb-[44px]">{hero}</div> : <div className="pb-[4px]" />}
        </div>
      }
    >
      <div className="bg-[#fdfdfd]">
        <div className={`container ${overlap ? '-mt-[40px] lg:-mt-[50px]' : 'pt-6 lg:pt-10'} pb-12 lg:pb-16`}>{children}</div>
      </div>
    </FullWidthLayout>
  );
}
