'use client';

import moment from 'moment';
import { useMemo, useState } from 'react';

import CalendarSidebar from '@/match/client/components/calendar/CalendarSidebar';
import ScheduledMatchCardInline from '@/match/components/calendar/ScheduledMatchCardInline';
import { useRecentCalendar } from '@/match/client/hooks/matches';
import {
  DEFAULT_MEDIA_PROVIDER,
  MATCH_DATE_FULL_FORMAT,
  MATCH_STATUS,
} from '@/constants';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { formatDate } from '@/utils/date-formatter';

export default function LeagueCalendarWidget() {
  const { data, loading } = useRecentCalendar({
    daysBefore: 21,
    daysAfter: 45,
  });

  const allScheduled = useMemo(
    () =>
      data
        .filter((match) =>
          [MATCH_STATUS.SCHEDULED, MATCH_STATUS.RESCHEDULED].includes(
            match.status ?? '',
          ),
        )
        .sort((a, b) => moment(a.startAt).diff(moment(b.startAt))),
    [data],
  );

  const initialStart = useMemo(() => {
    const today = moment().startOf('day');
    if (allScheduled.length === 0) return today;

    const upcomingDates = allScheduled
      .map((m) => moment(m.startAt).startOf('day'))
      .filter((d) => d.isSameOrAfter(today));

    if (upcomingDates.length > 0) {
      return upcomingDates[0];
    }

    // Si no hay juegos futuros, usa la fecha del último partido
    return moment(allScheduled[allScheduled.length - 1].startAt).startOf('day');
  }, [allScheduled]);

  const [startDate, setStartDate] = useState<moment.Moment>(initialStart);
  const [weeksShown, setWeeksShown] = useState(1);

  const endDate = useMemo(
    () => startDate.clone().add(weeksShown * 7 - 1, 'days'),
    [startDate, weeksShown],
  );

  const upcomingMatches = allScheduled.filter((match) => {
    const day = moment(match.startAt).startOf('day');
    return day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate);
  });
  const handlePrevWeek = () => {
    setStartDate((d) => d.clone().subtract(7, 'days'));
  };

  const handleNextWeek = () => {
    setStartDate((d) => d.clone().add(7, 'days'));
  };

  const handleLoadMore = () => {
    setWeeksShown((w) => w + 1);
  };

  const handleSelectDate = (date: moment.Moment) => {
    setStartDate(date.clone().startOf('day'));
    setWeeksShown(1);
  };

  let lastDateKey = '';

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-8 lg:pr-16">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="hidden text-2xl font-normal leading-none text-black md:block">
            Calendario de juegos
          </h3>
          <div className="flex items-center gap-6 self-center md:self-auto">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="font-barlow flex items-center gap-1.5 text-[14px] font-normal leading-normal tracking-[-0.14px] text-[rgba(15,23,31,0.9)]"
            >
              <img
                src="/assets/images/icons/calendar/calendar-left.svg"
                alt=""
                className="h-6 w-6"
              />
              <span>Semana anterior</span>
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="font-barlow flex items-center gap-1.5 text-[14px] font-normal leading-normal tracking-[-0.14px] text-[rgba(15,23,31,0.9)]"
            >
              <span>Próxima semana</span>
              <img
                src="/assets/images/icons/calendar/calendar-right.svg"
                alt=""
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <hr className="border-0 border-t border-[#E4E4E4]" />
        </div>
        <div className="flex min-h-[460px] flex-col gap-[15px]">
          {loading && allScheduled.length === 0 && (
            <div className="space-y-4">
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
            </div>
          )}
          {!loading &&
            upcomingMatches.map((match) => {
              const dateKey = moment(match.startAt).format('YYYY-MM-DD');
              const showHeader = dateKey !== lastDateKey;
              if (showHeader) {
                lastDateKey = dateKey;
              }

              return (
                <div key={`league-calendar-${match.providerId}`}>
                  {showHeader && (
                    <div className="mb-2 mt-[40px] hidden sm:block md:mt-[50px]">
                      <p className="text-[20px] leading-normal text-black">
                        {formatDate(match.startAt, MATCH_DATE_FULL_FORMAT).toLowerCase()}
                      </p>
                    </div>
                  )}
                  <ScheduledMatchCardInline
                    providerId={match.providerId}
                    startAt={match.startAt}
                    homeTeam={{
                      code: match.homeTeam.code,
                      nickname: match.homeTeam.nickname,
                      city: match.homeTeam.city,
                      ticketUrl: match.homeTeam.ticketUrl || '',
                      competitionStandings: {
                        won: match.homeTeam.competitionStandings?.won ?? 0,
                        lost: match.homeTeam.competitionStandings?.lost ?? 0,
                      },
                    }}
                    visitorTeam={{
                      code: match.visitorTeam.code,
                      nickname: match.visitorTeam.nickname,
                      city: match.visitorTeam.city,
                      ticketUrl: match.visitorTeam.ticketUrl || '',
                      competitionStandings: {
                        won: match.visitorTeam.competitionStandings?.won ?? 0,
                        lost: match.visitorTeam.competitionStandings?.lost ?? 0,
                      },
                    }}
                    contextTeam={{
                      code: match.homeTeam.code,
                    }}
                    mediaProvider={match.channel || DEFAULT_MEDIA_PROVIDER}
                    showDesktopDateHeader={false}
                  />
                </div>
              );
            })}
          {!loading && upcomingMatches.length === 0 && (
            <div className="py-[40px] text-center">
              <span className="text-[15px] text-[rgba(0,0,0,0.6)]">
                Esta semana no hay juegos.
              </span>
            </div>
          )}
        </div>
        {!loading &&
          upcomingMatches.length > 0 &&
          upcomingMatches.length < allScheduled.length && (
            <div className="mt-4 w-full">
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full rounded-[12px] border border-[#d9d3d3] bg-[#fcfcfc] px-6 py-3 text-center text-[16px] font-normal leading-normal tracking-[0.32px] text-black shadow-[0px_1px_2px_0px_rgba(20,24,31,0.05)]"
              >
                Cargar más
              </button>
            </div>
          )}
      </div>
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-4">
          <CalendarSidebar
            selectedDate={startDate}
            onSelectDate={handleSelectDate}
            showFullCalendarLink={false}
          />
        </div>
      </div>
    </div>
  );
}

