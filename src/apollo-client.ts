import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
} from "@apollo/client-integration-nextjs";
import { createBsnInMemoryCache } from "@/apollo/createInMemoryCache";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: createBsnInMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: process.env.BSN_GRAPHQL_URI,
    }),
  });
});
