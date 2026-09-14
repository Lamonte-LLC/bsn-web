import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { PaperCard } from '@/archivo/components/ui';
import { getFranchiseMap, getMvpChampionOverlap } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';
import type { Franchise, MvpChampionYear } from '@/archivo/lib/types';

export const metadata: Metadata = { title: '¿El MVP levanta el trofeo? · Archivo BSN', description: 'Cuántas veces el MVP del BSN jugaba en el equipo campeón, año por año desde 1951.' };

const SHOWN = 12;
type Streak = { from: number; to: number } | null;

function StreakCard({ label, streak }: { label: string; streak: { length: number; from: number; to: number } | null }) {
  return (
    <PaperCard className="px-[18px] py-[18px] md:px-[24px] md:py-[22px]">
      <p className="font-barlow text-[11px] font-bold uppercase tracking-[1.1px] text-[#0F171F]">{label}</p>
      <p className="mt-[8px] flex items-baseline gap-[10px]">
        <span className={`text-[28px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{streak ? `${streak.length} años` : '–'}</span>
        {streak ? <span className={`font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>{streak.from} a {streak.to}</span> : null}
      </p>
    </PaperCard>
  );
}

function YearRow({ y, streak, franchises }: { y: MvpChampionYear; streak: 'overlap' | 'none' | null; franchises: Map<string, Franchise> }) {
  const mvpF = y.mvp.franchiseSlugs[0] ? franchises.get(y.mvp.franchiseSlugs[0]) ?? null : null;
  const champF = y.champion.franchiseSlug ? franchises.get(y.champion.franchiseSlug) ?? null : null;
  return (
    <li
      className={`relative grid min-h-[61px] grid-cols-[64px_1fr] items-center gap-x-[10px] border-t border-[rgba(0,0,0,0.05)] px-[14px] py-[8px] md:grid-cols-[90px_1fr_1fr] md:px-[20px] ${y.overlap ? 'bg-[#FDF2F2]' : 'bg-white'}`}
      title={streak === 'overlap' ? 'Parte de la racha más larga de coincidencia' : streak === 'none' ? 'Parte de la racha más larga sin coincidencia' : undefined}
    >
      {streak ? <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${streak === 'overlap' ? 'bg-[#E51F1F]' : 'bg-[rgba(0,0,0,0.18)]'}`} /> : null}
      <Link href={`/archivo/temporadas/${y.year}`} className={`text-[21px] leading-[1] text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
        {y.year}
      </Link>
      <div className="flex min-w-0 flex-col gap-[6px] md:contents">
        <Link href={y.mvp.slug ? `/archivo/jugadores/${y.mvp.slug}` : `/archivo/temporadas/${y.year}`} className={`flex min-w-0 items-center gap-[10px] rounded-[4px] ${cls.focus}`}>
          <PlayerAvatar name={y.mvp.name} color={mvpF?.colors.primary} sizePx={28} />
          <span className="min-w-0">
            <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{y.mvp.name}</span>
            <span className="mt-[2px] flex items-center gap-[4px] font-barlow text-[11.5px] text-[rgba(0,0,0,0.5)]">
              {y.mvp.franchiseSlugs.map((s) => (
                <FranchiseLogo key={s} franchise={franchises.get(s) ?? null} fallbackName={s} sizePx={14} />
              ))}
              <span className="truncate">{y.mvp.franchiseSlugs.map((s) => franchises.get(s)?.nickname ?? s).join(' · ')}</span>
            </span>
          </span>
        </Link>
        <Link href={champF ? `/archivo/franquicias/${champF.slug}` : `/archivo/temporadas/${y.year}`} className={`flex min-w-0 items-center gap-[10px] rounded-[4px] ${cls.focus}`}>
          <FranchiseLogo franchise={champF} fallbackName={y.champion.name} sizePx={22} />
          <span className={`truncate font-barlow text-[14px] ${y.overlap ? 'font-semibold text-[#E51F1F]' : 'font-medium text-[#0F171F]'}`}>{champF?.fullName ?? y.champion.name}</span>
        </Link>
      </div>
    </li>
  );
}

export default function MvpYCampeonPage() {
  const data = getMvpChampionOverlap();
  const franchises = getFranchiseMap();
  const inStreak = (year: number, streak: Streak) => Boolean(streak && year >= streak.from && year <= streak.to);
  const streakOf = (year: number) => (inStreak(year, data.longestOverlapStreak) ? 'overlap' : inStreak(year, data.longestNoOverlapStreak) ? 'none' : null);
  const first = data.years.slice(0, SHOWN);
  const rest = data.years.slice(SHOWN);

  return (
    <InsightPage
      title="¿El MVP levanta el trofeo?"
      context="El mejor jugador del año y el mejor equipo del año no siempre son la misma historia."
      heroNumber={`${data.overlapYears} de ${data.totalYears}`}
      heroNumberLabel={`${data.overlapPct}% de las veces`}
      source={`Las filas rosadas marcan coincidencia entre MVP y campeón. La marca lateral roja es la racha de coincidencia${data.longestOverlapStreak ? ` (${data.longestOverlapStreak.from} a ${data.longestOverlapStreak.to})` : ''}; la gris, la racha sin coincidencia${data.longestNoOverlapStreak ? ` (${data.longestNoOverlapStreak.from} a ${data.longestNoOverlapStreak.to})` : ''}. Desde 1951, primer año con MVP.`}
    >
      <div className="mb-[16px] grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px]">
        <StreakCard label="Racha más larga de coincidencia" streak={data.longestOverlapStreak} />
        <StreakCard label="Racha más larga sin coincidencia" streak={data.longestNoOverlapStreak} />
      </div>
      <PaperCard className="overflow-hidden">
        <div className="grid grid-cols-[64px_1fr] gap-x-[10px] bg-[#F7F7F7] px-[14px] py-[10px] md:grid-cols-[90px_1fr_1fr] md:px-[20px]">
          <span className={cls.label}>Año</span>
          <span className={cls.label}>MVP</span>
          <span className={`hidden md:block ${cls.label}`}>Campeón</span>
        </div>
        <ol>
          {first.map((y) => (
            <YearRow key={y.year} y={y} streak={streakOf(y.year)} franchises={franchises} />
          ))}
        </ol>
        {rest.length ? (
          <details className="group">
            <summary className={`cursor-pointer list-none border-t border-[rgba(0,0,0,0.05)] py-[13px] text-center font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)] transition-colors duration-150 hover:text-[#0F171F] ${cls.focus} [&::-webkit-details-marker]:hidden`}>
              <span className="group-open:hidden">Ver los {data.years.length} años</span>
              <span className="hidden group-open:inline">Ver menos</span>
            </summary>
            <ol>
              {rest.map((y) => (
                <YearRow key={y.year} y={y} streak={streakOf(y.year)} franchises={franchises} />
              ))}
            </ol>
          </details>
        ) : null}
      </PaperCard>
    </InsightPage>
  );
}
