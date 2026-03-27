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
        <h3 className="text-[22px] text-black md:text-[24px]">
          Estadísticas de equipos
        </h3>
      </div>
      <div className="flex flex-row justify-between items-center gap-2 py-3">
        <div className="w-[80px]">
          <TeamLogoAvatar
            teamCode={data?.visitorTeam.code ?? 'ZZZ'}
            size={40}
          />
        </div>
        <div className="grow"></div>
        <div className="w-[80px]">
          <TeamLogoAvatar teamCode={data?.homeTeam.code ?? 'ZZZ'} size={40} />
        </div>
      </div>
      <div className="px-[30px] py-[24px]">
        <div className="divide-y divide-[rgba(0,0,0,0.07)]">
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.fieldGoalsMade ?? 0).format('0')}/
                {numeral(data?.visitorTeamBoxscore?.fieldGoalsAttempted ?? 0).format('0')} ({numeral(data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0).format('0.0%')})
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                FG
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.fieldGoalsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.fieldGoalsMade ?? 0).format('0')}/
                {numeral(data?.homeTeamBoxscore?.fieldGoalsAttempted ?? 0).format('0')} ({numeral(data?.homeTeamBoxscore?.fieldGoalsPercentage ?? 0).format('0.0%')})
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.twoPointersPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.twoPointersMade ?? 0).format('0')}/
                {numeral(data?.visitorTeamBoxscore?.twoPointersAttempted ?? 0).format('0')} ({numeral(data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0).format('0.0%')})
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                2P
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.twoPointersPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.twoPointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.twoPointersMade ?? 0).format('0')}/
                {numeral(data?.homeTeamBoxscore?.twoPointersAttempted ?? 0).format('0')} ({numeral(data?.homeTeamBoxscore?.twoPointersPercentage ?? 0).format('0.0%')})
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.threePointersPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.threePointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.threePointersMade ?? 0).format('0')}/
                {numeral(data?.visitorTeamBoxscore?.threePointersAttempted ?? 0).format('0')} ({numeral(data?.visitorTeamBoxscore?.threePointersPercentage ?? 0).format('0.0%')})
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                3P
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.threePointersPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.threePointersPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.threePointersMade ?? 0).format('0')}/
                {numeral(data?.homeTeamBoxscore?.threePointersAttempted ?? 0).format('0')} ({numeral(data?.homeTeamBoxscore?.threePointersPercentage ?? 0).format('0.0%')})
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0) <
                    (data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.freeThrowsMade ?? 0).format('0')}/
                {numeral(data?.visitorTeamBoxscore?.freeThrowsAttempted ?? 0).format('0')} ({numeral(data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0).format('0.0%')})
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                FT
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0) >
                    (data?.visitorTeamBoxscore?.freeThrowsPercentage ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.freeThrowsMade ?? 0).format('0')}/
                {numeral(data?.homeTeamBoxscore?.freeThrowsAttempted ?? 0).format('0')} ({numeral(data?.homeTeamBoxscore?.freeThrowsPercentage ?? 0).format('0.0%')})
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.reboundsTotal ?? 0) <
                    (data?.visitorTeamBoxscore?.reboundsTotal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.reboundsTotal ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                REB
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.reboundsTotal ?? 0) >
                    (data?.visitorTeamBoxscore?.reboundsTotal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.reboundsTotal ?? 0).format('0')}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
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
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.foulsPersonal ?? 0) <
                    (data?.visitorTeamBoxscore?.foulsPersonal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.visitorTeamBoxscore?.foulsPersonal ?? 0).format('0')}
              </p>
            </div>
            <div className="grow">
              <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                PF
              </p>
            </div>
            <div className="w-[80px]">
              <p
                className="text-center text-[19px]"
                style={{
                  color:
                    (data?.homeTeamBoxscore?.foulsPersonal ?? 0) >
                    (data?.visitorTeamBoxscore?.foulsPersonal ?? 0)
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {numeral(data?.homeTeamBoxscore?.foulsPersonal ?? 0).format('0')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A]">
        <div className="px-[30px] py-[24px]">
          <div className="flex flex-row">
            <div>
              <dl>
                <dt>FG</dt>
                <dd>Tiros de campo</dd>
                <dt>2P</dt>
                <dd>Tiros de dos puntos</dd>
                <dt>3P</dt>
                <dd>Tiros de tres puntos</dd>
                <dt>FT</dt>
                <dd>Tiros libres</dd>
                <dt>REB</dt>
                <dd>Rebotes</dd>
              </dl>
            </div>
            <div>
              <dl>
                <dt>AST</dt>
                <dd>Asistencias</dd>
                <dt>STL</dt>
                <dd>Robos</dd>
                <dt>BLK</dt>
                <dd>Bloqueos</dd>
                <dt>TO</dt>
                <dd>Pérdidas de balón</dd>
                <dt>PF</dt>
                <dd>Faltas personales</dd>
              </dl>
            </div>
            <div>
              <dl>
                <dt>PIP</dt>
                <dd>Puntos en la pintura</dd>
                <dt>2CP</dt>
                <dd>Puntos de 2da oportunidad</dd>
                <dt>PFT</dt>
                <dd>Puntos tras pérdidas </dd>
                <dt>BP</dt>
                <dd>Puntos del banco</dd>
                <dt>FBP</dt>
                <dd>Puntos de contraataque</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
