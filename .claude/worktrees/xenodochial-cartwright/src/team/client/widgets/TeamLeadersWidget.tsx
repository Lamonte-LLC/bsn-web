'use client';

import { SEASON_TEAM_LEADERS_DISPLAY_TOP } from '@/constants';
import MatchPlayerLeadersCard from '@/stats/components/season/leader/player/MatchPlayerLeadersCard';
import { useTeamLeadersConnection } from '../hooks/teams';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';

type Props = {
  teamCode: string;
};

export default function TeamLeadersWidget({ teamCode }: Props) {
  const { data, loading } = useTeamLeadersConnection(teamCode);
  const top = SEASON_TEAM_LEADERS_DISPLAY_TOP;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ShimmerLine height="226px" />
        <ShimmerLine height="226px" />
        <ShimmerLine height="226px" />
        <ShimmerLine height="226px" />
        <ShimmerLine height="226px" />
        <ShimmerLine height="226px" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MatchPlayerLeadersCard
        title="Puntos por juego"
        subtitle="PPG"
        data={data.pointsLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
      <MatchPlayerLeadersCard
        title="Rebotes por juego"
        subtitle="RPG"
        data={data.reboundsLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
      <MatchPlayerLeadersCard
        title="Asistencias por juego"
        subtitle="APG"
        data={data.assistsLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
      <MatchPlayerLeadersCard
        title="Tapones por juego"
        subtitle="BPG"
        data={data.blocksLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
      <MatchPlayerLeadersCard
        title="Robos por juego"
        subtitle="SPG"
        data={data.stealsLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
      <MatchPlayerLeadersCard
        title="% Tiros de campo"
        subtitle="FG%"
        data={data.fieldGoalsLeaders.edges.slice(0, top).map(({ node }, index) => ({
          position: index + 1,
          player: {
            id: node.player.providerId,
            avatarUrl: node.player.avatarUrl || '',
            name: node.player.name,
            team: {
              code: teamCode,
              name: '',
            },
          },
          statValue: node.value,
        }))}
      />
    </div>
  );
}
