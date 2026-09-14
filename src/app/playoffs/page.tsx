import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getFranchises } from '@/archivo/lib/data';
import { franchiseContextLineShort } from '@/historia/lib/copy';
import { CURRENT_SEASON, franchiseContextByCode } from '@/historia/lib/data';
import PlayoffsPageClient, { type SeriesContext } from './PlayoffsPageClient';
import PlayoffsHero from './PlayoffsHero';

/** One line of historical context per active franchise, keyed by live team code, for the series cards. */
function seriesContext(): Record<string, SeriesContext> {
  const out: Record<string, SeriesContext> = {};
  for (const f of getFranchises()) {
    if (!f.code) continue;
    const line = franchiseContextLineShort(franchiseContextByCode(f.code), CURRENT_SEASON);
    if (line) out[f.code] = { line, href: `/equipos/${f.code}?tab=historia` };
  }
  return out;
}

export default function PlayoffsPage() {
  return (
    <FullWidthLayout divider subheader={<PlayoffsHero />}>
      <PlayoffsPageClient contextByCode={seriesContext()} />
    </FullWidthLayout>
  );
}
