// src/historia/hooks/usePlayerSuggestions.ts
import { PLAYER_SUGGESTIONS } from '@/graphql/player';
import { useQuery } from '@apollo/client/react';

type PlayerSuggestionsResponse = {
  playersConnection: {
    edges: {
      node: {
        providerId: string;
        avatarUrl: string | null;
        name: string;
        nickname: string | null;
        playingPosition: string;
        height: number | null;
        weight: number | null;
        dob: string | null;
        nationality: string | null;
      };
    }[];
  };
};

export function usePlayerSuggestions(search: string, first = 50) {
  const { data, loading, error } = useQuery<PlayerSuggestionsResponse>(PLAYER_SUGGESTIONS, {
    variables: { search: search || undefined, first },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error(error);
  }

  return { data: data?.playersConnection.edges.map((edge) => edge.node) ?? [], loading, error };
}
