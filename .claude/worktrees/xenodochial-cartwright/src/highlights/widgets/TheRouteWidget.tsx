import { TheRouteType } from '../types';
import { getClient } from '@/apollo-client';
import { THE_ROUTE } from '@/graphql/highlights';
import TheRouteSlider from '../client/components/TheRouteSlider';

type TheRouteResponse = {
  theRoute: {
    items: TheRouteType[];
  };
}


const fetchTheRoute = async (): Promise<TheRouteType[]> => {
  const { data, error } = await getClient().query<TheRouteResponse>({
    query: THE_ROUTE,
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.theRoute.items ?? [];
};

export default async function TheRouteWidget() {
  const data = await fetchTheRoute();

  return (
    <div>
      <TheRouteSlider items={data} />
    </div>
  );
};
