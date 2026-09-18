import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { alpha } from '@/archivo/lib/color';
import { fmt, fmtInt, initials, yearsLabel } from '@/archivo/lib/format';
import { cls, INK } from '@/archivo/lib/tokens';
import type { Franchise, PlayerFile } from '@/archivo/lib/types';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, HOME_CARD } from './styles';

type Props = {
  player: PlayerFile;
  /** The franchises the player wore, in career order; real logos for active ones. */
  franchises: Franchise[];
  /** Primary color of the last franchise; tints the avatar, never text copy. */
  color: string | null;
  /** Historical rank in points, when known. */
  ptsRank: number | null;
  /** The one line that says why this player is a legend. */
  reason: string;
};

/**
 * Card A of the home section: the legend of the day. Big tinted avatar, name in the display face, one line
 * with the span, seasons, titles and the reason, the row of clubs as real logos, and four career numbers
 * above the two calls to action. Retired players have no photo, so the avatar is always initials.
 */
export default function LegendCard({ player, franchises, color, ptsRank, reason }: Props) {
  const career = player.career ?? player.computed.regular;
  const tint = color ?? INK;
  const line = [
    yearsLabel(player.fy, player.ly),
    `${player.seasons} temporadas`,
    player.championships.length ? `${player.championships.length} ${player.championships.length === 1 ? 'título' : 'títulos'}` : null,
    reason,
  ].filter(Boolean);
  const numbers: Array<[string, string]> = [
    [fmtInt(career.pts), ptsRank ? `Puntos · #${ptsRank} histórico` : 'Puntos'],
    [fmt(career.ppg), 'Por juego'],
    [fmtInt(career.g), 'Juegos'],
    [String(player.championships.length), 'Campeonatos'],
  ];
  const shown = franchises.slice(0, 8);

  return (
    <article className={`${HOME_CARD} flex h-full flex-col px-[18px] pb-[18px] pt-[20px] md:px-[28px] md:pb-[26px] md:pt-[26px] lg:px-[36px] lg:pb-[32px] lg:pt-[30px]`}>
      <p className={cls.eyebrow}>Leyenda BSN · hoy</p>

      <div className="mt-[18px] flex items-center gap-[18px] md:mt-[22px] md:gap-[28px]">
        <span
          aria-hidden
          className="inline-flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-full text-[34px] leading-none md:h-[150px] md:w-[150px] md:text-[48px]"
          style={{ backgroundColor: alpha(tint, 0.12), color: tint }}
        >
          {initials(player.name)}
        </span>
        <div className="min-w-0">
          <h3 className="text-[34px] leading-[1] text-[#0F171F] [overflow-wrap:anywhere] md:text-[48px]">{player.name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]\s*/g, '').split(' ').slice(0, 2).join(' ')}</h3>
          <p className={`mt-[10px] font-barlow text-[14px] text-[rgba(15,23,31,0.6)] md:text-[15px] ${cls.tabular}`}>{line.join(' · ')}</p>
          {shown.length ? (
            <div className="mt-[12px] flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
              <span className="inline-flex items-center gap-[6px]" title={franchises.map((f) => f.nickname).join(', ')}>
                {shown.map((f) => (
                  <span key={f.slug} className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 bg-white" style={{ borderColor: f.colors.primary ?? 'rgba(0,0,0,0.12)' }}>
                    <FranchiseLogo franchise={f} sizePx={26} />
                  </span>
                ))}
              </span>
              <span className={cls.meta}>
                {franchises.length} {franchises.length === 1 ? 'equipo' : 'equipos'}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <dl className="mt-[22px] grid grid-cols-2 gap-y-[18px] border-t border-[rgba(0,0,0,0.08)] pt-[22px] md:mt-[28px] md:grid-cols-4 md:pt-[26px]">
        {numbers.map(([value, label]) => (
          <div key={label} className="flex min-w-0 flex-col-reverse">
            <dt className={`mt-[6px] ${cls.label}`}>{label}</dt>
            <dd className={`text-[36px] leading-[1] text-[#0F171F] md:text-[44px] ${cls.tabular}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-[22px] flex flex-col gap-[10px] md:mt-auto md:flex-row md:pt-[28px]">
        <Link href={`/jugadores/${player.slug}`} className={`${BUTTON_PRIMARY} md:h-[44px] md:px-[26px]`}>
          Ver perfil
        </Link>
        <Link href={`/jugadores/comparar?p=${player.slug}`} className={`${BUTTON_SECONDARY} md:h-[44px] md:px-[26px]`}>
          Comparar con un jugador de hoy
        </Link>
      </div>
    </article>
  );
}
