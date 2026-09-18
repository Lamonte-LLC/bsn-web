import { cls } from '@/archivo/lib/tokens';

/** Home-page card: same surface as the news and stats cards around it (hairline border, whisper shadow). */
export const HOME_CARD = 'rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_#14181F0A]';

const BUTTON_BASE = `inline-flex h-[44px] items-center justify-center rounded-[100px] px-[18px] text-[15px] transition-[opacity,transform,border-color] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 md:h-[38px] ${cls.focus}`;

/** Solid ink pill (design-system primary). */
export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#0F171F] text-white hover:opacity-90`;

/** Outline pill (design-system secondary). */
export const BUTTON_SECONDARY = `${BUTTON_BASE} border border-[#d5d5d5] bg-white text-[rgba(0,0,0,0.75)] hover:border-[rgba(0,0,0,0.3)]`;
