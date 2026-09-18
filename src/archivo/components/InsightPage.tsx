import type { ReactNode } from 'react';
import Link from 'next/link';
import { hrefs } from '../lib/hrefs';
import { cls } from '../lib/tokens';
import ArchivoShell from './ArchivoShell';
import ShareButton from './ShareButton';
import { HeroEyebrow, HeroTitle, Note } from './ui';

interface Props {
  title: string;
  /** One or two editorial lines under the title. */
  context: string;
  /** Hero number rendered in the league red next to the title (e.g. "16 de 74"). */
  heroNumber?: ReactNode;
  heroNumberLabel?: ReactNode;
  /** Source line under the visual. */
  source?: ReactNode;
  /** Hide the header's Compartir when the view has its own controls row. */
  share?: boolean;
  /** Render under /estadisticas/en-numeros with the public hero instead of the archive band. */
  site?: boolean;
  children: ReactNode;
}

/**
 * Shared frame of "El BSN en números": the band keeps the section identity, the paper opens with the view's
 * title, its hero number in red, the context line and Compartir, then the visual and its source line.
 *
 * On the public site the band carries the view's title, so the paper opens with the section eyebrow (a link
 * back to the hub), the hero number and the context.
 */
export default function InsightPage({ title, context, heroNumber, heroNumberLabel, source, share = true, site = false, children }: Props) {
  const h = hrefs(site);
  const number =
    heroNumber !== undefined ? (
      <span className="inline-flex items-baseline gap-[10px]">
        <span className={`text-[30px] leading-[1] text-[#E51F1F] md:text-[34px] ${cls.tabular}`}>{heroNumber}</span>
        {heroNumberLabel ? <span className="font-barlow text-[13px] font-medium text-[rgba(0,0,0,0.5)]">{heroNumberLabel}</span> : null}
      </span>
    ) : null;

  return (
    <ArchivoShell
      site={site ? { title, nav: 'en-numeros' } : undefined}
      hero={
        <div>
          <HeroEyebrow>Historias con data</HeroEyebrow>
          <HeroTitle>
            <Link href={h.enNumeros()} className={`rounded-[4px] ${cls.focusOnDark}`}>
              El BSN en números
            </Link>
          </HeroTitle>
        </div>
      }
    >
      <div className="flex flex-col gap-[16px] pb-[6px] md:flex-row md:items-start md:justify-between md:gap-[24px]">
        <div className="max-w-[560px]">
          {site ? (
            <Link href={h.enNumeros()} className={`inline-block ${cls.eyebrow} rounded-[4px] transition-colors duration-150 hover:text-[#0F171F] ${cls.focus}`}>
              El BSN en números
            </Link>
          ) : (
            <p className={cls.eyebrow}>El BSN en números</p>
          )}
          <div className="mt-[6px] flex flex-wrap items-baseline gap-x-[16px] gap-y-[4px]">
            {site ? null : <h1 className="text-[30px] leading-[1] text-[#0F171F] md:text-[34px]">{title}</h1>}
            {number}
          </div>
          <p className={`mt-[12px] ${cls.body}`}>{context}</p>
        </div>
        {share ? <ShareButton className="self-start md:mt-[4px]" /> : null}
      </div>
      <div className="mt-[16px]">{children}</div>
      {source ? <Note className="mt-[16px] !max-w-none !text-[12px] !text-[rgba(0,0,0,0.45)]">{source}</Note> : null}
    </ArchivoShell>
  );
}
