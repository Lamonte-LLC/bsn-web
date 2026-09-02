import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Eyebrow, HeroEyebrow, HeroTitle, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getFranchiseMap, getRecords } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import type { CareerRecordKey, SeasonRecordKey } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Récords · Archivo BSN', description: 'Los récords de temporada y de carrera en la historia del BSN.' };

const SEASON_LABELS: Record<SeasonRecordKey, string> = { ppg: 'Puntos por juego', rpg: 'Rebotes por juego', apg: 'Asistencias por juego', spg: 'Robos por juego', bpg: 'Bloqueos por juego', pts: 'Puntos en una temporada' };
const CAREER_LABELS: Record<CareerRecordKey, string> = { pts: 'Puntos', reb: 'Rebotes', ast: 'Asistencias', g: 'Juegos', seasons: 'Temporadas', mvps: 'Premios MVP' };

export default function RecordsPage() {
  const records = getRecords();
  const franchises = getFranchiseMap();

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>Serie Regular, mínimo {records.minGames} juegos</HeroEyebrow>
          <HeroTitle>Récords</HeroTitle>
        </div>
      }
    >
      <section className="mb-12" id="temporada">
        <SectionTitle>De temporada</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(SEASON_LABELS) as SeasonRecordKey[]).map((key) => {
            const list = records.season[key];
            const top = list[0];
            if (!top) return null;
            return (
              <PaperCard key={key} className="p-[16px]">
                <Eyebrow>{SEASON_LABELS[key]}</Eyebrow>
                <div className="mt-[6px] text-[44px] leading-[1] text-black [font-variant-numeric:tabular-nums]">{key === 'pts' ? fmtInt(top.value) : fmt(top.value)}</div>
                <Link href={`/archivo/jugadores/${top.slug}`} className="mt-[10px] flex items-center gap-[10px]">
                  <PlayerAvatar name={top.name} color={top.franchiseSlug ? franchises.get(top.franchiseSlug)?.colors.primary : null} size="avatar" />
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{top.name}</span>
                    <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">
                      {top.year} · {top.franchiseSlug ? franchises.get(top.franchiseSlug)?.nickname : top.teamName} · {top.g} juegos
                    </span>
                  </span>
                </Link>
                <ol className="mt-[10px] divide-y divide-[rgba(0,0,0,0.05)]">
                  {list.slice(1, 5).map((r, i) => (
                    <li key={`${r.playerId}-${r.year}`} className="flex items-center justify-between gap-2 py-[5px]">
                      <Link href={`/archivo/jugadores/${r.slug}`} className="flex min-w-0 items-center gap-[8px]">
                        <span className="w-[14px] font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 2}</span>
                        <span className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{r.name}</span>
                        <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{r.year}</span>
                      </Link>
                      <span className="text-[16px] [font-variant-numeric:tabular-nums]">{key === 'pts' ? fmtInt(r.value) : fmt(r.value)}</span>
                    </li>
                  ))}
                </ol>
              </PaperCard>
            );
          })}
        </div>
      </section>

      <section id="carrera">
        <SectionTitle>De carrera</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(CAREER_LABELS) as CareerRecordKey[]).map((key) => {
            const list = records.career[key];
            const top = list[0];
            if (!top) return null;
            return (
              <PaperCard key={key} className="p-[16px]">
                <Eyebrow>{CAREER_LABELS[key]}</Eyebrow>
                <div className="mt-[6px] text-[44px] leading-[1] text-black [font-variant-numeric:tabular-nums]">{fmtInt(top.value)}</div>
                <Link href={`/archivo/jugadores/${top.slug}`} className="mt-[10px] flex items-center gap-[10px]">
                  <PlayerAvatar name={top.name} color={top.franchiseSlugs[0] ? franchises.get(top.franchiseSlugs[0])?.colors.primary : null} size="avatar" />
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{top.name}</span>
                    <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">{top.fy} a {top.ly}</span>
                  </span>
                </Link>
                <ol className="mt-[10px] divide-y divide-[rgba(0,0,0,0.05)]">
                  {list.slice(1, 5).map((r, i) => (
                    <li key={r.playerId} className="flex items-center justify-between gap-2 py-[5px]">
                      <Link href={`/archivo/jugadores/${r.slug}`} className="flex min-w-0 items-center gap-[8px]">
                        <span className="w-[14px] font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 2}</span>
                        <span className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{r.name}</span>
                      </Link>
                      <span className="text-[16px] [font-variant-numeric:tabular-nums]">{fmtInt(r.value)}</span>
                    </li>
                  ))}
                </ol>
              </PaperCard>
            );
          })}
        </div>
      </section>
    </ArchivoShell>
  );
}
