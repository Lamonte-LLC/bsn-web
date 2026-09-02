import { initials } from '../lib/format';
import { alpha, hexToRgb, readableOn } from '../lib/color';
import { INK } from '../lib/tokens';

type Size = 'chip' | 'avatar' | 'hero';

const SIZE_PX: Record<Size, number> = { chip: 20, avatar: 40, hero: 120 };

interface Props {
  name: string;
  /** Primary color of the player's main franchise; falls back to ink. */
  color?: string | null;
  photoUrl?: string | null;
  size?: Size;
  /** Exact pixel size; overrides `size`. */
  sizePx?: number;
  /** Rendered on the ink band: white at 6% behind, letters in a lightened version of the color for AA. */
  onDark?: boolean;
  className?: string;
}

/**
 * Player photo when available, otherwise the initials in the franchise color over the same color at 10%.
 * Very light franchise colors (Indios, Criollos, Capitanes) darken the letters so contrast stays above 4.5:1.
 */
export default function PlayerAvatar({ name, color, photoUrl, size = 'avatar', sizePx, onDark = false, className = '' }: Props) {
  const px = sizePx ?? SIZE_PX[size];
  const fontPx = Math.round(px / 3);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        loading="lazy"
        className={`shrink-0 rounded-full border border-[#E5E5E5] object-cover ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const base = color && hexToRgb(color) ? color : INK;
  const textColor = onDark ? readableOn(base, INK, 4.5) : readableOn(base, '#FFFFFF', 4.5);
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-barlow font-bold ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: fontPx,
        letterSpacing: px >= 100 ? 1 : 0,
        color: textColor,
        background: onDark ? 'rgba(255,255,255,0.06)' : alpha(base, 0.1),
        boxShadow: onDark ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : undefined,
      }}
    >
      {initials(name)}
    </span>
  );
}
