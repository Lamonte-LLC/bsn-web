import Callout from './Callout';
import { eraNotes } from '../lib/copy';

interface Props {
  /** Debut year of every player involved; the earliest decides which notes apply. */
  debutYears: number[];
  reboundsGapIn2000s?: boolean;
  className?: string;
}

/** The era notes that apply, as one friendly box with a clock icon. Renders nothing when none apply. */
export default function EraNotes({ debutYears, reboundsGapIn2000s = false, className = '' }: Props) {
  const notes = eraNotes({ debutYears, reboundsGapIn2000s });
  if (!notes.length) return null;
  return (
    <Callout icon="clock" title="Estadísticas de la época" className={className}>
      {notes.map((n) => (
        <p key={n}>{n}</p>
      ))}
    </Callout>
  );
}
