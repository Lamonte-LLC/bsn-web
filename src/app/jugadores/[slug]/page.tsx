import numeral from 'numeral';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { getClient } from '@/apollo-client';
import { PLAYER_PROFILE } from '@/graphql/player';
import { PlayerType } from '@/player/types';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import { centimeterToInches, kilogramToPounds } from '@/utils/unit-converter';
import { formatInches } from '@/utils/unit-formater';
import { PLAYER_BIRTHDAY_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';
import PlayerMatchesWidget from '@/player/client/widgets/PlayerMatchesWidget';
import { CURRENT_SEASON } from '@/graphql/season';
import PlayerAllSeasonsAvgStatsWidget from '@/player/client/widgets/PlayerAllSeasonsAvgStatsWidget';
import PlayerAllSeasonsTotalStatsWidget from '@/player/client/widgets/PlayerAllSeasonsTotalStatsWidget';
import { SeasonType } from '@/season/types';

type PlayerPageResponse = {
  player: PlayerType;
};

const fetchPlayer = async (slug: string): Promise<PlayerPageResponse> => {
  const { data, error } = await getClient().query<PlayerPageResponse>({
    query: PLAYER_PROFILE,
    variables: { geniusId: 0, providerId: slug },
  });

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch player data');
  }

  const player = data?.player;

  if (player == null) {
    console.error('No player data found for slug:', slug);
    throw new Error('Player not found');
  }

  const playerPageResponse: PlayerPageResponse = {
    player,
  };

  return playerPageResponse;
};

type CurrentSeasonResponse = {
  currentSeason?: SeasonType;
};

const fetchCurrentSeason = async (): Promise<SeasonType | null> => {
  const { data, error } = await getClient().query<CurrentSeasonResponse>({
    query: CURRENT_SEASON,
  });

  if (error) {
    console.error('Error fetching current season:', error);
    return null;
  }
  return data?.currentSeason ?? null;
};

export default async function DetalleJugadorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data: PlayerPageResponse = await fetchPlayer(slug);
  const currentSeason: SeasonType | null = await fetchCurrentSeason();
  const avatarUrl = data.player.avatarUrl
    ? `${data.player.avatarUrl}?size=400`
    : '';

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pt-[25px] md:pt-[30px] lg:pt-[50px]">
          <div className="container">
            <div className="grid grid-cols-1 gap-4 items-center md:grid-cols-12">
              <div className="col-span-1 mb-[20px] md:mb-0 md:col-span-12 lg:col-span-5">
                <div className="flex flex-row items-center gap-4">
                  <div className="relative">
                    <figure
                      className="hidden w-[190px] h-[190px] rounded-full border border-2 overflow-hidden md:block"
                      style={{
                        borderColor: data.player.seasonRoster?.team?.colorPrimary || '#ccc',
                      }}
                    >
                      <PlayerPhotoAvatar
                        photoUrl={avatarUrl}
                        size={190}
                        name={data.player.name}
                      />
                    </figure>
                    <figure
                      className="w-[125px] h-[125px] rounded-full border border-2 overflow-hidden md:hidden"
                      style={{
                        borderColor: data.player.seasonRoster?.team?.colorPrimary || '#ccc',
                      }}
                    >
                      <PlayerPhotoAvatar
                        photoUrl={avatarUrl}
                        size={125}
                        name={data.player.name}
                      />
                    </figure>
                    {data.player.seasonRoster?.jerseyNumber && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <p className="bg-[#232323] border border-[rgba(125,125,125,0.23)] inline min-w-[32px] px-2 rounded-[100px] md:py-0.5 md:min-w-auto">
                          <span className="font-barlow font-semibold text-xs text-white md:text-[15px]">
                            #{data.player.seasonRoster.jerseyNumber}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="md:mb-1">
                      <h4 className="text-white text-[20px] md:text-[32px]">
                        {data.player.name}
                      </h4>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="hidden md:block">
                        <TeamLogoAvatar
                          teamCode={data.player.seasonRoster?.team?.code ?? ''}
                          size={24}
                        />
                      </div>
                      <div className="md:hidden">
                        <TeamLogoAvatar
                          teamCode={data.player.seasonRoster?.team?.code ?? ''}
                          size={20}
                        />
                      </div>
                      <span className="font-barlow font-medium text-[13px] text-[rgba(255,255,255,0.7)] md:text-[15px]">
                        {getFirstWord(data.player.seasonRoster?.team?.nickname || '')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-12 lg:col-span-7">
                <div className="mb-3">
                  <h4 className="text-[14px] md:text-[16px] tracking-[1px] text-[rgba(255,255,255,0.5)] uppercase">{currentSeason?.name}</h4>
                </div>
                <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                  <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                    <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                      Puntos por juego
                    </h5>
                    <p className="text-[22px] text-white md:text-[27px]">
                      {numeral(data.player.seasonStats?.pointsAvg ?? 0).format('0.0')}
                    </p>
                  </div>
                  <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                    <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                      Rebotes por juego
                    </h5>
                    <p className="text-[22px] text-white md:text-[27px]">
                      {numeral(data.player.seasonStats?.reboundsTotalAvg ?? 0).format(
                        '0.0',
                      )}
                    </p>
                  </div>
                  <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                    <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                      Asistencias por juego
                    </h5>
                    <p className="text-[22px] text-white md:text-[27px]">
                      {numeral(data.player.seasonStats?.assistsAvg ?? 0).format(
                        '0.0',
                      )}
                    </p>
                  </div>
                  <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                    <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                      % Tiros de campo
                    </h5>
                    <p className="text-[22px] text-white md:text-[27px]">
                      {numeral(
                        data.player.seasonStats?.fieldGoalsPercentage ?? 0,
                      ).format('0.0%')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:mt-[40px]">
              <div className="border-b border-transparent md:border-[rgba(255,255,255,0.07)]"></div>
            </div>
            <div className="py-[24px] md:py-[40px] lg:w-7/12">
              <div className="grid grid-cols-3 gap-x-3 gap-y-[24px] md:grid-cols-5">
                <div>
                  <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                    Posición
                  </h5>
                  <p className="text-base text-white md:text-[18px]">
                    {data.player.seasonRoster?.playingPosition || 'N/A'}
                  </p>
                </div>
                <div>
                  <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                    Altura
                  </h5>
                  <p className="text-base text-white md:text-[18px]">
                    {centimeterToInches(data.player.height) > 0
                      ? formatInches(centimeterToInches(data.player.height))
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                    Peso
                  </h5>
                  <p className="text-base text-white md:text-[18px]">
                    {kilogramToPounds(data.player.weight) > 0
                      ? `${numeral(kilogramToPounds(data.player.weight)).format('0.0')} lbs`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                    Fecha de nacimiento
                  </h5>
                  <p className="text-base text-white md:text-[18px]">
                    {data.player.dob
                      ? formatDate(data.player.dob, PLAYER_BIRTHDAY_FORMAT)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">
                    Lugar de origen
                  </h5>
                  <p className="text-base text-white md:text-[18px]">
                    {data.player.nationality || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <TabGroup>
        <TabList className="mt-[30px] md:mt-[40px] lg:mt-[50px]">
          <div className="container text-center space-x-[8px] md:space-x-[10px]">
            <Tab className="border border-[#D5D5D5] bg-white cursor-pointer w-[114px] outline-none px-[14px] py-[5px] rounded-[100px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:text-white data-selected:border-[#0F171F] data-selected:bg-[#0F171F] md:px-[20px] md:w-[170px]">
              Promedios
            </Tab>
            <Tab className="border border-[#D5D5D5] bg-white cursor-pointer w-[114px] outline-none px-[14px] py-[5px] rounded-[100px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:text-white data-selected:border-[#0F171F] data-selected:bg-[#0F171F] md:px-[20px] md:w-[170px]">
              Totales
            </Tab>
            <Tab className="border border-[#D5D5D5] bg-white cursor-pointer w-[114px] outline-none px-[14px] py-[5px] rounded-[100px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:text-white data-selected:border-[#0F171F] data-selected:bg-[#0F171F] md:px-[20px] md:w-[170px]">
              Juego por juego
            </Tab>
          </div>
        </TabList>
        <TabPanels>
          <TabPanel>
            <section>
              <div className="mt-[28px] mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[45px]">
                <div className="container">
                  <PlayerAllSeasonsAvgStatsWidget
                    playerProviderId={data.player.providerId}
                  />
                </div>
              </div>
            </section>
          </TabPanel>
          <TabPanel>
            <section>
              <div className="mt-[28px] mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[45px]">
                <div className="container">
                  <PlayerAllSeasonsTotalStatsWidget
                    playerProviderId={data.player.providerId}
                  />
                </div>
              </div>
            </section>
          </TabPanel>
          <TabPanel>
            <section>
              <div className="mt-[28px] mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[45px]">
                <div className="container">
                  <PlayerMatchesWidget
                    playerProviderId={data.player.providerId}
                  />
                </div>
              </div>
            </section>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </FullWidthLayout>
  );
}
