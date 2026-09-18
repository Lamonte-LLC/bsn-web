import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { getFranchiseMap, getPlayerIndexById, getSimilarPlayers } from '@/archivo/lib/data';
import { yearsLabel } from '@/archivo/lib/format';
import { shortName } from '@/archivo/lib/names';
import { cls } from '@/archivo/lib/tokens';

const SHOWN = 3;

type Props = {
  /** Archive id and slug of the player whose profile this is. */
  playerId: string;
  playerSlug: string;
};

/**
 * Three players with the closest career profile (precomputed in insights/similarity.json). Each card is a link
 * to the profile; below, a shortcut to the comparator with the closest one. Nothing renders for careers
 * shorter than three seasons, which the similarity index leaves out.
 */
export default function SimilarPlayers({ playerId, playerSlug }: Props) {
  const similar = getSimilarPlayers(playerId).slice(0, SHOWN);
  if (!similar.length) return null;
  const franchiseMap = getFranchiseMap();
  const closest = similar[0];

  return (
    <section className="mb-[32px] md:mb-[40px]" aria-labelledby="jugadores-parecidos">
      <div className="mb-[16px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
        <h2 id="jugadores-parecidos" className="text-[22px] leading-[1.1] text-[#0F171F]">
          Jugadores parecidos
        </h2>
        <span className={cls.meta}>Por perfil estadístico de carrera</span>
      </div>
      <ul className="grid grid-cols-1 gap-[12px] md:grid-cols-3">
        {similar.map((s) => {
          const entry = getPlayerIndexById(s.playerId);
          const franchise = entry?.franchiseSlugs[0] ? (franchiseMap.get(entry.franchiseSlugs[0]) ?? null) : null;
          return (
            <li key={s.playerId} className="min-w-0">
              <Link href={`/jugadores/${s.slug}`} className={`flex min-h-[76px] items-center gap-[12px] px-[16px] py-[14px] ${cls.cardTap} ${cls.focus}`}>
                <PlayerAvatar name={s.name} color={franchise?.colors.primary} sizePx={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[18px] leading-[1.15] text-[#0F171F]">{s.name}</span>
                  <span className={`mt-[3px] block truncate ${cls.meta} ${cls.tabular}`}>{entry ? yearsLabel(entry.fy, entry.ly) : franchise?.nickname ?? ''}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-[26px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{s.score.toFixed(0)}</span>
                  <span className={`mt-[3px] block ${cls.label}`}>Similitud</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href={`/jugadores/comparar?p=${playerSlug},${closest.slug}`} className={`mt-[14px] inline-flex min-h-[28px] items-center rounded-[4px] ${cls.textLink} ${cls.focus}`}>
        Comparar con {shortName(closest.name)}
      </Link>
      <p className={`mt-[10px] max-w-[68ch] ${cls.note}`}>Similitud calculada sobre promedios y volumen de carrera en serie regular; menos precisa antes de 1975 cuando faltan categorías.</p>
    </section>
  );
}
