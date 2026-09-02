import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { getFranchiseMap, getMvpChampionOverlap } from '@/archivo/lib/data';

export const metadata: Metadata = { title: '¿El MVP levanta el trofeo? · Archivo BSN', description: 'Cuántas veces el MVP del BSN jugaba en el equipo campeón, año por año desde 1951.' };

export default function MvpYCampeonPage() {
  const data = getMvpChampionOverlap();
  const franchises = getFranchiseMap();
  const inStreak = (year: number, streak: { from: number; to: number } | null) => Boolean(streak && year >= streak.from && year <= streak.to);

  return (
    <InsightPage
      title="¿El MVP levanta el trofeo?"
      context="El mejor jugador del año y el mejor equipo del año no siempre son la misma historia."
      heroNumber={`${data.overlapYears} de ${data.totalYears}`}
      heroNumberLabel={`${data.overlapPct}% de las veces`}
    >
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-[12px] border border-[#EAEAEA] bg-white p-[16px]">
          <p className="font-barlow text-[12px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.6)]">Racha más larga de coincidencia</p>
          <p className="mt-[4px] text-[28px] leading-[1] text-black">
            {data.longestOverlapStreak ? `${data.longestOverlapStreak.length} años` : '–'}
            {data.longestOverlapStreak ? <span className="ml-[8px] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">{data.longestOverlapStreak.from} a {data.longestOverlapStreak.to}</span> : null}
          </p>
        </div>
        <div className="rounded-[12px] border border-[#EAEAEA] bg-white p-[16px]">
          <p className="font-barlow text-[12px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.6)]">Racha más larga sin coincidencia</p>
          <p className="mt-[4px] text-[28px] leading-[1] text-black">
            {data.longestNoOverlapStreak ? `${data.longestNoOverlapStreak.length} años` : '–'}
            {data.longestNoOverlapStreak ? <span className="ml-[8px] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">{data.longestNoOverlapStreak.from} a {data.longestNoOverlapStreak.to}</span> : null}
          </p>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#EAEAEA] bg-white">
        <div className="grid grid-cols-[56px_1fr_1fr] gap-2 border-b border-[rgba(0,0,0,0.07)] px-[12px] py-[8px] font-barlow text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)] md:grid-cols-[72px_1fr_1fr]">
          <span>Año</span>
          <span>MVP</span>
          <span>Campeón</span>
        </div>
        <ol>
          {data.years.map((y) => {
            const mvpF = y.mvp.franchiseSlugs[0] ? franchises.get(y.mvp.franchiseSlugs[0]) ?? null : null;
            const champF = y.champion.franchiseSlug ? franchises.get(y.champion.franchiseSlug) ?? null : null;
            const streak = inStreak(y.year, data.longestOverlapStreak) ? 'overlap' : inStreak(y.year, data.longestNoOverlapStreak) ? 'none' : null;
            return (
              <li
                key={y.year}
                className={`grid min-h-[52px] grid-cols-[56px_1fr_1fr] items-center gap-2 border-t border-[rgba(0,0,0,0.05)] px-[12px] py-[6px] md:grid-cols-[72px_1fr_1fr] ${y.overlap ? 'bg-[rgba(229,31,31,0.05)]' : ''} ${streak ? 'shadow-[inset_3px_0_0_#E51F1F]' : ''}`}
                title={streak === 'overlap' ? 'Parte de la racha más larga de coincidencia' : streak === 'none' ? 'Parte de la racha más larga sin coincidencia' : undefined}
              >
                <Link href={`/archivo/temporadas/${y.year}`} className="text-[18px] text-black hover:underline">
                  {y.year}
                </Link>
                <Link href={y.mvp.slug ? `/archivo/jugadores/${y.mvp.slug}` : `/archivo/temporadas/${y.year}`} className="flex min-w-0 items-center gap-[8px]">
                  <PlayerAvatar name={y.mvp.name} color={mvpF?.colors.primary} sizePx={30} />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-[rgba(15,23,31,0.9)]">{y.mvp.name}</span>
                    <span className="flex items-center gap-[4px] font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">
                      {y.mvp.franchiseSlugs.map((s) => (
                        <FranchiseLogo key={s} franchise={franchises.get(s) ?? null} fallbackName={s} sizePx={14} />
                      ))}
                      <span className="truncate">{mvpF?.nickname ?? ''}</span>
                    </span>
                  </span>
                </Link>
                <Link href={champF ? `/archivo/franquicias/${champF.slug}` : `/archivo/temporadas/${y.year}`} className="flex min-w-0 items-center gap-[8px]">
                  <FranchiseLogo franchise={champF} fallbackName={y.champion.name} sizePx={30} />
                  <span className={`truncate text-[15px] ${y.overlap ? 'text-[#E51F1F]' : 'text-[rgba(15,23,31,0.9)]'}`}>{champF?.fullName ?? y.champion.name}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">Las filas resaltadas son los años en que el MVP jugaba con el campeón. La línea roja a la izquierda marca las rachas más largas de coincidencia y de no coincidencia.</p>
    </InsightPage>
  );
}
