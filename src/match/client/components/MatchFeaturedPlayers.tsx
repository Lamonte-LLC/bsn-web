import SeasonTeamPlayerLeadersCard from '@/stats/components/season/leader/team/SeasonTeamPlayerLeadersCard';
import { useState } from 'react';

type LeadersCategoryStatsType = {
  player: {
    providerId: string;
    avatarUrl: string;
    name: string;
  };
  value: number;
};

type Props = {
  homeTeam: { code: string };
  visitorTeam: { code: string };
  homeTeamPointsLeaders: LeadersCategoryStatsType[];
  homeTeamAssistsLeaders: LeadersCategoryStatsType[];
  homeTeamReboundsLeaders: LeadersCategoryStatsType[];
  visitorTeamPointsLeaders: LeadersCategoryStatsType[];
  visitorTeamAssistsLeaders: LeadersCategoryStatsType[];
  visitorTeamReboundsLeaders: LeadersCategoryStatsType[];
};

const TABS = [
  { key: 'points', label: 'Puntos' },
  { key: 'rebounds', label: 'Rebotes' },
  { key: 'assists', label: 'Asistencias' },
];

export default function MatchFeaturedPlayers({
  homeTeam,
  visitorTeam,
  homeTeamPointsLeaders,
  homeTeamAssistsLeaders,
  homeTeamReboundsLeaders,
  visitorTeamPointsLeaders,
  visitorTeamAssistsLeaders,
  visitorTeamReboundsLeaders,
}: Props) {
  const [tab, setTab] = useState('points');
  return (
    <div>
      <div className="mb-[30px] flex flex-col gap-[12px] md:flex-row md:items-center md:justify-between">
        <h3 className="text-[22px] text-black md:text-[24px]">
          Jugadores destacados
        </h3>
        <div className="flex flex-row gap-[8px]">
          {TABS.map((tabItem) => (
            <button
              key={`match-featured-players-${tabItem.key}`}
              onClick={() => setTab(tabItem.key)}
              className="border cursor-pointer rounded-[100px] px-[20px] py-[5px] text-[15px]"
              style={{
                backgroundColor: tab === tabItem.key ? '#0F171F' : '#ffffff',
                color: tab === tabItem.key ? '#FFFFFF' : 'rgba(0, 0, 0, 0.65)',
                borderColor:
                  tab === tabItem.key ? '#0F171F' : 'rgba(213, 213, 213, 1)',
              }}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'points' && (
        <div className="grid grid-cols-1 gap-[20px] mb-[30px] md:grid-cols-2">
          <SeasonTeamPlayerLeadersCard
            title="Puntos por juego"
            teamCode={visitorTeam.code}
            data={visitorTeamPointsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
          <SeasonTeamPlayerLeadersCard
            title="Puntos por juego"
            teamCode={homeTeam.code}
            data={homeTeamPointsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
        </div>
      )}
      {tab === 'rebounds' && (
        <div className="grid grid-cols-1 gap-[20px] mb-[30px] md:grid-cols-2">
          <SeasonTeamPlayerLeadersCard
            title="Rebotes por juego"
            teamCode={visitorTeam.code}
            data={visitorTeamReboundsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
          <SeasonTeamPlayerLeadersCard
            title="Rebotes por juego"
            teamCode={homeTeam.code}
            data={homeTeamReboundsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
        </div>
      )}
      {tab === 'assists' && (
        <div className="grid grid-cols-1 gap-[20px] mb-[30px] md:grid-cols-2">
          <SeasonTeamPlayerLeadersCard
            title="Asistencias por juego"
            teamCode={visitorTeam.code}
            data={visitorTeamAssistsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
          <SeasonTeamPlayerLeadersCard
            title="Asistencias por juego"
            teamCode={homeTeam.code}
            data={homeTeamAssistsLeaders.map((leader, index) => ({
              position: index + 1,
              player: {
                id: leader.player.providerId,
                avatarUrl: leader.player.avatarUrl,
                name: leader.player.name,
              },
              statValue: leader.value,
            }))}
          />
        </div>
      )}
    </div>
  );
}
