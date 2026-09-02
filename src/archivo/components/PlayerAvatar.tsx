import { initials } from '../lib/format';

type Size = 'chip' | 'avatar' | 'hero';

const SIZE_PX: Record<Size, number> = { chip: 24, avatar: 44, hero: 120 };
const FONT_PX: Record<Size, number> = { chip: 10, avatar: 16, hero: 44 };

interface Props {
  name: string;
  /** Primary color of the player's main franchise; falls back to ink. */
  color?: string | null;
  photoUrl?: string | null;
  size?: Size;
  /** Exact pixel size; overrides `size`. */
  sizePx?: number;
  className?: string;
}

/** Player photo when available, otherwise initials on the franchise color. */
export default function PlayerAvatar({ name, color, photoUrl, size = 'avatar', sizePx, className = '' }: Props) {
  const px = sizePx ?? SIZE_PX[size];
  const fontPx = sizePx ? Math.round(sizePx * 0.36) : FONT_PX[size];
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
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full text-white ${className}`}
      style={{ width: px, height: px, fontSize: fontPx, background: color ?? '#0F171F', letterSpacing: '0.04em' }}
    >
      {initials(name)}
    </span>
  );
}
