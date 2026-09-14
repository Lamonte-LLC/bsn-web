import { Note } from '@/archivo/components/ui';
import { eraNotes } from '../lib/copy';

interface Props {
  /** Debut year of every player involved; the earliest decides which notes apply. */
  debutYears: number[];
  reboundsGapIn2000s?: boolean;
  className?: string;
}

/** The era notes that apply, one line each, under a table or a comparison. Renders nothing when none apply. */
export default function EraNotes({ debutYears, reboundsGapIn2000s = false, className = '' }: Props) {
  const notes = eraNotes({ debutYears, reboundsGapIn2000s });
  if (!notes.length) return null;
  return (
    <div className={`flex flex-col gap-[4px] ${className}`}>
      {notes.map((n) => (
        <Note key={n} className="!max-w-none">
          {n}
        </Note>
      ))}
    </div>
  );
}
