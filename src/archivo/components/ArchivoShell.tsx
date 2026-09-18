import type { ReactNode } from 'react';
import Link from 'next/link';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import HistoriaSubnav, { type HistoriaSubnavKey } from '@/historia/components/HistoriaSubnav';
import { cls } from '../lib/tokens';
import ArchivoNav from './ArchivoNav';
import { SearchIcon } from './ui';

/** Public hero of a historical view mounted under /estadisticas: centered title in the band, section pills on paper. */
export interface SiteHero {
  title: ReactNode;
  /** One quiet line under the title (count, span, minimum). */
  meta?: ReactNode;
  /** Active pill of the Historia row. */
  nav: HistoriaSubnavKey;
}

interface Props {
  children: ReactNode;
  /** Optional hero content rendered inside the dark band, under the archive nav. Ignored when `site` is set. */
  hero?: ReactNode;
  /** Extra bottom padding on the band so the first paper block can pull up into it. */
  overlap?: boolean;
  /** Render as a page of bsnpr.com (Estadísticas · Historia) instead of the archive: no wordmark, no archive nav. */
  site?: SiteHero;
}

/** Provisional typographic wordmark until the league supplies the asset. "BSN" in the league red. */
export function ArchivoWordmark({ className = '' }: { className?: string }) {
  return (
    <Link href="/archivo" className={`inline-flex items-baseline gap-[5px] text-[20px] leading-[1] text-white lg:text-[24px] ${cls.wordmark} ${cls.focusOnDark} ${className}`} aria-label="Archivo BSN, inicio">
      ARCHIVO <span className="text-[#E51F1F]">BSN</span>
    </Link>
  );
}

/**
 * Page shell for every /archivo route: the site header and footer from bsn-web, plus the archive's own
 * sub-header (wordmark, section tabs, optional hero) inside the ink band. Content starts at the same
 * coordinate on every page (the site container).
 *
 * With `site`, the same content renders as a public page of Estadísticas: the band carries only the eyebrow
 * "Estadísticas · Historia" and a centered title (as in /jugadores/comparar), and the Historia pills sit at
 * the top of the paper.
 */
export default function ArchivoShell({ children, hero, overlap = false, site }: Props) {
  if (site) {
    return (
      <FullWidthLayout
        divider
        subheader={
          <div className="container pb-[26px] pt-[26px] text-center lg:pb-[40px] lg:pt-[42px]">
            <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.5)]">Estadísticas · Historia</p>
            <h1 className="mt-[8px] text-[30px] leading-[1] tracking-[0.4px] text-white lg:text-[42px]">{site.title}</h1>
            {site.meta ? <p className="mt-[8px] font-barlow text-[14px] font-medium text-[rgba(255,255,255,0.6)]">{site.meta}</p> : null}
            <HistoriaSubnav active={site.nav} className="mt-[18px] lg:mt-[22px]" />
          </div>
        }
      >
        <div className="bg-[#FDFDFD]">
          <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">{children}</div>
        </div>
      </FullWidthLayout>
    );
  }

  return (
    <FullWidthLayout
      divider
      subheader={
        <div className={overlap ? 'pb-[54px] lg:pb-[64px]' : ''}>
          <div className="container">
            <div className="flex flex-row items-center justify-between gap-4 pb-[12px] pt-[14px] lg:pb-[14px] lg:pt-[18px]">
              <ArchivoWordmark />
              <Link href="/archivo/jugadores" className={`inline-flex h-[32px] items-center gap-[7px] font-barlow text-[13px] font-medium text-white/75 transition-colors duration-150 hover:text-white ${cls.focusOnDark}`}>
                <SearchIcon />
                <span className="hidden sm:inline">Buscar jugador</span>
                <span className="sr-only sm:hidden">Buscar jugador</span>
              </Link>
            </div>
            <ArchivoNav />
          </div>
          {hero ? <div className="container pb-[28px] pt-[24px] lg:pb-[32px] lg:pt-[28px]">{hero}</div> : null}
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className={`container ${overlap ? '-mt-[34px]' : 'pt-[24px] lg:pt-[32px]'} pb-[48px] lg:pb-[64px]`}>{children}</div>
      </div>
    </FullWidthLayout>
  );
}
