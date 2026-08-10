import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getCompareTeam } from './teams';

type Props = {
  code: string;
  /** Diámetro exterior del círculo, en px. */
  size: number;
  /** Proporción del logo respecto al círculo (0.6 = juego futuro). */
  logoRatio?: number;
  className?: string;
};

/**
 * Logo del equipo dentro de un círculo delineado con el color de marca —
 * mismo tratamiento que ScheduledMatchScoreBoard (página de juego futuro):
 * border-2 con el color del equipo, sin relleno.
 */
export default function CompareTeamMark({
  code,
  size,
  logoRatio = 0.6,
  className = '',
}: Props) {
  const team = getCompareTeam(code);

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border-2 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: team?.color ?? 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <TeamLogoAvatar teamCode={code} size={Math.round(size * logoRatio)} />
    </span>
  );
}
