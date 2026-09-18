import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { getFranchiseMap, getPlayerIndexById, getSimilarPlayers } from '@/archivo/lib/data';
import { yearsLabel } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';

const SHOWN = 3;

type Props = {
  /** Archive id and slug of the player whose profile this is. */
  playerId: string;
  playerSlug: string;
};

/**
 * Three players with the closest career profile (precomputed in insights/similarity.json). Each card is a link
 * to the profile and carries its own small "Comparar" button. Nothing renders for careers
 * shorter than three seasons, which the similarity index leaves out.
 */
export default function SimilarPlayers({ playerId, playerSlug }: Props) {
  const similar = getSimilarPlayers(playerId).slice(0, SHOWN);
  if (!similar.length) return null;
  const franchiseMap = getFranchiseMap();

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
            <li key={s.playerId} className={`flex min-w-0 flex-col px-[16px] pb-[12px] pt-[14px] ${cls.card}`}>
              <div className="flex items-center gap-[12px]">
                <PlayerAvatar name={s.name} color={franchise?.colors.primary} sizePx={44} />
                <span className="min-w-0 flex-1">
                  <Link href={`/jugadores/${s.slug}`} className={`block truncate rounded-[3px] text-[18px] leading-[1.15] text-[#0F171F] ${cls.focus}`} title={s.name}>
                    {s.name}
                  </Link>
                  <span className={`mt-[3px] block truncate ${cls.meta} ${cls.tabular}`}>{entry ? yearsLabel(entry.fy, entry.ly) : franchise?.nickname ?? ''}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-[26px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{s.score.toFixed(0)}</span>
                  <span className={`mt-[3px] block ${cls.label}`}>Similitud</span>
                </span>
              </div>
              <div className="mt-[12px] flex items-center justify-between gap-[10px] border-t border-[rgba(0,0,0,0.06)] pt-[10px]">
                <Link href={`/jugadores/${s.slug}`} className={`rounded-[3px] ${cls.textLink} ${cls.focus}`}>
                  Ver perfil
                </Link>
                <Link
                  href={`/jugadores/comparar?p=${playerSlug},${s.slug}`}
                  className={`inline-flex h-[30px] items-center gap-[6px] rounded-[100px] border border-[#d5d5d5] bg-white px-[12px] font-special-gothic-condensed-one text-[13px] tracking-[0.3px] text-[rgba(0,0,0,0.75)] transition-[border-color,background-color,transform] duration-200 ease-out hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] active:scale-[0.98] motion-reduce:transition-none ${cls.focus}`}
                  aria-label={`Comparar con ${s.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                    <path d="M4 2v12M12 2v12M1.5 5.5 4 3l2.5 2.5M9.5 10.5 12 13l2.5-2.5" />
                  </svg>
                  Comparar
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`mt-[10px] max-w-[68ch] ${cls.note}`}>Similitud calculada sobre promedios y volumen de carrera en serie regular; menos precisa antes de 1975 cuando faltan categorías.</p>
    </section>
  );
}
