export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mix a color toward white (t > 0) or black (t < 0). */
export function mix(rgb: [number, number, number], t: number): [number, number, number] {
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  return [rgb[0] + (target - rgb[0]) * k, rgb[1] + (target - rgb[1]) * k, rgb[2] + (target - rgb[2]) * k];
}

/**
 * Nudge a color toward white or black until it reads at the requested contrast on the given background.
 * Used for initials in a franchise color on the ink band (lighten) and on the paper (darken).
 */
export function readableOn(hex: string, background: string, target = 4.5): string {
  const rgb = hexToRgb(hex);
  const bg = hexToRgb(background);
  if (!rgb || !bg) return hex;
  const towardWhite = luminance(bg) < 0.4;
  let current = rgb;
  for (let i = 0; i < 20 && contrast(current, bg) < target; i++) current = mix(current, towardWhite ? 0.12 : -0.12);
  return rgbToHex(current);
}

/** Ink or white, whichever reads better on the given hex fill. */
export function textOn(hex: string | null | undefined): string {
  const rgb = hex ? hexToRgb(hex) : null;
  if (!rgb) return '#FFFFFF';
  return luminance(rgb) > 0.45 ? '#0F171F' : '#FFFFFF';
}

/** "#RRGGBB" at the given alpha as an rgba() string. */
export function alpha(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.join(',')},${a})` : hex;
}
