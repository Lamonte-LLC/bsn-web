import type { ReactNode } from 'react';
import Link from 'next/link';
import ArchivoShell from './ArchivoShell';
import ShareButton from './ShareButton';
import { HeroEyebrow, HeroTitle } from './ui';

interface Props {
  title: string;
  /** Two-line editorial context under the title. */
  context: string;
  /** Optional hero number rendered next to the title (e.g. "16 de 74"). */
  heroNumber?: ReactNode;
  heroNumberLabel?: ReactNode;
  children: ReactNode;
}

/** Shared frame for the "El BSN en números" views: title, context, share button, then the visual. */
export default function InsightPage({ title, context, heroNumber, heroNumberLabel, children }: Props) {
  return (
    <ArchivoShell
      hero={
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <HeroEyebrow>
              <Link href="/archivo/en-numeros" className="hover:text-white">
                El BSN en números
              </Link>
            </HeroEyebrow>
            <HeroTitle>{title}</HeroTitle>
            <p className="mt-[12px] max-w-[62ch] font-barlow text-[15px] font-medium leading-[1.4] text-white/75 lg:text-[16px]">{context}</p>
          </div>
          {heroNumber !== undefined ? (
            <div className="shrink-0 md:text-right">
              <div className="text-[56px] leading-[1] text-white [font-variant-numeric:tabular-nums] lg:text-[72px]">{heroNumber}</div>
              {heroNumberLabel ? <div className="mt-[4px] font-barlow text-[13px] font-medium uppercase tracking-[1px] text-white/60">{heroNumberLabel}</div> : null}
            </div>
          ) : null}
        </div>
      }
    >
      <div className="mb-6 flex justify-end">
        <ShareButton />
      </div>
      {children}
    </ArchivoShell>
  );
}
