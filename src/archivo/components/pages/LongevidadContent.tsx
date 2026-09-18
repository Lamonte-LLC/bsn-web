import Link from 'next/link';
import InsightPage from '@/archivo/components/InsightPage';
import Tabs from '@/archivo/components/Tabs';
import { PaperCard } from '@/archivo/components/ui';
import { getLongevity } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
import { hrefs, type Hrefs } from '@/archivo/lib/hrefs';
import { cls } from '@/archivo/lib/tokens';
import type { LongevityEntry } from '@/archivo/lib/types';

const MIN_YEAR = 1956;
const MAX_YEAR = 2023;
const TICKS = [1960, 1980, 2000, 2020];
const MINOR = [1970, 1990, 2010];

function Gantt({ list, valueKey, h }: { list: LongevityEntry[]; valueKey: 'seasons' | 'g'; h: Hrefs }) {
  const span = MAX_YEAR - MIN_YEAR;
  const pos = (y: number) => `${((y - MIN_YEAR) / span) * 100}%`;
  return (
    <div>
      <div className="hidden grid-cols-[28px_220px_1fr_60px] gap-x-[14px] md:grid">
        <span />
        <span />
        <div className="relative h-[18px]">
          {TICKS.map((t) => (
            <span key={t} className={`absolute -translate-x-1/2 font-barlow text-[10.5px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`} style={{ left: pos(t) }}>
              {t}
            </span>
          ))}
        </div>
        <span />
      </div>
      <ol>
        {list.map((e, i) => (
          <li key={e.playerId} className="grid min-h-[45px] grid-cols-[24px_1fr_48px] items-center gap-x-[10px] border-b border-[rgba(0,0,0,0.05)] py-[6px] last:border-b-0 md:grid-cols-[28px_220px_1fr_60px] md:gap-x-[14px]">
            <span className="font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)]">{i + 1}</span>
            <div className="min-w-0">
              <Link href={h.player(e.slug)} className={`block truncate font-barlow text-[14px] font-semibold text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                {e.name}
              </Link>
              <span className={`block font-barlow text-[12px] text-[rgba(0,0,0,0.5)] md:hidden ${cls.tabular}`}>
                {e.fy} a {e.ly}
              </span>
            </div>
            <div className="relative hidden h-[20px] md:block">
              {[...TICKS, ...MINOR].map((t) => (
                <span key={t} aria-hidden className="absolute inset-y-0 w-px bg-[rgba(0,0,0,0.06)]" style={{ left: pos(t) }} />
              ))}
              <span className="absolute top-[6px] h-[8px] rounded-[4px] bg-[#0F171F]" style={{ left: pos(e.fy), width: `${Math.max(1, ((e.ly - e.fy + 1) / span) * 100)}%` }} title={`${e.fy} a ${e.ly}`} />
            </div>
            <span className={`text-right text-[20px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmtInt(e[valueKey])}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Los que duraron: the longest careers by seasons and by games, as a Gantt of debut to retirement. */
export default function LongevidadContent({ site = false }: { site?: boolean }) {
  const h = hrefs(site);
  const data = getLongevity();
  const top = data.bySeasons[0];
  return (
    <InsightPage
      site={site}
      title="Los que duraron"
      context={`${top?.name} jugó ${top?.seasons} temporadas. Teófilo Cruz empezó antes de que existiera la línea de tres.`}
      heroNumber={top?.seasons}
      heroNumberLabel={`temporadas de ${top?.name}`}
      source={`Barra del año de debut al de retiro, eje ${MIN_YEAR} a ${MAX_YEAR}. Los juegos son los totales de Serie Regular publicados por la liga.`}
    >
      <PaperCard className="px-[16px] pb-[8px] pt-[16px] md:px-[26px] md:pt-[20px]">
        <Tabs
          small
          title={<p className="font-barlow text-[12px] font-bold uppercase tracking-[1px] text-[#0F171F]">Los que duraron · Top 25</p>}
          tabs={[
            { label: 'Temporadas', panel: <Gantt list={data.bySeasons} valueKey="seasons" h={h} /> },
            { label: 'Juegos', panel: <Gantt list={data.byGames} valueKey="g" h={h} /> },
          ]}
        />
      </PaperCard>
    </InsightPage>
  );
}
