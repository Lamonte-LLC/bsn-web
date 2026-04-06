export const truncateText = (
  text: string,
  maxLength: number = 100,
  ellipsis: string = '...',
): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + ellipsis;
};

export const getFirstWord = (text: string): string => {
  const words = text.trim().split(/\s+/);
  return words.length > 0 ? words[0] : '';
};

/** Sufijos que no son apellido (alineado con `get_player_short_name` en bsn-main). */
const GENERATIONAL_SUFFIXES = new Set([
  'jr',
  'sr',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  '2nd',
  '3rd',
  '4th',
  '5th',
]);

function normalizedSuffixToken(token: string): string {
  return token.replace(/^[,\s]+|[,\s]+$/g, '').replace(/\.$/, '').toLowerCase();
}

function splitGenerationalSuffixes(words: string[]): {
  core: string[];
  suffixes: string[];
} {
  const suffixes: string[] = [];
  const core = [...words];
  while (core.length > 0) {
    const token = core[core.length - 1] ?? '';
    if (GENERATIONAL_SUFFIXES.has(normalizedSuffixToken(token))) {
      suffixes.unshift(core.pop()!);
    } else {
      break;
    }
  }
  return { core, suffixes };
}

export const getInitials = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/);
  if (words.length === 0) return '';
  const { core, suffixes } = splitGenerationalSuffixes(words);
  if (core.length === 0) return fullName.trim();
  if (core.length === 1) return words.join(' ');
  const suffix = suffixes.length ? ` ${suffixes.join(' ')}` : '';
  return `${core[0]![0]!.toUpperCase()}. ${core[core.length - 1]}${suffix}`;
};
