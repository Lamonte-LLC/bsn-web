export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Ink or white, whichever reads better on the given hex fill. */
export function textOn(hex: string | null | undefined): string {
  const rgb = hex ? hexToRgb(hex) : null;
  if (!rgb) return '#FFFFFF';
  return luminance(rgb) > 0.45 ? '#0F171F' : '#FFFFFF';
}
