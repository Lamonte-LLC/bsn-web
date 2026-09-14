/** "Mario 'Quijote' Morales Micheo" → "Morales Micheo". Drops nicknames in quotes and keeps the two surnames. */
export function shortName(name: string): string {
  const words = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= 2) return words.join(' ');
  return words.slice(-2).join(' ');
}

/** "Torres Dougherty" → "Torres D." for very narrow columns. */
export function tinyName(name: string): string {
  const [a, b] = shortName(name).split(' ');
  return b ? `${a} ${b[0]}.` : a;
}
