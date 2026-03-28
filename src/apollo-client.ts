import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
} from "@apollo/client-integration-nextjs";
import { createBsnInMemoryCache } from "@/apollo/createInMemoryCache";

/**
 * Ensures Apollo always receives JSON. Empty/HTML/plain-text bodies from the
 * gateway otherwise throw (e.g. CombinedGraphQLErrors during SSR).
 */
const fetchGraphQL: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  const text = await res.text();
  const trimmed = text.trim();

  const invalidBody =
    !trimmed ||
    trimmed.startsWith("<") ||
    (!trimmed.startsWith("{") && !trimmed.startsWith("["));

  if (!invalidBody) {
    try {
      JSON.parse(trimmed);
      return new Response(text, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch {
      // Non-JSON that looked like an object/array — fall through to synthetic error
    }
  }

  const body = JSON.stringify({
    errors: [
      {
        message: `GraphQL HTTP response was not valid JSON (status ${res.status})`,
      },
    ],
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: createBsnInMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: process.env.BSN_GRAPHQL_URI,
      fetch: fetchGraphQL,
    }),
  });
});
