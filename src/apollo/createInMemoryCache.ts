import { InMemoryCache } from '@apollo/client-integration-nextjs';

/**
 * Única fuente de verdad para `InMemoryCache` (SSR en `apollo-client` y navegador en `ApolloWrapper`).
 * Evita duplicar opciones en dos sitios y que solo una rama rompa producción.
 *
 * ## No añadir `typePolicies.keyFields` a ciegas
 * Tipos como `MatchTeamType` aparecen en muchas queries **sin** `providerId` (solo `code`,
 * `score`, `competitionStandings`, etc.). Forzar `keyFields: ['providerId']` hace que
 * `cache.identify()` lance **Invariant Violation** en SSR (Heroku / Next).
 *
 * Si necesitas normalizar: `keyFields: false` para incrustar sin ID global, o asegurar
 * el mismo campo en **todas** las selecciones GraphQL de ese tipo.
 *
 * `keyFields: false` en MatchTeamType evita que Apollo intente `providerId`/`id` cuando la
 * query solo trae code, nickname y standings (p. ej. calendario / home SSR).
 */
export function createBsnInMemoryCache() {
  return new InMemoryCache({
    typePolicies: {
      MatchTeamType: { keyFields: false },
      Query: {
        fields: {
          /**
           * `playersConnection` pagina por cursor (buscador del comparador de jugadores). Sin esta política la
           * caché guarda cada página bajo la misma clave y conserva el `pageInfo` de la primera, de modo que el
           * cursor nunca avanza y la lista se detiene tras la página inicial. Las páginas se concatenan y el
           * `pageInfo` que manda es el de la última. Las búsquedas (`search`) se cachean por separado.
           */
          playersConnection: {
            keyArgs: ['search'],
            merge(existing: { edges?: unknown[] } | undefined, incoming: { edges?: unknown[] }, { args }: { args: Record<string, unknown> | null }) {
              // Sin cursor es una primera página (o una búsqueda nueva): reemplaza en vez de concatenar.
              if (!args?.after) return incoming;
              return { ...incoming, edges: [...(existing?.edges ?? []), ...(incoming.edges ?? [])] };
            },
          },
        },
      },
    },
  });
}
