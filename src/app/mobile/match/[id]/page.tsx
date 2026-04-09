import SportRadarFixtureWidget from '@/match/client/widgets/SportRadarFixtureWidget';

export default async function MobileMatchPage({
  params,
}: PageProps<'/mobile/match/[id]'>) {
  const { id } = await params;
  return <SportRadarFixtureWidget fixtureId={id} />;
}
