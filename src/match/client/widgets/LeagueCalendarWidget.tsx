'use client';

import moment from 'moment';
import { useMemo, useState } from 'react';

import CalendarSidebar from '@/match/client/components/calendar/CalendarSidebar';
import CalendarFinishedMatchRow from '@/match/components/calendar/CalendarFinishedMatchRow';
import CalendarLiveMatchRow from '@/match/components/calendar/CalendarLiveMatchRow';
import ScheduledMatchCardInline from '@/match/components/calendar/ScheduledMatchCardInline';
import { useRecentCalendar } from '@/match/client/hooks/matches';
import {
  filterLeagueCalendarMatches,
  isCalendarFinishedMatch,
  isCalendarLiveMatch,
} from '@/match/client/utils/calendarView';
import {
  DEFAULT_MEDIA_PROVIDER,
  MATCH_DATE_FULL_FORMAT,
} from '@/constants';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { formatDate } from '@/utils/date-formatter';

export default function LeagueCalendarWidget() {
  const { data, loading, ensureDateRangeLoaded } = useRecentCalendar({
    daysBefore: 21,
    daysAfter: 45,
  });

  const calendarMatches = useMemo(
    () => filterLeagueCalendarMatches(data),
    [data],
  );

  const initialStart = useMemo(() => {
    const today = moment().startOf('day');
    if (calendarMatches.length === 0) return today;

    const upcomingDates = calendarMatches
      .map((m) => moment(m.startAt).startOf('day'))
      .filter((d) => d.isSameOrAfter(today));

    if (upcomingDates.length > 0) {
      return upcomingDates[0];
    }

    return moment(
      calendarMatches[calendarMatches.length - 1].startAt,
    ).startOf('day');
  }, [calendarMatches]);

  const [startDate, setStartDate] = useState<moment.Moment>(initialStart);
  const [weeksShown, setWeeksShown] = useState(1);

  const endDate = useMemo(
    () => startDate.clone().add(weeksShown * 7 - 1, 'days'),
    [startDate, weeksShown],
  );

  const visibleMatches = calendarMatches.filter((match) => {
    const day = moment(match.startAt).startOf('day');
    return day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate);
  });

  const loadRangeForStart = async (newStart: moment.Moment) => {
    const rangeEnd = newStart.clone().add(weeksShown * 7 - 1, 'days');
    await ensureDateRangeLoaded(
      newStart.format('YYYY-MM-DD'),
      rangeEnd.format('YYYY-MM-DD'),
    );
  };

  const handlePrevWeek = async () => {
    const newStart = startDate.clone().subtract(7, 'days');
    await loadRangeForStart(newStart);
    setStartDate(newStart);
  };

  const handleNextWeek = async () => {
    const newStart = startDate.clone().add(7, 'days');
    await loadRangeForStart(newStart);
    setStartDate(newStart);
  };

  const handleLoadMore = () => {
    setWeeksShown((w) => w + 1);
  };

  const handleSelectDate = async (date: moment.Moment) => {
    const d = date.clone().startOf('day');
    await loadRangeForStart(d);
    setStartDate(d);
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
              onClick={() => void handlePrevWeek()}
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
              onClick={() => void handleNextWeek()}
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
          {loading && calendarMatches.length === 0 && (
            <div className="space-y-4">
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
              <ShimmerLine height="76px" />
            </div>
          )}
          {!loading &&
            visibleMatches.map((match) => {
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
                  {isCalendarFinishedMatch(match.status) ? (
                    <CalendarFinishedMatchRow
                      providerId={match.providerId}
                      startAt={match.startAt}
                      homeTeam={{
                        code: match.homeTeam.code,
                        nickname: match.homeTeam.nickname,
                        city: match.homeTeam.city,
                        score: match.homeTeam.score ?? '0',
                        competitionStandings: match.homeTeam.competitionStandings,
                      }}
                      visitorTeam={{
                        code: match.visitorTeam.code,
                        nickname: match.visitorTeam.nickname,
                        city: match.visitorTeam.city,
                        score: match.visitorTeam.score ?? '0',
                        competitionStandings: match.visitorTeam.competitionStandings,
                      }}
                      overtimePeriods={match.overtimePeriods}
                    />
                  ) : isCalendarLiveMatch(match.status) ? (
                    <CalendarLiveMatchRow
                      providerId={match.providerId}
                      status={match.status}
                      currentQuarter={match.currentPeriod}
                      currentTime={match.currentTime}
                      overtimePeriods={match.overtimePeriods}
                      homeTeam={{
                        code: match.homeTeam.code,
                        nickname: match.homeTeam.nickname,
                        city: match.homeTeam.city,
                        score: match.homeTeam.score ?? '0',
                        competitionStandings: match.homeTeam.competitionStandings,
                      }}
                      visitorTeam={{
                        code: match.visitorTeam.code,
                        nickname: match.visitorTeam.nickname,
                        city: match.visitorTeam.city,
                        score: match.visitorTeam.score ?? '0',
                        competitionStandings: match.visitorTeam.competitionStandings,
                      }}
                      contextTeamCode={match.homeTeam.code}
                    />
                  ) : (
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
                  )}
                </div>
              );
            })}
          {!loading && visibleMatches.length === 0 && (
            <div className="py-[40px] text-center">
              <span className="text-[15px] text-[rgba(0,0,0,0.6)]">
                No hay juegos en este periodo.
              </span>
            </div>
          )}
        </div>
        {!loading &&
          visibleMatches.length > 0 &&
          visibleMatches.length < calendarMatches.length && (
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
            onSelectDate={(d) => void handleSelectDate(d)}
            showFullCalendarLink={false}
          />
        </div>
      </div>
    </div>
  );
}
