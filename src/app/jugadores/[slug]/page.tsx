import numeral from 'numeral';
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

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'games' },
  { label: 'MIN', key: 'minutes' },
  { label: 'PTS', key: 'points' },
  { label: 'FGM', key: 'fieldGoalsMadeAvg' },
  { label: 'FGA', key: 'fieldGoalsAttemptedAvg' },
  { label: 'FG%', key: 'fieldGoalsPercentage' },
  { label: '3PM', key: 'threePointersMadeAvg' },
  { label: '3PA', key: 'threePointersAttemptedAvg' },
  { label: '3P%', key: 'threePointersPercentage' },
  { label: 'FTM', key: 'freeThrowsMadeAvg' },
  { label: 'FTA', key: 'freeThrowsAttemptedAvg' },
  { label: 'FT%', key: 'freeThrowsPercentage' },
  { label: 'OREB', key: 'offensiveReboundsAvg' },
  { label: 'DREB', key: 'defensiveReboundsAvg' },
  { label: 'REB', key: 'reboundsTotalAvg' },
  { label: 'AST', key: 'assistsAvg' },
  { label: 'TOV', key: 'turnoversAvg' },
  { label: 'STL', key: 'stealsAvg' },
  { label: 'BLK', key: 'blocksAvg' },
  { label: 'PF', key: 'foulsPersonalAvg' },
  { label: '+/-', key: 'plusMinusPointsAvg' },
];

export default async function DetalleJugadorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data: PlayerPageResponse = await fetchPlayer(slug);

  return (
    <FullWidthLayout>
      <section className="bg-[#0F171F]">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 items-center md:grid-cols-12">
            <div className="col-span-1 md:col-span-12 lg:col-span-5">
              <div className="flex flex-row items-center gap-4">
                <div className="relative">
                  <figure
                    className="w-[125px] h-[125px] rounded-full border border-2 overflow-hidden"
                    style={{
                      borderColor: data.player.team.colorPrimary || '#ccc',
                    }}
                  >
                    <PlayerPhotoAvatar
                      photoUrl={data.player.avatarUrl}
                      size={125}
                      name={data.player.name}
                    />
                  </figure>
                  {data.player.shirtNumber && (
                    <div className="absolute -bottom-2 left-0 right-0 text-center">
                      <p className="bg-[#232323] border border-[rgba(125,125,125,0.23)] inline px-2 py-0.5 rounded-[100px]">
                        <span className="font-barlow font-semibold text-[15px] text-white">
                          #{data.player.shirtNumber}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-1">
                    <h4 className="text-white md:text-[32px]">
                      {data.player.name}
                    </h4>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <TeamLogoAvatar
                      teamCode={data.player.team.code}
                      size={24}
                    />
                    <span className="font-barlow font-medium text-[15px] text-[rgba(255,255,255,0.7)]">
                      {data.player.team.nickname}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-12 lg:col-span-7">
              <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                  <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                    Puntos por juego
                  </h5>
                  <p className="text-[27px] text-white">
                    {numeral(data.player.stats?.pointsAvg ?? 0).format('0.0')}
                  </p>
                </div>
                <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                  <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                    Rebotes por juego
                  </h5>
                  <p className="text-[27px] text-white">
                    {numeral(data.player.stats?.reboundsTotalAvg ?? 0).format(
                      '0.0',
                    )}
                  </p>
                </div>
                <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                  <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                    Asistencias por juego
                  </h5>
                  <p className="text-[27px] text-white">
                    {numeral(data.player.stats?.assistsAvg ?? 0).format('0.0')}
                  </p>
                </div>
                <div className="border border-[rgba(255,255,255,0.2)] rounded-[12px] px-[14px] py-[12px]">
                  <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                    % Tiros de campo
                  </h5>
                  <p className="text-[27px] text-white">
                    {numeral(
                      data.player.stats?.fieldGoalsPercentage ?? 0,
                    ).format('0.0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-[24px]">
            <div className="border-b border-[rgba(255,255,255,0.07)]"></div>
          </div>
          <div className="pb-[24px] lg:w-7/12">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              <div>
                <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                  Posición
                </h5>
                <p className="text-[18px] text-white">
                  {data.player.playingPosition || 'N/A'}
                </p>
              </div>
              <div>
                <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                  Altura
                </h5>
                <p className="text-[18px] text-white">
                  {centimeterToInches(data.player.height) > 0
                    ? formatInches(centimeterToInches(data.player.height))
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                  Peso
                </h5>
                <p className="text-[18px] text-white">
                  {kilogramToPounds(data.player.weight) > 0
                    ? `${numeral(kilogramToPounds(data.player.weight)).format('0.0')} lbs`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                  Fecha de nacimiento
                </h5>
                <p className="text-[18px] text-white">
                  {data.player.dob
                    ? formatDate(data.player.dob, PLAYER_BIRTHDAY_FORMAT)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h5 className="font-barlow-condensed text-base text-[rgba(255,255,255,0.7)]">
                  Lugar de origen
                </h5>
                <p className="text-[18px] text-white">
                  {data.player.nationality || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
          <div className="container">
            <div className="flex flex-row justify-between items-center mb-[30px]">
              <div>
                <h3 className="text-[22px] text-black md:text-[24px]">
                  Estadísticas
                </h3>
              </div>
              <div>
                <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">
                  Temporada 2026 • Regular
                </p>
              </div>
            </div>
            <div className="mb-6 md:mb-10 lg:mb-15">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2">
                        <span className="text-[13px] text-[rgba(0,0,0,0.6)]">
                          JUGADOR
                        </span>
                      </th>
                      {STATS_HEADER.map((item) => (
                        <th
                          key={`header-${item.key}`}
                          className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]"
                        >
                          <span className="text-[13px] text-[rgba(0,0,0,0.6)]">
                            {item.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2">
                        <div className="flex flex-row items-center gap-3">
                          <span className="text-base text-black">
                            {data.player.name}
                          </span>
                          <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                            {data.player.playingPosition}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.games ?? 0).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.minutes ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.points ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.fieldGoalsMadeAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.fieldGoalsAttemptedAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.fieldGoalsPercentage ?? 0,
                          ).format('0.0%')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.threePointersMadeAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.threePointersAttemptedAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.threePointersPercentage ?? 0,
                          ).format('0.0%')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.freeThrowsMadeAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.freeThrowsAttemptedAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.freeThrowsPercentage ?? 0,
                          ).format('0.0%')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.offensiveReboundsAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.defensiveReboundsAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.reboundsTotalAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.assistsAvg ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.turnoversAvg ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.stealsAvg ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(data.player.stats?.blocksAvg ?? 0).format(
                            '0.0',
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.foulsPersonalAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-barlow text-[13px]">
                          {numeral(
                            data.player.stats?.plusMinusPointsAvg ?? 0,
                          ).format('0.0')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FullWidthLayout>
  );
}
