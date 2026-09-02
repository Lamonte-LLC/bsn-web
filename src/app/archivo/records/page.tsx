import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import LeaderCard from '@/archivo/components/LeaderCard';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { HeroEyebrow, HeroTitle, Note, SectionTitle } from '@/archivo/components/ui';
import { getFranchiseMap, getRecords } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import type { CareerRecordKey, SeasonRecordKey } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Récords · Archivo BSN', description: 'Los récords de temporada y de carrera en la historia del BSN.' };

const SEASON_LABELS: Record<SeasonRecordKey, string> = { ppg: 'Puntos por juego · Temporada', rpg: 'Rebotes por juego · Temporada', apg: 'Asistencias por juego · Temporada', spg: 'Robos por juego · Temporada', bpg: 'Bloqueos por juego · Temporada', pts: 'Puntos en una temporada' };
const CAREER_LABELS: Record<CareerRecordKey, string> = { pts: 'Puntos de carrera', reb: 'Rebotes de carrera', ast: 'Asistencias de carrera', g: 'Juegos de carrera', seasons: 'Temporadas', mvps: 'Premios MVP' };

export default function RecordsPage() {
  const records = getRecords();
  const franchises = getFranchiseMap();
  const nick = (slug: string | null | undefined, fallback: string) => (slug ? franchises.get(slug)?.nickname ?? fallback : fallback);
  const color = (slug: string | null | undefined) => (slug ? franchises.get(slug)?.colors.primary : null);

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>Serie Regular, mínimo {records.minGames} juegos</HeroEyebrow>
          <HeroTitle>Récords</HeroTitle>
        </div>
      }
    >
      <section className="mb-[36px] lg:mb-[44px]" id="temporada">
        <SectionTitle>De temporada</SectionTitle>
        <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px] lg:grid-cols-3">
          {(Object.keys(SEASON_LABELS) as SeasonRecordKey[]).map((key) => {
            const list = records.season[key];
            const top = list[0];
            if (!top) return null;
            const f = (v: number) => (key === 'pts' ? fmtInt(v) : fmt(v));
            return (
              <LeaderCard
                key={key}
                label={SEASON_LABELS[key]}
                href={`/archivo/jugadores/${top.slug}`}
                avatar={<PlayerAvatar name={top.name} color={color(top.franchiseSlug)} sizePx={56} />}
                value={f(top.value)}
                name={top.name}
                context={`${top.year} · ${nick(top.franchiseSlug, top.teamName)} · ${top.g} juegos`}
                runners={list.slice(1, 5).map((r) => ({ key: `${r.playerId}-${r.year}`, href: `/archivo/jugadores/${r.slug}`, label: `${r.name} · ${r.year}`, value: f(r.value) }))}
              />
            );
          })}
        </div>
      </section>

      <section id="carrera">
        <SectionTitle>De carrera</SectionTitle>
        <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px] lg:grid-cols-3">
          {(Object.keys(CAREER_LABELS) as CareerRecordKey[]).map((key) => {
            const list = records.career[key];
            const top = list[0];
            if (!top) return null;
            return (
              <LeaderCard
                key={key}
                label={CAREER_LABELS[key]}
                href={`/archivo/jugadores/${top.slug}`}
                avatar={<PlayerAvatar name={top.name} color={color(top.franchiseSlugs[0])} sizePx={56} />}
                value={fmtInt(top.value)}
                name={top.name}
                context={`${top.fy} a ${top.ly}`}
                runners={list.slice(1, 5).map((r) => ({ key: r.playerId, href: `/archivo/jugadores/${r.slug}`, label: r.name, value: fmtInt(r.value) }))}
              />
            );
          })}
        </div>
        <Note className="mt-[14px] !max-w-none">Serie Regular. Los totales de carrera son los publicados por la liga; los récords de temporada exigen un mínimo de {records.minGames} juegos.</Note>
      </section>
    </ArchivoShell>
  );
}
