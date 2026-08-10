'use client';

import { useQuery } from '@apollo/client/react';
import { PLAYOFFS_BRACKET_CONNECTION } from '@/graphql/series';

type Team = {
  providerId: string;
  code: string;
  nickname: string;
};

export type Competitor = {
  team: Team;
  won: number;
  position: number;
};

export type SeriesNode = {
  name: string;
  group: string | null;
  round: number;
  competitors: Competitor[];
};

type BracketConnectionResponse = {
  seriesConnection: {
    edges: { node: SeriesNode }[];
  };
};

export function usePlayoffsBracket() {
  const { data, loading, error } = useQuery<BracketConnectionResponse>(PLAYOFFS_BRACKET_CONNECTION, {
    variables: { first: 7 },
    fetchPolicy: 'cache-and-network',
  });

  if (error) {
    console.error(error);
  }

  const nodes = (data?.seriesConnection.edges ?? []).map((e) => e.node);

  return { nodes, loading, error };
}
