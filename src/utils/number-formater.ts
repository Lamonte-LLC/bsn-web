/**
 * Fracción de victorias (0–1) desde ganados/perdidos.
 * No usar `percentageWon` del backend para la UI: a veces viene mal escalado
 * (p. ej. ya en 0–1 y se guardó /100 → ~0.01 y se muestra ".010").
 */
export function winFractionFromRecord(won: number, lost: number): number {
  const w = Number(won);
  const l = Number(lost);
  const gp = w + l;
  if (!Number.isFinite(w) || !Number.isFinite(l) || gp <= 0) {
    return 0;
  }
  return w / gp;
}

/**
 * Win % como en standings NBA/MLB: ".500", ".667", "1.000".
 * numeral.js ".000" interpreta mal el 1 y muestra ".000" en lugar de "1.000".
 */
export function formatStandingsWinPct(pct: number): string {
  if (!Number.isFinite(pct)) {
    return '.000';
  }
  const x = Math.min(Math.max(pct, 0), 1);
  const s = x.toFixed(3);
  return s.startsWith('0.') ? s.slice(1) : s;
}

/**
 * Redondea hacia arriba a 1 decimal (e.g. 14.51 → "14.6", 14.5 → "14.5").
 */
export const roundUp1 = (v: number): string => {
  if (!Number.isFinite(v)) return '0.0';
  return (Math.ceil(v * 10) / 10).toFixed(1);
};

/**
 * Porcentaje (entrada 0–1) redondeado hacia arriba a 1 decimal (e.g. 0.4567 → "45.7%").
 */
export const formatPctRoundUp1 = (v: number): string => {
  if (!Number.isFinite(v)) return '0.0%';
  return `${(Math.ceil(v * 1000) / 10).toFixed(1)}%`;
};

export const ordinalNumber = (num: number): string => {
  if (num == null) {
    return '';
  }

  if (num === 1) return '1er';
  if (num === 2) return '2do';
  if (num === 3) return '3er';
  if (num === 4) return '4to';
  if (num === 5) return '5to';
  if (num === 6) return '6to';
  if (num === 7) return '7mo';
  if (num === 8) return '8vo';
  if (num === 9) return '9no';
  if (num === 10) return '10mo';
  if (num === 11) return '11vo';
  if (num === 12) return '12vo';
  if (num === 13) return '13vo';
  if (num === 14) return '14vo';
  if (num === 15) return '15vo';
  if (num === 16) return '16vo';
  if (num === 17) return '17mo';
  if (num === 18) return '18vo';
  if (num === 19) return '19no';
  if (num === 20) return '20mo';
  return `${num}º`;
};
