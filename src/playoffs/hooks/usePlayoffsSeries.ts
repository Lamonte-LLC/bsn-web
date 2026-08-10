'use client';

import { useQuery } from '@apollo/client/react';
import { PLAYOFFS_SERIES_CONNECTION } from '@/graphql/series';

type Team = {
  providerId: string;
  code: string;
  nickname: string;
  score: string;
};

export type SeriesCompetitor = {
  team: Team;
  won: number;
  lost: number;
  drawn: number;
};

export type SeriesMatch = {
  providerId: string;
  startAt: string;
  homeTeam: Team;
  visitorTeam: Team;
  status: string;
};

export type PlayoffsSeriesNode = {
  providerId: string;
  name: string;
  group: string | null;
  round: number;
  status: string;
  competitors: SeriesCompetitor[];
  matches: SeriesMatch[];
};

type SeriesConnectionResponse = {
  seriesConnection: {
    edges: { node: PlayoffsSeriesNode }[];
  };
};

export function usePlayoffsSeries() {
  const { data, loading, error } = useQuery<SeriesConnectionResponse>(PLAYOFFS_SERIES_CONNECTION, {
    variables: { first: 20 },
    fetchPolicy: 'cache-and-network',
  });

  if (error) {
    console.error(error);
  }

  const nodes = (data?.seriesConnection.edges ?? []).map((e) => e.node);

  return { nodes, loading, error };
}
