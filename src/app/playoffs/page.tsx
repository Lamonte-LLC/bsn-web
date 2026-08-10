import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import PlayoffsPageClient from './PlayoffsPageClient';
import PlayoffsHero from './PlayoffsHero';

export default function PlayoffsPage() {
  return (
    <FullWidthLayout divider subheader={<PlayoffsHero />}>
      <PlayoffsPageClient />
    </FullWidthLayout>
  );
}
