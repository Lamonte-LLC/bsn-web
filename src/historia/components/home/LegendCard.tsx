import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmt, fmtInt, yearsLabel } from '@/archivo/lib/format';
import { cls, INK } from '@/archivo/lib/tokens';
import type { Franchise, PlayerFile } from '@/archivo/lib/types';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, HOME_CARD } from './styles';

type Props = {
  player: PlayerFile;
  /** The franchises the player wore, in career order; real logos for active ones. */
  franchises: Franchise[];
  /** Primary color of the last franchise; goes on the avatar ring only, never on text. */
  color: string | null;
  /** Historical rank in points, when known. */
  ptsRank: number | null;
  /** The one line that says why this player is a legend. */
  reason: string;
};

const CHIP = `inline-flex h-[22px] items-center rounded-[4px] border border-[rgba(0,0,0,0.12)] px-[8px] ${cls.label} !text-[10px]`;

/**
 * Card A of the home section: the legend of the day as a "placa". Identity on the left (avatar with a thick
 * team-color ring, name in the display face, span, three chips, the reason line) and the career in four big
 * numbers on an ink plate on the right. Retired players have no photo, so the avatar is always initials.
 */
export default function LegendCard({ player, franchises, color, ptsRank, reason }: Props) {
  const career = player.career ?? player.computed.regular;
  const ring = color ?? INK;
  const [first, ...rest] = player.name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  const surname = rest.length >= 2 ? rest[rest.length - 2] : rest[0] ?? '';
  const chips = [
    player.mvpYears.length ? `MVP${player.mvpYears.length > 1 ? ` ×${player.mvpYears.length}` : ''}` : null,
    player.championships.length ? `${player.championships.length} ${player.championships.length === 1 ? 'título' : 'títulos'}` : null,
  ].filter((c): c is string => c !== null);
  const shownFranchises = franchises.slice(0, 5);
  const numbers: Array<[string, string]> = [
    [fmtInt(career.pts), ptsRank ? `Puntos · #${ptsRank} histórico` : 'Puntos'],
    [fmt(career.ppg), 'Por juego'],
    [fmtInt(career.g), 'Juegos'],
    [String(player.championships.length), 'Campeonatos'],
  ];

  return (
    <article className={`${HOME_CARD} flex h-full flex-col gap-[18px] p-[18px] md:gap-[22px] md:p-[26px] lg:px-[28px]`}>
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-[minmax(0,1fr)_280px] md:gap-[28px]">
        <div className="flex min-w-0 flex-col gap-[14px]">
          <p className={cls.eyebrow}>Leyenda BSN · hoy</p>
          <div className="flex items-center gap-[16px] md:gap-[22px]">
            <span className="inline-flex shrink-0 rounded-full" style={{ boxShadow: `0 0 0 3px #fff, 0 0 0 6px ${ring}` }}>
              <PlayerAvatar name={player.name} color={ring} sizePx={112} className="h-[84px]! w-[84px]! text-[28px]! md:h-[112px]! md:w-[112px]! md:text-[36px]!" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[32px] leading-[0.95] text-[#0F171F] [overflow-wrap:anywhere] md:text-[44px]">
                {first}
                <br />
                {surname}
              </h3>
              <p className={`mt-[8px] ${cls.meta} ${cls.tabular}`}>
                {yearsLabel(player.fy, player.ly)} · {player.seasons} temporadas
              </p>
              <div className="mt-[8px] flex flex-wrap items-center gap-[6px]">
                {chips.map((c) => (
                  <span key={c} className={CHIP}>
                    {c}
                  </span>
                ))}
                {shownFranchises.length ? (
                  <span className="inline-flex items-center gap-[3px]" title={franchises.map((f) => f.nickname).join(', ')}>
                    {shownFranchises.map((f) => (
                      <FranchiseLogo key={f.slug} franchise={f} sizePx={22} />
                    ))}
                    {franchises.length > 5 ? <span className={`ml-[2px] ${cls.meta} ${cls.tabular}`}>+{franchises.length - 5}</span> : null}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <p className="max-w-[380px] font-barlow text-[15px] font-semibold leading-[1.35] text-[#0F171F]">{reason}</p>
        </div>

        <dl className="grid grid-cols-2 content-center gap-x-[16px] gap-y-[16px] rounded-[12px] bg-[#0F171F] px-[18px] py-[18px] md:gap-y-[22px] md:px-[24px] md:py-[22px]">
          {numbers.map(([value, label]) => (
            <div key={label} className="flex min-w-0 flex-col-reverse">
              <dt className={`mt-[6px] ${cls.label} !text-[rgba(255,255,255,0.55)]`}>{label}</dt>
              <dd className={`text-[34px] leading-[1] text-white md:text-[40px] ${cls.tabular}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-[10px] md:mt-auto md:flex-row">
        <Link href={`/jugadores/${player.slug}`} className={BUTTON_PRIMARY}>
          Ver perfil
        </Link>
        <Link href={`/jugadores/comparar?p=${player.slug}`} className={BUTTON_SECONDARY}>
          Compararlo con un jugador de hoy
        </Link>
      </div>
    </article>
  );
}
