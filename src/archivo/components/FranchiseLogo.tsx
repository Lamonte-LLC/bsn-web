import type { Franchise } from '../../../types/archivo';
import { cls, NEUTRAL_CLUB } from '../lib/tokens';

type Size = 'chip' | 'avatar' | 'hero';

const SIZE_PX: Record<Size, number> = { chip: 20, avatar: 40, hero: 120 };

interface Props {
  franchise: Pick<Franchise, 'nickname' | 'logo' | 'colors' | 'fullName'> & Partial<Pick<Franchise, 'code' | 'status'>> | null;
  size?: Size;
  /** Exact pixel size; overrides `size`. */
  sizePx?: number;
  /** Used when franchise is null (pre-1946 clubs with no franchise record). */
  fallbackName?: string;
  className?: string;
}

function abbreviation(name: string): string {
  const words = name.split(/\s+/).filter((w) => !/^(de|del|la|los|las|el|y)$/i.test(w));
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Franchise mark, same footprint in every size so layouts never shift.
 * - Active with an image: the logo.
 * - Active without an image: white circle, inset ring in the franchise color, code in the display face.
 * - Extinct: solid circle in the provisional color, abbreviation in condensed heavy italic. Reads as identity.
 * - Club with no franchise record (pre-1946): neutral solid circle.
 */
export default function FranchiseLogo({ franchise, size = 'avatar', sizePx, fallbackName, className = '' }: Props) {
  const px = sizePx ?? SIZE_PX[size];
  const title = franchise?.fullName ?? fallbackName ?? '';

  if (franchise?.logo) {
    return (
      <img
        src={franchise.logo}
        alt={title}
        title={title}
        width={px}
        height={px}
        loading="lazy"
        className={`shrink-0 object-contain ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const isActive = franchise?.status === 'active';
  const color = franchise?.colors.primary ?? NEUTRAL_CLUB;
  const text = isActive && franchise?.code ? franchise.code : abbreviation(franchise?.nickname ?? fallbackName ?? '');

  if (isActive) {
    const ring = px >= 100 ? 3 : 2;
    return (
      <span
        role="img"
        aria-label={title}
        title={title}
        className={`inline-flex shrink-0 select-none items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[rgba(15,23,31,0.7)] ${className}`}
        style={{ width: px, height: px, fontSize: Math.max(5, Math.round(px * 0.3)), boxShadow: `inset 0 0 0 ${ring}px ${color}` }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full text-white ${cls.wordmark} ${className}`}
      style={{ width: px, height: px, fontSize: Math.max(6, Math.round(px * 0.32)), letterSpacing: px >= 100 ? 1 : px >= 36 ? 0.5 : 0, background: color }}
    >
      {text}
    </span>
  );
}
