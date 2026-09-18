import { eraNotes } from '../lib/copy';

interface Props {
  /** Debut year of every player involved; the earliest decides which notes apply. */
  debutYears: number[];
  reboundsGapIn2000s?: boolean;
  className?: string;
}

/** The era notes that apply, as fine print under the data: small, muted, one line each. Renders nothing when none apply. */
export default function EraNotes({ debutYears, reboundsGapIn2000s = false, className = '' }: Props) {
  const notes = eraNotes({ debutYears, reboundsGapIn2000s });
  if (!notes.length) return null;
  return (
    <div className={`flex items-start gap-[6px] font-barlow text-[12px] leading-[1.5] text-[rgba(0,0,0,0.45)] ${className}`}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-[3px] shrink-0">
        <path d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 4.5V8l2.5 1.5" />
      </svg>
      <p>
        <span className="font-semibold">Estadísticas de la época.</span> {notes.join(' ')}
      </p>
    </div>
  );
}
