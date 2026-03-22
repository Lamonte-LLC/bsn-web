'use client';

import { DEFAULT_MEDIA_PROVIDER, MATCH_STATUS } from '@/constants';
import { MatchType } from '@/match/types';
import RecentCalendarSlider from '@/match/client/components/slider/RecentCalendarSlider';
import { useMemo } from 'react';
import moment from 'moment';
import LiveMatchCard from '../components/card/LiveMatchCard';
import CompletedMatchCard from '../components/card/CompletedMatchCard';
import ScheduledMatchCard from '../components/card/ScheduledMatchCard';
import { useRecentCalendar } from '../hooks/matches';
import RecentCalendarDateItem from '../components/slider/RecentCalendarDateItem';

type DateItem = {
  type: 'date-item';
  date: string;
  id: string;
};

type MatchItem = {
  type: 'match';
  data: MatchType;
};

type SliderItem = DateItem | MatchItem;

/** Misma lógica que el render: partido que no es final ni programado → tarjeta “en vivo”. */
function isLiveStyleMatch(status: string | undefined): boolean {
  return ![
    MATCH_STATUS.COMPLETE,
    MATCH_STATUS.FINISHED,
    MATCH_STATUS.SCHEDULED,
  ].includes(status ?? '');
}

export default function RecentCalendarSliderWidget() {
  const { data, loading } = useRecentCalendar({
    daysBefore: 14,
    daysAfter: 21,
  });

  const today = useMemo(() => moment().startOf('day'), []);

  const sortedMatches = useMemo(() => {
    // Orden cronológico por fecha/hora (el “en vivo” no se antepone al resto de días)
    const sorted = data.slice().sort((a: MatchType, b: MatchType) => {
      return moment(a.startAt).diff(moment(b.startAt));
    });

    // Agrupar por día y crear items con headers de fecha
    const groupedItems: SliderItem[] = [];
    let lastDate = '';

    sorted.forEach((match) => {
      const matchDate = moment(match.startAt).format('YYYY-MM-DD');

      // Si es un nuevo día, agregar un header de fecha
      if (matchDate !== lastDate) {
        groupedItems.push({
          type: 'date-item',
          date: match.startAt,
          id: `date-${matchDate}`,
        });
        lastDate = matchDate;
      }

      // Agregar el partido
      groupedItems.push({
        type: 'match',
        data: match,
      });
    });

    return groupedItems;
  }, [data]);

  // Si hay un partido “en vivo”, colocar el slider al inicio de ese día (cabecera + partidos del día).
  // Si no, la cabecera de fecha más cercana a hoy.
  const initialSlide = useMemo(() => {
    const firstLiveIdx = sortedMatches.findIndex(
      (item) =>
        item.type === 'match' && isLiveStyleMatch(item.data.status),
    );

    if (firstLiveIdx >= 0) {
      const matchItem = sortedMatches[firstLiveIdx] as MatchItem;
      const day = moment(matchItem.data.startAt).format('YYYY-MM-DD');
      for (let i = firstLiveIdx; i >= 0; i--) {
        const it = sortedMatches[i];
        if (it.type === 'date-item') {
          const d = moment(it.date).format('YYYY-MM-DD');
          if (d === day) {
            return i;
          }
        }
      }
      return firstLiveIdx;
    }

    let closestIdx = 0;
    let closestDiff = Infinity;
    sortedMatches.forEach((item, idx) => {
      if (item.type === 'date-item') {
        const diff = Math.abs(moment(item.date).diff(today, 'days'));
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIdx = idx;
        }
      }
    });
    return closestIdx;
  }, [sortedMatches, today]);

  if (loading) {
    return (
      <div className="flex h-[180px] items-center justify-center text-center">
        <p className="font-barlow text-sm text-[rgba(255,255,255,0.8)] md:text-base">
          Cargando partidos...
        </p>
      </div>
    );
  }

  return (
    <>
      <RecentCalendarSlider
        data={sortedMatches}
        initialSlide={initialSlide}
        render={(item: SliderItem) => {
          // Renderizar header de fecha
          if (item.type === 'date-item') {
            return (
              <div key={item.id} className="px-[5px]">
                <RecentCalendarDateItem date={item.date} />
              </div>
            );
          }

          // Renderizar partido
          const match = item.data;
          return (
            <div key={`match-${match.providerId}`} className="px-[5px]">
              {![
                MATCH_STATUS.COMPLETE,
                MATCH_STATUS.FINISHED,
                MATCH_STATUS.SCHEDULED,
              ].includes(match.status ?? '') && (
                <LiveMatchCard
                  matchProviderId={match.providerId}
                  homeTeam={match.homeTeam}
                  visitorTeam={match.visitorTeam}
                  currentQuarter={match.currentPeriod}
                  currentTime={match.currentTime}
                  mediaProvider={match.channel || DEFAULT_MEDIA_PROVIDER}
                  status={match.status}
                  overtimePeriods={match.overtimePeriods}
                  isFinals={match.isFinals}
                  finalsDescription={match.finalsDescription}
                />
              )}
              {[MATCH_STATUS.COMPLETE, MATCH_STATUS.FINISHED].includes(
                match.status,
              ) && (
                <CompletedMatchCard
                  matchProviderId={match.providerId}
                  startAt={match.startAt}
                  homeTeam={match.homeTeam}
                  visitorTeam={match.visitorTeam}
                  overtimePeriods={match.overtimePeriods}
                  isFinals={match.isFinals}
                  finalsDescription={match.finalsDescription}
                />
              )}
              {[MATCH_STATUS.SCHEDULED].includes(match.status) && (
                <ScheduledMatchCard
                  matchProviderId={match.providerId}
                  startAt={match.startAt}
                  homeTeam={match.homeTeam}
                  visitorTeam={match.visitorTeam}
                  mediaProvider={match.channel || DEFAULT_MEDIA_PROVIDER}
                  ticketUrl={match.homeTeam.ticketUrl}
                  isFinals={match.isFinals}
                  finalsDescription={match.finalsDescription}
                />
              )}
            </div>
          );
        }}
      />
    </>
  );
}
