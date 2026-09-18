import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { cls } from '@/archivo/lib/tokens';
import type { Franchise } from '@/archivo/lib/types';
import { HOME_CARD } from './styles';

export interface AnniversaryRow {
  /** 50 or 25 */
  ago: number;
  year: number;
  /** "Cardenales de Río Piedras" */
  champion: string;
  franchise: Franchise | null;
  /** "Campeones · Bernie Bickerstaff · Final 4-3" */
  championLine: string;
  /** "Earl Brown", or null when the archive has no MVP that year. */
  mvpName: string | null;
  /** "Cardenales" */
  mvpTeam: string | null;
}

type Props = { rows: AnniversaryRow[] };

/**
 * Card B of the home section: the seasons 50 and 25 years back. Each row is one link to the season page:
 * span and big year, the champion's mark, champion with coach, final and MVP, and a chevron.
 */
export default function AnniversariesCard({ rows }: Props) {
  return (
    <article className={`${HOME_CARD} flex h-full flex-col px-[18px] pb-[6px] pt-[20px] md:px-[28px] md:pb-[8px] md:pt-[26px] lg:px-[32px] lg:pt-[30px]`}>
      <div className="flex items-baseline justify-between gap-[12px] border-b border-[rgba(0,0,0,0.08)] pb-[14px]">
        <h3 className="text-[22px] leading-[1] text-[#0F171F]">Aniversarios</h3>
        <p className={`hidden ${cls.meta} sm:block`}>campeones de hace 50 y 25 años</p>
      </div>

      <ul className="flex flex-1 flex-col justify-center">
        {rows.map((r, i) => (
          <li key={r.ago} className={i ? 'border-t border-[rgba(0,0,0,0.08)]' : ''}>
            <Link
              href={`/temporadas/${r.year}`}
              className={`group -mx-[10px] grid grid-cols-[72px_minmax(0,1fr)_16px] items-center gap-[14px] rounded-[8px] px-[10px] py-[18px] transition-colors duration-150 hover:bg-[#FAFAFA] md:grid-cols-[96px_64px_minmax(0,1fr)_16px] md:gap-[18px] md:py-[24px] ${cls.focus}`}
            >
              <div>
                <p className={`${cls.label} leading-[1.3]`}>
                  Hace {r.ago}
                  <br />
                  años
                </p>
                <p className={`mt-[4px] text-[36px] leading-[1] text-[#0F171F] md:text-[44px] ${cls.tabular}`}>{r.year}</p>
              </div>
              <span className="hidden md:inline-flex">
                <FranchiseLogo franchise={r.franchise} sizePx={64} fallbackName={r.champion} />
              </span>
              <div className="min-w-0">
                <p className="text-[20px] leading-[1.1] text-[#0F171F] md:text-[22px]">{r.champion}</p>
                <p className={`mt-[4px] font-barlow text-[14px] leading-[1.35] text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>{r.championLine}</p>
                {r.mvpName ? (
                  <p className="mt-[2px] font-barlow text-[14px] leading-[1.35] text-[rgba(15,23,31,0.6)]">
                    <b className="font-semibold text-[#0F171F]">MVP</b> {r.mvpName}
                    {r.mvpTeam ? ` · ${r.mvpTeam}` : ''}
                  </p>
                ) : null}
              </div>
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(15,23,31,0.45)] transition-transform duration-200 ease-out group-hover:translate-x-[2px] motion-reduce:transition-none">
                <path d="M6 3l5 5-5 5" />
              </svg>
              <span className="sr-only">Ver la temporada {r.year}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
