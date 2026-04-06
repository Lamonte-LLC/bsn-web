'use client';

/**
 * Bloque reutilizable “Líderes del juego”: consume filas al estilo boxscore por jugador
 * (puntos, rebotes, etc.) para partidos en vivo o finalizados. Evita duplicar seis tarjetas
 * entre `LiveMatchPage` y `CompletedMatchPage`.
 */
import MatchPlayerLeadersCard from '@/stats/components/season/leader/player/MatchPlayerLeadersCard';

export type MatchGameLeaderPlayerBoxScore = {
  player: {
    providerId: string;
    name: string;
    avatarUrl?: string | null;
    teamCode?: string;
    team?: {
      code: string;
      name: string;
    };
  };
  boxscore: {
    points: number;
    reboundsTotal: number;
    assists: number;
    steals: number;
    blocks: number;
    threePointersMade: number;
  };
};

type Props = {
  pointsLeaders?: MatchGameLeaderPlayerBoxScore[];
  reboundsLeaders?: MatchGameLeaderPlayerBoxScore[];
  assistsLeaders?: MatchGameLeaderPlayerBoxScore[];
  stealsLeaders?: MatchGameLeaderPlayerBoxScore[];
  blocksLeaders?: MatchGameLeaderPlayerBoxScore[];
  threePointersMadeLeaders?: MatchGameLeaderPlayerBoxScore[];
};

export default function MatchGameLeadersSection({
  pointsLeaders = [],
  reboundsLeaders = [],
  assistsLeaders = [],
  stealsLeaders = [],
  blocksLeaders = [],
  threePointersMadeLeaders = [],
}: Props) {
  return (
    <div className="mb-6 md:mb-10 lg:mb-15">
      <div className="flex flex-row justify-between items-center mb-6 md:mb-[28px]">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">Líderes del juego</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MatchPlayerLeadersCard
          title="Puntos"
          data={pointsLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.points,
          }))}
        />
        <MatchPlayerLeadersCard
          title="Rebotes"
          data={reboundsLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.reboundsTotal,
          }))}
        />
        <MatchPlayerLeadersCard
          title="Asistencias"
          data={assistsLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.assists,
          }))}
        />
        <MatchPlayerLeadersCard
          title="Robos"
          data={stealsLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.steals,
          }))}
        />
        <MatchPlayerLeadersCard
          title="Tapones"
          data={blocksLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.blocks,
          }))}
        />
        <MatchPlayerLeadersCard
          title="3PTM"
          data={threePointersMadeLeaders.map((leader, index) => ({
            position: index + 1,
            player: {
              id: leader.player.providerId,
              avatarUrl: leader.player.avatarUrl ?? '',
              name: leader.player.name,
              team: {
                code: leader.player.teamCode ?? '',
                name: leader.player.teamCode ?? '',
              },
            },
            statValue: leader.boxscore.threePointersMade,
          }))}
        />
      </div>
    </div>
  );
}
