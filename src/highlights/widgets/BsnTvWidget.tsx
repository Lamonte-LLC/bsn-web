import { TopPerformancesType } from '../types';
import { getClient } from '@/apollo-client';
import { BSN_TV_DATE_FORMAT } from '@/constants';
import { TOP_PERFORMANCES } from '@/graphql/highlights';
import { formatDate } from '@/utils/date-formatter';
import { truncateText } from '@/utils/text';

type TopPerformancesResponse = {
  topPerformances: {
    items: TopPerformancesType[];
  };
};

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

export default async function BsnTvWidget() {
  const data = await fetchTopPerformances();
  const firstItem = data[0];
  const restItems = data.slice(1, 5);

  return (
    <div className="bg-[#0F171F] rounded-[18px]">
      <div className="px-[20px] py-[25px] lg:px-[50px] lg:py-[45px]">
        <div className="flex flex-row justify-between items-center mb-[26px] md:mb-[34px]">
          <div className="flex-1">
            <h3 className="text-[32px] text-white text-center md:text-left">
              BSN TV
            </h3>
            <p className="font-barlow font-medium text-[rgba(255,255,255,0.7)] text-center text-sm md:text-left md:text-[15px]">
              Lo más reciente en nuestro canal de YouTube
            </p>
          </div>
          <div className="hidden md:block">
            <a
              href="#"
              className="bg-[#FCFCFC] inline-block shadow-[0px_1px_2px_0px_#14181F0D] py-[12px] px-[20px] rounded-[12px] min-w-[212px] text-center"
            >
              <span className="text-base text-black">Ver canal en Youtube</span>
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-[25px] lg:flex-row lg:gap-[54px]">
          <div className="lg:w-[66%]">
            <div>
              <a
                href={`https://www.youtube.com/watch?v=${firstItem?.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <figure className="border border-[rgba(125,125,125,0.4)] relative rounded-[6px] shrink-0 overflow-hidden w-full mb-[15px] lg:mb-[26px]">
                  <img
                    src={firstItem?.videoId ? `https://img.youtube.com/vi/${firstItem.videoId}/maxresdefault.jpg` : firstItem?.coverUrl || ''}
                    alt={firstItem?.title || ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bg-[rgba(0,0,0,0.43)] left-0 top-0 right-0 bottom-0" />
                  <img
                    src="/assets/images/icons/icon-play-youtube.png"
                    alt=""
                    className="absolute left-[50%] top-[50%] transform -translate-x-[50%] -translate-y-[50%]"
                  />
                </figure>
              </a>
              <div>
                <div className="mb-[10px]">
                  <a
                    href={`https://www.youtube.com/watch?v=${firstItem?.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h2 className="font-barlow font-semibold text-white text-base lg:text-[24px]/7">
                      {firstItem?.title || ''}
                    </h2>
                  </a>
                </div>
                <p className="font-barlow font-medium text-[rgba(255,255,255,0.5)] text-[13px]">
                  {formatDate(firstItem?.publishedAt, BSN_TV_DATE_FORMAT)}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-[34%]">
            <div className="space-y-[15px] divide-y divide-[rgba(255,255,255,0.2)]">
              {restItems.map((item) => (
                <div
                  key={`highlight-${item.videoId}`}
                  className="flex flex-row gap-[18px] items-center pb-[15px]"
                >
                  <a
                    href={`https://www.youtube.com/watch?v=${item.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <figure className="border border-[rgba(125,125,125,0.4)] relative rounded-[6px] shrink-0 overflow-hidden w-[178px]">
                      <img
                        src={item?.videoId ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` : item?.coverUrl || ''}
                        alt={item?.title || ''}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_0.01%,rgba(0,0,0,0.8)_100%)]" />
                      <img
                        src="/assets/images/icons/icon-play-youtube2.png"
                        alt=""
                        className="absolute right-[8px] bottom-[8px]"
                      />
                    </figure>
                  </a>
                  <div>
                    <div className="mb-2 md:mb-4">
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <h3 className="font-barlow font-medium text-[rgba(255,255,255,0.8)] text-[13px]/4">
                          {truncateText(item?.title || '', 50)}
                        </h3>
                      </a>
                    </div>
                    <p className="font-barlow font-medium text-[rgba(255,255,255,0.5)] text-xs">
                      {formatDate(item?.publishedAt, BSN_TV_DATE_FORMAT)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
