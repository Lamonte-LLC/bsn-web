// src/historia/hooks/useSeasons.ts
import { SEASON_CONNECTION } from '@/graphql/season';
import { useQuery } from '@apollo/client/react';

type SeasonsResponse = {
  seasonConnection: {
    edges: {
      node: {
        providerId: string;
        name: string;
        year: number;
        startDate: string;
        endDate: string;
        current: boolean;
      };
    }[];
  };
};

export function useSeasons(first = 50) {
  const { data, loading, error } = useQuery<SeasonsResponse>(SEASON_CONNECTION, {
    variables: { first },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error(error);
  }

  return { data: data?.seasonConnection.edges.map((edge) => edge.node) ?? [], loading, error };
}
