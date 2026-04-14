import { useEffect } from 'react';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { useMatchTeamsBoxscore } from '../hooks/matches';
import numeral from 'numeral';

type Props = {
  matchProviderId: string;
};

export default function MatchTeamStatsComparisonWidget({
  matchProviderId,
}: Props) {
  const { data, loading, stopPolling } = useMatchTeamsBoxscore(
    matchProviderId,
    true,
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  if (loading) {
    return null;
  }

  return (
    <div>
      <div>
        <h3 className="text-center text-[22px] text-black md:text-[24px]">
          Estadísticas de equipos
        </h3>
      </div>
      <div className="flex flex-row justify-between items-center gap-2 py-3">
        <div className="flex flex-row justify-center w-[80px]">
          <TeamLogoAvatar
            teamCode={data?.visitorTeam.code ?? 'ZZZ'}
            size={40}
          />
        </div>
        <div className="grow"></div>
        <div className="flex flex-row justify-center w-[80px]">
          <TeamLogoAvatar teamCode={data?.homeTeam.code ?? 'ZZZ'} size={40} />
        </div>
      </div>
      <div className="py-[24px]">
        <div className="divide-y divide-[rgba(0,0,0,0.07)]">
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.fieldGoalsMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.visitorTeamBoxscore?.fieldGoalsAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                FG
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.fieldGoalsMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.homeTeamBoxscore?.fieldGoalsAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.twoPointersPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(
                  data?.visitorTeamBoxscore?.twoPointersMade ?? 0,
                ).format('0')}
                /
                {numeral(
                  data?.visitorTeamBoxscore?.twoPointersAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                2P
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.twoPointersPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.twoPointersMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.homeTeamBoxscore?.twoPointersAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.homeTeamBoxscore?.twoPointersPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.threePointersPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.threePointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(
                  data?.visitorTeamBoxscore?.threePointersMade ?? 0,
                ).format('0')}
                /
                {numeral(
                  data?.visitorTeamBoxscore?.threePointersAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.visitorTeamBoxscore?.threePointersPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                3P
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.threePointersPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.threePointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.threePointersMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.homeTeamBoxscore?.threePointersAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.homeTeamBoxscore?.threePointersPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.freeThrowsMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.visitorTeamBoxscore?.freeThrowsAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                FT
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.freeThrowsMade ?? 0).format(
                  '0',
                )}
                /
                {numeral(
                  data?.homeTeamBoxscore?.freeThrowsAttempted ?? 0,
                ).format('0')}{' '}
                (
                {numeral(
                  data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0,
                ).format('0.0%')}
                )
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.points ?? 0) <
                    (data?.visitorTeamBoxscore?.points ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.points ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                PTS
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.points ?? 0) >
                    (data?.visitorTeamBoxscore?.points ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.points ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.reboundsTotal ?? 0) <
                    (data?.visitorTeamBoxscore?.reboundsTotal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.reboundsTotal ?? 0).format(
                  '0',
                )}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                REB
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.reboundsTotal ?? 0) >
                    (data?.visitorTeamBoxscore?.reboundsTotal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.reboundsTotal ?? 0).format(
                  '0',
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.assists ?? 0) <
                    (data?.visitorTeamBoxscore?.assists ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.assists ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                AST
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.assists ?? 0) >
                    (data?.visitorTeamBoxscore?.assists ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.assists ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.steals ?? 0) <
                    (data?.visitorTeamBoxscore?.steals ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.steals ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                STL
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.steals ?? 0) >
                    (data?.visitorTeamBoxscore?.steals ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.steals ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.blocks ?? 0) <
                    (data?.visitorTeamBoxscore?.blocks ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.blocks ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                BLK
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.blocks ?? 0) >
                    (data?.visitorTeamBoxscore?.blocks ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.blocks ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.turnovers ?? 0) <
                    (data?.visitorTeamBoxscore?.turnovers ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.turnovers ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                TO
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.turnovers ?? 0) >
                    (data?.visitorTeamBoxscore?.turnovers ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.turnovers ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.foulsPersonal ?? 0) <
                    (data?.visitorTeamBoxscore?.foulsPersonal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.foulsPersonal ?? 0).format(
                  '0',
                )}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                PF
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[18px] md:text-[23px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.foulsPersonal ?? 0) >
                    (data?.visitorTeamBoxscore?.foulsPersonal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.foulsPersonal ?? 0).format(
                  '0',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A]">
        <div className="px-[30px] py-[24px]">
          <div className="flex flex-col justify-between items-start md:flex-row md:gap-4">
            <div className="flex-1">
              <ul>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    FG
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Tiros de campo
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    2P
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Tiros de dos puntos
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    3P
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Tiros de tres puntos
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    FT
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Tiros libres
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    REB
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Rebotes
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <ul>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    AST
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Asistencias
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    STL
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Robos
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    BLK
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Bloqueos
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    TO
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Pérdidas de balón
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    PF
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Faltas personales
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <ul>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    PIP
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Puntos en la pintura
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    2CP
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Puntos de 2da oportunidad
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    PFT
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Puntos tras pérdidas{' '}
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    BP
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Puntos del banco
                  </span>
                </li>
                <li>
                  <span className="inline-block font-barlow font-semibold text-[13px] text-black text-right mr-[10px] w-[30px]">
                    FBP
                  </span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    Puntos de contraataque
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
