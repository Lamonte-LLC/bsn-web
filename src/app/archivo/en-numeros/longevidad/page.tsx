import type { Metadata } from 'next';
import Link from 'next/link';
import InsightPage from '@/archivo/components/InsightPage';
import Tabs from '@/archivo/components/Tabs';
import { getFranchiseMap, getLongevity } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
import type { LongevityEntry } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Los que duraron · Archivo BSN', description: 'Los jugadores con más temporadas y más juegos en la historia del BSN.' };

const MIN_YEAR = 1956;
const MAX_YEAR = 2023;

function Gantt({ list, valueKey, unit }: { list: LongevityEntry[]; valueKey: 'seasons' | 'g'; unit: string }) {
  const franchises = getFranchiseMap();
  const span = MAX_YEAR - MIN_YEAR;
  const ticks = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  return (
    <div>
      <div className="hidden grid-cols-[220px_1fr_70px] gap-x-3 md:grid">
        <span />
        <div className="relative h-[18px] border-b border-[rgba(0,0,0,0.12)]">
          {ticks.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 font-barlow text-[12px] text-[rgba(15,23,31,0.5)]" style={{ left: `${((t - MIN_YEAR) / span) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <span />
      </div>
      <ol>
        {list.map((e, i) => {
          const color = e.franchiseSlugs[0] ? franchises.get(e.franchiseSlugs[0])?.colors.primary ?? '#0F171F' : '#0F171F';
          return (
            <li key={e.playerId} className="grid min-h-[48px] grid-cols-[1fr_64px] items-center gap-x-3 border-b border-[rgba(0,0,0,0.05)] py-[6px] md:grid-cols-[220px_1fr_70px]">
              <div className="min-w-0">
                <Link href={`/archivo/jugadores/${e.slug}`} className="flex items-baseline gap-[6px] hover:underline">
                  <span className="w-[20px] shrink-0 font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 1}</span>
                  <span className="truncate text-[16px] text-[rgba(15,23,31,0.9)]">{e.name}</span>
                </Link>
                <span className="block pl-[26px] font-barlow text-[12px] text-[rgba(15,23,31,0.55)] md:hidden">
                  {e.fy} a {e.ly}
                </span>
              </div>
              <div className="relative hidden h-[14px] md:block">
                <span className="absolute inset-y-0 rounded-[3px]" style={{ left: `${((e.fy - MIN_YEAR) / span) * 100}%`, width: `${Math.max(1, ((e.ly - e.fy + 1) / span) * 100)}%`, background: color, opacity: 0.85 }} title={`${e.fy} a ${e.ly}`} />
              </div>
              <span className="text-right text-[20px] text-black [font-variant-numeric:tabular-nums]">
                {fmtInt(e[valueKey])}
                <span className="ml-[3px] font-barlow text-[11px] text-[rgba(15,23,31,0.5)]">{unit}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function LongevidadPage() {
  const data = getLongevity();
  const top = data.bySeasons[0];
  return (
    <InsightPage title="Los que duraron" context="Teófilo Cruz jugó veinticinco temporadas. Empezó antes de que existiera la línea de tres." heroNumber={top?.seasons} heroNumberLabel={`temporadas de ${top?.name}`}>
      <Tabs
        tabs={[
          { label: 'Por temporadas', panel: <Gantt list={data.bySeasons} valueKey="seasons" unit="temp." /> },
          { label: 'Por juegos', panel: <Gantt list={data.byGames} valueKey="g" unit="juegos" /> },
        ]}
      />
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">La barra va del año de debut al de retiro; el color es el de la primera franquicia del jugador. Los juegos son los totales de Serie Regular publicados por la liga.</p>
    </InsightPage>
  );
}
