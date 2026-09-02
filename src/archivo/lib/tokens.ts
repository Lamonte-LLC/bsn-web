/**
 * Visual tokens of Archivo BSN. Every color and recurring class preset lives here so the pages never
 * repeat hex values. Values come from the Claude Design exports in scripts/archivo/design/.
 */
export const INK = '#0F171F';
export const RED = '#E51F1F';
export const BLUE = '#1772D9';
export const BLUE_HOVER = '#1257A8';
export const AMBER = '#9A7712';
export const AMBER_LINE = '#D9A62E';
export const GOLD = '#FEC200';
export const PAPER = '#FDFDFD';
export const PAPER_ALT = '#FAFAFA';
export const NEUTRAL_CLUB = '#4A5560';
export const EASE = 'cubic-bezier(0.4,0,0.2,1)';

/** Slot colors of the comparison (A ink, B blue, C amber). Not franchise colors on purpose. */
export const SLOT_COLORS = [INK, BLUE, AMBER] as const;

/**
 * Provisional palette for extinct franchises whose color came from the league prototype. Muted on purpose so
 * they read as identity, not as UI accents, until the league provides the original marks.
 */
export const EXTINCT_COLORS: Record<string, string> = {
  cariduros: '#C2542B',
  cardenales: '#8A2A33',
  gallitos: '#3E7A4E',
  'gallitos-upr': '#3E7A4E',
  polluelos: '#7A6440',
  titanes: '#4A5A6A',
  brujos: '#5B4E8C',
  santos: '#54606E',
};
export const EXTINCT_FALLBACK = '#6B7280';

/** Class presets. Display face is the body default (Special Gothic Condensed One), so it needs no class. */
export const cls = {
  /** Unit or column label: Barlow 600, caps, 45% ink. */
  label: 'font-barlow text-[11px] font-semibold uppercase tracking-[0.8px] text-[rgba(0,0,0,0.45)]',
  /** Eyebrow above a page title on paper. */
  eyebrow: 'font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-[rgba(0,0,0,0.45)]',
  /** Container title: Barlow 700, full ink, never caps. */
  title: 'font-barlow text-[15px] font-bold tracking-[0.2px] text-[#0F171F]',
  /** Editorial body copy. */
  body: 'font-barlow text-[15px] leading-[1.55] text-[rgba(0,0,0,0.65)]',
  /** Source or footnote line under a visual. */
  note: 'font-barlow text-[12.5px] leading-[1.6] text-[rgba(0,0,0,0.5)]',
  /** Secondary text next to a name. */
  meta: 'font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)]',
  /** White card on paper. No shadow: elevation only on hover of tappable cards, dropdowns and popovers. */
  card: 'rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white',
  cardTap: 'rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white transition-shadow duration-150 hover:shadow-[0_2px_14px_rgba(14,20,32,0.08)]',
  /** Keyboard focus ring, shared by every control on paper. */
  focus: 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)]',
  /** Keyboard focus ring on the ink band. */
  focusOnDark: 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
  /** Hairline underline for links inside data (years, names). */
  dataLink: 'border-b border-[rgba(0,0,0,0.18)] transition-colors duration-150 hover:border-[rgba(0,0,0,0.45)]',
  /** Inline text link in the brand blue. */
  textLink: 'font-barlow text-[13px] font-medium text-[#1772D9] transition-colors duration-150 hover:text-[#1257A8]',
  tabular: '[font-variant-numeric:tabular-nums]',
  /** Provisional wordmark face: Barlow Condensed 800 italic, loaded by app/archivo/layout.tsx. */
  wordmark: 'font-(family-name:--font-bc-heavy) italic font-extrabold tracking-[0.5px]',
} as const;
