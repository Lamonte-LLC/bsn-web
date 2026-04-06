import { CURRENT_SEASON, SEASON_CONNECTION } from '@/graphql/season';
import { SeasonType } from '@/season/types';
import { useQuery } from '@apollo/client/react';

type SeasonConnectionResponse = {
  seasonConnection: {
    edges: { node: SeasonType }[];
  };
};

export const useSeasonConnection = (first = 10) => {
  const { data, loading, error } = useQuery<SeasonConnectionResponse>(
    SEASON_CONNECTION,
    { variables: { first } },
  );

  if (error) {
    console.error(error);
  }

  const seasons = data?.seasonConnection.edges.map((e) => e.node) ?? [];

  return { seasons, loading, error };
};

type CurrentSeasonResponse = {
  currentSeason?: SeasonType;
};

export const useCurrentSeason = () => {
const { data, loading, error } = useQuery<CurrentSeasonResponse>(
    CURRENT_SEASON,
  );

  if (error) {
    console.error(error);
  }

  return { data: data?.currentSeason, loading, error };
};
