import type { Franchise } from '../../../types/archivo';

type Size = 'chip' | 'avatar' | 'hero';

const SIZE_PX: Record<Size, number> = { chip: 20, avatar: 40, hero: 120 };
const FONT_PX: Record<Size, number> = { chip: 9, avatar: 15, hero: 40 };

interface Props {
  franchise: Pick<Franchise, 'nickname' | 'logo' | 'colors' | 'fullName'> | null;
  size?: Size;
  /** Exact pixel size; overrides `size`. */
  sizePx?: number;
  /** Used when franchise is null (pre-1946 clubs with no franchise record). */
  fallbackName?: string;
  className?: string;
}

function abbreviation(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Logo for active franchises; a typographic placeholder (abbreviation on the franchise color) for extinct ones
 * until the league provides the original marks. Same footprint in every size so layouts never shift.
 */
export default function FranchiseLogo({ franchise, size = 'avatar', sizePx, fallbackName, className = '' }: Props) {
  const px = sizePx ?? SIZE_PX[size];
  const fontPx = sizePx ? Math.round(sizePx * 0.34) : FONT_PX[size];
  const name = franchise?.nickname ?? fallbackName ?? '';
  const title = franchise?.fullName ?? fallbackName ?? '';

  if (franchise?.logo) {
    return (
      <img
        src={franchise.logo}
        alt={title}
        title={title}
        width={px}
        height={px}
        className={`shrink-0 object-contain ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const color = franchise?.colors.primary ?? '#0F171F';
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full text-white ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: fontPx,
        letterSpacing: size === 'chip' ? 0 : '0.05em',
        background: color,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
      }}
    >
      {abbreviation(name)}
    </span>
  );
}
