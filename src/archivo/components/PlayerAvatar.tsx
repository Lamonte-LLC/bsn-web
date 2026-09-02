import { initials } from '../lib/format';

type Size = 'chip' | 'avatar' | 'hero';

const SIZE_PX: Record<Size, number> = { chip: 24, avatar: 44, hero: 120 };
const INK = '#0F171F';

interface Props {
  name: string;
  /** Primary color of the player's main franchise; falls back to ink. */
  color?: string | null;
  photoUrl?: string | null;
  size?: Size;
  /** Exact pixel size; overrides `size`. */
  sizePx?: number;
  /** Rendered on the ink band: letters stay in the franchise color, or white when that color is too dark. */
  onDark?: boolean;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** Relative luminance, used to keep the initials legible on very light franchise colors. */
function luminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/**
 * Player photo when available, otherwise the initials in the franchise color over the same color at 10%.
 * Light franchise colors (Indios, Criollos) fall back to ink for the letters so contrast stays above 4.5:1.
 */
export default function PlayerAvatar({ name, color, photoUrl, size = 'avatar', sizePx, onDark = false, className = '' }: Props) {
  const px = sizePx ?? SIZE_PX[size];
  const fontPx = Math.round(px * 0.36);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        className={`shrink-0 rounded-full border border-[#E5E5E5] object-cover ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const rgb = (color && hexToRgb(color)) || hexToRgb(onDark ? '#FFFFFF' : INK)!;
  const lum = luminance(rgb);
  const textColor = onDark ? (lum < 0.18 ? '#FFFFFF' : `rgb(${rgb.join(',')})`) : lum > 0.4 ? INK : `rgb(${rgb.join(',')})`;
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: fontPx,
        letterSpacing: '0.04em',
        color: textColor,
        background: `rgba(${rgb.join(',')},${onDark ? 0.18 : 0.1})`,
        boxShadow: `inset 0 0 0 1px rgba(${rgb.join(',')},${onDark ? 0.4 : 0.25})`,
      }}
    >
      {initials(name)}
    </span>
  );
}
