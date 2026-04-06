import { TopPerformancesType } from '../types';
import { getClient } from '@/apollo-client';
import { TOP_PERFORMANCES } from '@/graphql/highlights';
import TopPerformancesSlider from '../client/components/TopPerformancesSlider';

type TopPerformancesResponse = {
  topPerformances: {
    items: TopPerformancesType[];
  };
}


const fetchTopPerformances = async (): Promise<TopPerformancesType[]> => {
  const { data, error } = await getClient().query<TopPerformancesResponse>({
    query: TOP_PERFORMANCES,
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.topPerformances.items ?? [];
};

export default async function TopPerformancesWidget() {
  const data = await fetchTopPerformances();

  return (
    <div>
      <TopPerformancesSlider items={data} />
    </div>
  );
};
