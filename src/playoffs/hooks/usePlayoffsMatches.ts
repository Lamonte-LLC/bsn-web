'use client';

import { useQuery } from '@apollo/client/react';
import { PLAYOFFS_MATCHES } from '@/graphql/series';

export type PlayoffMatchTeam = {
  code: string;
  nickname: string;
  city: string;
  score: string;
};

export type PlayoffSeriesCompetitor = {
  team: { code: string };
  won: number;
};

export type PlayoffMatch = {
  providerId: string;
  startAt: string;
  status: string;
  homeTeam: PlayoffMatchTeam;
  visitorTeam: PlayoffMatchTeam;
  gameNumber: number;
  series: {
    name: string;
    group: string | null;
    competitors: PlayoffSeriesCompetitor[];
  } | null;
};

type PlayoffsMatchesResponse = {
  matches: PlayoffMatch[];
};

export function usePlayoffsMatches() {
  const { data, loading, error } = useQuery<PlayoffsMatchesResponse>(PLAYOFFS_MATCHES, {
    variables: { fromDate: '2026-07-06', toDate: '2026-08-15' },
    fetchPolicy: 'cache-and-network',
  });

  if (error) {
    console.error(error);
  }

  return { matches: data?.matches ?? [], loading, error };
}
