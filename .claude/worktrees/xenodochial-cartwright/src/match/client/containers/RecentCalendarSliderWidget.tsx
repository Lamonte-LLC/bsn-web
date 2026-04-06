'use client';

import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import { MatchType } from '@/match/types';
import {
  isCompletedMatchForUi,
  isScheduledMatchPageStatus,
} from '@/match/utils/matchStatus';
import { useLayoutEffect, useMemo, useRef } from 'react';
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

export default function RecentCalendarSliderWidget() {
  /** Home: ventana corta para aligerar getRecentCalendar (hoy ± 5 días). */
  const { data, loading } = useRecentCalendar({
    daysBefore: 5,
    daysAfter: 5,
  });

  const stripRef = useRef<HTMLDivElement>(null);

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

  // Siempre iniciar en hoy o la próxima fecha disponible (no fechas pasadas primero).
  // Si no hay fechas futuras, caer al último día disponible.
  const initialSlide = useMemo(() => {
    const dateItemIndices = sortedMatches
      .map((item, idx) => ({ item, idx }))
      .filter((entry): entry is { item: DateItem; idx: number } => entry.item.type === 'date-item');

    if (dateItemIndices.length === 0) return 0;

    const firstTodayOrFuture = dateItemIndices.find(({ item }) =>
      moment(item.date).startOf('day').isSameOrAfter(today),
    );

    if (firstTodayOrFuture) {
      return firstTodayOrFuture.idx;
    }

    return dateItemIndices[dateItemIndices.length - 1].idx;
  }, [sortedMatches, today]);

  useLayoutEffect(() => {
    const root = stripRef.current;
    if (!root || sortedMatches.length === 0) return;
    const target = root.querySelector(
      `[data-cal-strip-idx="${initialSlide}"]`,
    ) as HTMLElement | null;
    target?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'auto' });
  }, [initialSlide, sortedMatches.length]);

  if (loading) {
    return (
      <div className="flex h-[180px] items-center justify-center text-center">
        <p className="font-barlow text-sm text-[rgba(255,255,255,0.8)] md:text-base">
          Cargando partidos...
        </p>
      </div>
    );
  }

  if (sortedMatches.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-center px-4">
        <p className="font-barlow text-sm text-[rgba(255,255,255,0.8)] md:text-base">
          No hay partidos en esta fecha.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={stripRef}
      className="home-calendar-strip flex w-full flex-nowrap gap-0 overflow-x-auto overflow-y-visible pb-2 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory md:snap-none"
    >
      {sortedMatches.map((item, index) => {
        const key =
          item.type === 'date-item' ? item.id : `match-${item.data.providerId}`;

        if (item.type === 'date-item') {
          return (
            <div
              key={key}
              data-cal-strip-idx={index}
              className="shrink-0 snap-start px-[5px]"
            >
              <RecentCalendarDateItem date={item.date} />
            </div>
          );
        }

        const match = item.data;
        return (
          <div
            key={key}
            data-cal-strip-idx={index}
            className="shrink-0 snap-start px-[5px]"
          >
            {!isCompletedMatchForUi(
              match.status,
              match.providerFixtureStatus,
            ) &&
              !isScheduledMatchPageStatus(
                match.status,
                match.providerFixtureStatus,
              ) && (
                <LiveMatchCard
                  matchProviderId={match.providerId}
                  homeTeam={match.homeTeam}
                  visitorTeam={match.visitorTeam}
                  currentQuarter={match.currentPeriod}
                  currentTime={match.currentTime}
                  mediaProvider={match.channel || DEFAULT_MEDIA_PROVIDER}
                  status={match.status}
                  providerFixtureStatus={match.providerFixtureStatus}
                  overtimePeriods={match.overtimePeriods}
                  isFinals={match.isFinals}
                  finalsDescription={match.finalsDescription}
                />
              )}
            {isCompletedMatchForUi(
              match.status,
              match.providerFixtureStatus,
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
            {isScheduledMatchPageStatus(
              match.status,
              match.providerFixtureStatus,
            ) && (
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
      })}
    </div>
  );
}
