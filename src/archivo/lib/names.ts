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

/** "Jose Rafael 'Piculín' Ortiz Rijos" → "J. Ortiz": first initial and first surname, for phone-width labels. */
export function initialName(name: string): string {
  const words = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  if (words.length < 2) return name;
  // Two given names and two surnames ("Jose Rafael Ortiz Rijos") or one and two ("George Torres Dougherty"):
  // the first surname sits second to last; with two words it is simply the last.
  const surname = words[words.length >= 3 ? words.length - 2 : 1];
  return `${words[0][0]}. ${surname}`;
}
