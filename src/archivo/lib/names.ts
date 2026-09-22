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
  const clean = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ').replace(/\s+/g, ' ').trim();
  const [given, surname] = splitForNickname(clean);
  if (!surname) return clean;
  const words = clean.split(' ');
  const last = words[words.length - 1];
  const suffix = words.length > 2 && SUFFIXES.has(last.toLowerCase()) ? ` ${last}` : '';
  return `${given[0]}. ${surname.split(' ')[0]}${suffix}`;
}

/** Second words that are given names (or initials), so the nickname lands before the surname: José Rafael "Piculín" Ortiz. */
const GIVEN_NAMES = new Set(['aaron', 'edward', 'james', 'john', 'lee', 'alberto', 'alejandro', 'alexander', 'alexis', 'andres', 'andrés', 'angel', 'ángel', 'anthony', 'antonio', 'armando', 'arturo', 'benjamin', 'benjamín', 'carlos', 'cesar', 'césar', 'christian', 'daniel', 'david', 'edgar', 'eduardo', 'elias', 'elías', 'emmanuel', 'enrique', 'ernesto', 'felix', 'félix', 'fernando', 'francisco', 'gabriel', 'gilberto', 'guillermo', 'hector', 'héctor', 'ivan', 'iván', 'jaime', 'javier', 'jesus', 'jesús', 'joel', 'jonathan', 'jorge', 'jose', 'josé', 'juan', 'julio', 'kevin', 'luis', 'manuel', 'marcos', 'mario', 'michael', 'miguel', 'nelson', 'omar', 'orlando', 'oscar', 'óscar', 'pablo', 'pedro', 'rafael', 'ramon', 'ramón', 'raul', 'raúl', 'reinaldo', 'ricardo', 'roberto', 'ruben', 'rubén', 'samuel', 'victor', 'víctor', 'wilfredo', 'william']);

/**
 * Splits a name where the nickname goes, before the surname: "José Rafael Ortiz" → ["José Rafael", "Ortiz"],
 * "Ángel L. Figueroa" → ["Ángel L.", "Figueroa"], "Mario Morales Micheo" → ["Mario", "Morales Micheo"].
 * A second word that is an initial or a common given name stays with the first name.
 */
const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv']);

export function splitForNickname(name: string): [string, string] {
  const words = name.trim().split(/\s+/).filter((w, i, all) => !(i === all.length - 1 && all.length > 2 && SUFFIXES.has(w.toLowerCase())));
  if (words.length < 2) return [name.trim(), ''];
  const second = words[1];
  const isInitial = /^[A-ZÁÉÍÓÚÑ]\.?$/.test(second);
  const cut = words.length >= 3 && (isInitial || GIVEN_NAMES.has(second.toLowerCase())) ? 2 : 1;
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'van', 'von', 'di', 'da', 'mc', 'st.']);

/** "Jezreel De Jesús Rodríguez" → "Jezreel De Jesús"; "Mario Morales Micheo" → "Mario Morales": the given name(s) and one surname. */
export function displayName(name: string): string {
  const clean = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ').replace(/\s+/g, ' ').trim();
  const [given, surname] = splitForNickname(clean);
  if (!surname) return clean;
  const words = surname.split(' ');
  const take = PARTICLES.has(words[0].toLowerCase()) && words.length > 1 ? 2 : 1;
  return `${given} ${words.slice(0, take).join(' ')}`;
}
