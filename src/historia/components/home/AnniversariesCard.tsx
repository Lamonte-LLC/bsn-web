import Link from 'next/link';
import { cls } from '@/archivo/lib/tokens';
import { HOME_CARD } from './styles';

export interface AnniversaryRow {
  /** 50 or 25 */
  ago: number;
  year: number;
  /** "Cardenales de Río Piedras" */
  champion: string;
  /** "Bernie Bickerstaff · Final 4-3" */
  championLine: string;
  /** "Earl Brown", or null when the archive has no MVP that year. */
  mvpName: string | null;
  /** "Cardenales" */
  mvpTeam: string | null;
}

type Props = { rows: AnniversaryRow[] };

function Arrow() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/**
 * Card B of the home section: the seasons 50 and 25 years back as a short timeline. Each row is one link to
 * the season page: the span and a big year on the left, champion, coach, final and MVP in the middle, an arrow
 * disc on the right (desktop).
 */
export default function AnniversariesCard({ rows }: Props) {
  return (
    <article className={`${HOME_CARD} flex h-full flex-col px-[18px] pb-[6px] pt-[18px] md:px-[26px] md:pb-[10px] md:pt-[26px] lg:px-[28px]`}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <p className={cls.eyebrow}>Aniversarios</p>
        <p className={`hidden ${cls.meta} sm:block`}>Campeones de hace 50 y 25 años</p>
      </div>

      <ul className="mt-[6px] flex flex-1 flex-col justify-center">
        {rows.map((r, i) => (
          <li key={r.ago} className={i ? 'border-t border-[rgba(0,0,0,0.08)]' : ''}>
            <Link
              href={`/temporadas/${r.year}`}
              className={`group -mx-[10px] grid grid-cols-[64px_minmax(0,1fr)] items-center gap-[14px] rounded-[8px] px-[10px] py-[14px] transition-colors duration-150 hover:bg-[#FAFAFA] md:grid-cols-[84px_minmax(0,1fr)_34px] md:py-[16px] ${cls.focus}`}
            >
              <div>
                <p className={cls.label}>Hace {r.ago} años</p>
                <p className={`mt-[4px] text-[34px] leading-[1] text-[#0F171F] md:text-[40px] ${cls.tabular}`}>{r.year}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[20px] leading-[1.1] text-[#0F171F] md:text-[22px]">{r.champion}</p>
                <p className={`mt-[5px] truncate ${cls.meta} ${cls.tabular}`}>{r.championLine}</p>
                {r.mvpName ? (
                  <p className={`mt-[3px] truncate ${cls.meta}`}>
                    <b className="font-semibold text-[#0F171F]">MVP</b> {r.mvpName}
                    {r.mvpTeam ? <span className="text-[rgba(0,0,0,0.4)]"> · {r.mvpTeam}</span> : null}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden
                className="hidden h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.14)] text-[rgba(0,0,0,0.65)] transition-colors duration-150 group-hover:border-[rgba(0,0,0,0.3)] group-hover:text-[#0F171F] md:inline-flex"
              >
                <Arrow />
              </span>
              <span className="sr-only">Ver la temporada {r.year}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
