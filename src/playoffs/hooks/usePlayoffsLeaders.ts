'use client';

import { useQuery } from '@apollo/client/react';
import { PLAYOFFS_LEADERS_STATS_CONNECTION } from '@/graphql/stats';

export type LeaderPlayer = {
  providerId: string;
  avatarUrl: string;
  name: string;
  playingPosition: string;
  teamCode: string;
  teamName: string;
};

export type LeaderNode = {
  player: LeaderPlayer;
  value: number;
};

type LeadersCategory = {
  edges: { node: LeaderNode }[];
};

type PlayoffsLeadersResponse = {
  pointsLeaders: LeadersCategory;
  reboundsLeaders: LeadersCategory;
  assistsLeaders: LeadersCategory;
  blocksLeaders: LeadersCategory;
  stealsLeaders: LeadersCategory;
  fieldGoalsLeaders: LeadersCategory;
};

function toNodes(category: LeadersCategory | undefined): LeaderNode[] {
  return (category?.edges ?? []).map((e) => e.node);
}

export function usePlayoffsLeaders(first = 5) {
  const { data, loading, error } = useQuery<PlayoffsLeadersResponse>(
    PLAYOFFS_LEADERS_STATS_CONNECTION,
    {
      variables: { first },
      fetchPolicy: 'cache-and-network',
    }
  );

  if (error) {
    console.error(error);
  }

  return {
    pointsLeaders: toNodes(data?.pointsLeaders),
    reboundsLeaders: toNodes(data?.reboundsLeaders),
    assistsLeaders: toNodes(data?.assistsLeaders),
    blocksLeaders: toNodes(data?.blocksLeaders),
    stealsLeaders: toNodes(data?.stealsLeaders),
    fieldGoalsLeaders: toNodes(data?.fieldGoalsLeaders),
    loading,
    error,
  };
}
