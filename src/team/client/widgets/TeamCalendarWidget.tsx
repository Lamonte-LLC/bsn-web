'use client';

import ScheduledMatchCardInline from '@/match/components/calendar/ScheduledMatchCardInline';
import { useUpcomingCalendarConnection } from '../hooks/teams';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { DEFAULT_MEDIA_PROVIDER } from '@/constants';

type Props = {
  teamCode: string;
};

export default function TeamCalendarWidget({ teamCode }: Props) {
  const {data, loading} = useUpcomingCalendarConnection(teamCode);

  if (loading) {
    return (
      <div className="space-y-4">
        <ShimmerLine height="76px" />
        <ShimmerLine height="76px" />
        <ShimmerLine height="76px" />
        <ShimmerLine height="76px" />
        <ShimmerLine height="76px" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 lg:pr-16">
        <div className="flex flex-col gap-6">
          {data?.edges.map(({ node }) => (
            <ScheduledMatchCardInline
              key={`upcoming-calendar-${node.providerId}`}
              startAt={node.startAt}
              homeTeam={{
                code: node.homeTeam.code,
                nickname: node.homeTeam.nickname,
                city: node.homeTeam.city,
                ticketUrl: node.homeTeam.ticketUrl || '',
                competitionStandings: {
                  won: node.homeTeam.competitionStandings?.won ?? 0,
                  lost: node.homeTeam.competitionStandings?.lost ?? 0,
                },
              }}
              visitorTeam={{
                code: node.visitorTeam.code,
                nickname: node.visitorTeam.nickname,
                city: node.visitorTeam.city,
                ticketUrl: node.visitorTeam.ticketUrl || '',
                competitionStandings: {
                  won: node.visitorTeam.competitionStandings?.won ?? 0,
                  lost: node.visitorTeam.competitionStandings?.lost ?? 0,
                },
              }}
              contextTeam={{
                code: teamCode,
              }}
              providerId={node.providerId}
              mediaProvider={node.channel || DEFAULT_MEDIA_PROVIDER}
            />
          ))}
          {data?.edges.length === 0 && (
            <div>
              <span className="text-[rgba(0,0,0,0.6)]">
                No se han encontrado partidos próximos para este equipo.
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-4"></div>
    </div>
  );
}
