import type { Metadata } from 'next';
import { getClient } from '@/apollo-client';
import { PLAYER_COMPARISON, PLAYER_PROFILE } from '@/graphql/player';
import { CURRENT_SEASON } from '@/graphql/season';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { SeasonType } from '@/season/types';
import PlayerProfileHero from './PlayerProfileHero';
import PlayerProfileTabs from './PlayerProfileTabs';
import { buildProfile, type ComparisonQueryPlayer, type PlayerProfileData, type ProfileQueryPlayer } from './profile-data';

type Params = Promise<{ slug: string }>;

const fetchPlayer = async (slug: string): Promise<ProfileQueryPlayer> => {
  const { data, error } = await getClient().query<{ player: ProfileQueryPlayer | null }>({
    query: PLAYER_PROFILE,
    variables: { geniusId: 0, providerId: slug },
  });

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch player data');
  }

  const player = data?.player;

  if (player == null) {
    console.error('No player data found for slug:', slug);
    throw new Error('Player not found');
  }

  return player;
};

/** Every season line and the career totals; the profile still renders when this one fails. */
const fetchSeasons = async (slug: string): Promise<ComparisonQueryPlayer> => {
  try {
    const { data, error } = await getClient().query<{ player: ComparisonQueryPlayer }>({
      query: PLAYER_COMPARISON,
      variables: { providerId: slug },
    });
    if (error) console.error('Error fetching player seasons:', error);
    return data?.player ?? null;
  } catch (error) {
    console.error('Error fetching player seasons:', error);
    return null;
  }
};

const fetchCurrentSeason = async (): Promise<SeasonType | null> => {
  const { data, error } = await getClient().query<{ currentSeason?: SeasonType }>({
    query: CURRENT_SEASON,
  });

  if (error) {
    console.error('Error fetching current season:', error);
    return null;
  }
  return data?.currentSeason ?? null;
};

async function loadProfile(slug: string): Promise<{ profile: PlayerProfileData; currentYear: number | null }> {
  const [player, seasons, currentSeason] = await Promise.all([fetchPlayer(slug), fetchSeasons(slug), fetchCurrentSeason()]);
  return { profile: buildProfile(player, seasons), currentYear: currentSeason?.year ?? null };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const player = await fetchPlayer(slug);
    return { title: `${player.name} · Jugadores · BSN` };
  } catch {
    return { title: 'Jugadores · BSN' };
  }
}

export default async function DetalleJugadorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { profile, currentYear } = await loadProfile(slug);

  return (
    <FullWidthLayout divider subheader={<PlayerProfileHero profile={profile} />}>
      <PlayerProfileTabs profile={profile} currentYear={currentYear} />
    </FullWidthLayout>
  );
}
