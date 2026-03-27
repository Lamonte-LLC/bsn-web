import {
  RECENT_CALENDAR,
  MATCH_TEAM_PLAYERS_BOXSCORE,
  MATCH,
} from '@/graphql/match';
import { MatchType } from '@/match/types';
import { useQuery } from '@apollo/client/react';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';

type RecentCalendarResponse = {
  matches: MatchType[];
};

type RecentCalendarOptions = {
  usePolling?: boolean;
  daysBefore?: number;
  daysAfter?: number;
};

type CalendarRange = {
  fromDate: string;
  toDate: string;
};

let sharedLoadedRange: CalendarRange | null = null;

const getEarlierDate = (a: string, b: string) =>
  moment(a).isBefore(moment(b)) ? a : b;

const getLaterDate = (a: string, b: string) =>
  moment(a).isAfter(moment(b)) ? a : b;

const mergeRanges = (
  base: CalendarRange,
  extra: CalendarRange | null,
): CalendarRange => {
  if (!extra) return base;

  return {
    fromDate: getEarlierDate(base.fromDate, extra.fromDate),
    toDate: getLaterDate(base.toDate, extra.toDate),
  };
};

const mergeMatches = (prev: MatchType[], next: MatchType[]) => {
  const map = new Map<string, MatchType>();

  [...prev, ...next].forEach((match) => {
    const key =
      match.providerId ||
      `${match.startAt}-${match.homeTeam.code}-${match.visitorTeam.code}`;
    map.set(key, match);
  });

  return Array.from(map.values());
};

export function useRecentCalendar(
  optionsOrPolling: RecentCalendarOptions | boolean = false,
) {
  const options: RecentCalendarOptions =
    typeof optionsOrPolling === 'boolean'
      ? { usePolling: optionsOrPolling }
      : optionsOrPolling;

  const usePolling = options.usePolling ?? false;
  const daysBefore = options.daysBefore ?? 3;
  const daysAfter = options.daysAfter ?? 3;

  const initialRange = useMemo<CalendarRange>(() => {
    const fromDate = moment().subtract(daysBefore, 'days').format('YYYY-MM-DD');
    const toDate = moment().add(daysAfter, 'days').format('YYYY-MM-DD');
    return mergeRanges({ fromDate, toDate }, sharedLoadedRange);
  }, [daysBefore, daysAfter]);

  const [loadedRange, setLoadedRange] = useState<CalendarRange>(initialRange);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Share loaded range between widget instances/routes during the same session.
  sharedLoadedRange = mergeRanges(initialRange, sharedLoadedRange);

  const { data, loading, error, fetchMore } = useQuery<RecentCalendarResponse>(
    RECENT_CALENDAR,
    {
      variables: initialRange,
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      pollInterval: usePolling ? 30 * 1000 : 0,
    },
  );

  if (error) {
    console.error(error);
  }

  const fetchRange = useCallback(
    async (range: CalendarRange) => {
      setIsFetchingMore(true);
      try {
        await fetchMore({
          variables: range,
          updateQuery(prev, { fetchMoreResult }) {
            if (!fetchMoreResult) return prev;
            return {
              matches: mergeMatches(
                prev.matches ?? [],
                fetchMoreResult.matches ?? [],
              ),
            };
          },
        });
      } finally {
        setIsFetchingMore(false);
      }
    },
    [fetchMore],
  );

  const ensureDateRangeLoaded = useCallback(
    async (fromDate: string, toDate: string) => {
      let nextRange = { ...loadedRange };

      if (moment(fromDate).isBefore(moment(loadedRange.fromDate))) {
        await fetchRange({ fromDate, toDate: loadedRange.fromDate });
        nextRange.fromDate = fromDate;
      }

      if (moment(toDate).isAfter(moment(loadedRange.toDate))) {
        await fetchRange({ fromDate: loadedRange.toDate, toDate });
        nextRange.toDate = toDate;
      }

      if (
        nextRange.fromDate !== loadedRange.fromDate ||
        nextRange.toDate !== loadedRange.toDate
      ) {
        setLoadedRange(nextRange);
        sharedLoadedRange = mergeRanges(nextRange, sharedLoadedRange);
      }
    },
    [fetchRange, loadedRange],
  );

  return {
    data: data?.matches ?? [],
    loading,
    error,
    isFetchingMore,
    loadedRange,
    ensureDateRangeLoaded,
  };
}

type MatchTeamPlayersBoxScoreResponse = {
  matchPlayersBoxscore: {
    player: {
      providerId: string;
      name: string;
      nickname: string;
      shirtNumber: string;
      playingPosition: string;
    };
    boxscore: {
      minutes: number;
      points: number;
      reboundsTotal: number;
      assists: number;
      fieldGoalsMade: number;
      fieldGoalsAttempted: number;
      fieldGoalsPercentage: number;
      threePointersMade: number;
      threePointersAttempted: number;
      threePointersPercentage: number;
      freeThrowsMade: number;
      freeThrowsAttempted: number;
      freeThrowsPercentage: number;
      foulsPersonal: number;
      steals: number;
      blocks: number;
      turnovers: number;
      plusMinusPoints: number;
    };
  }[];
};

export function useMatchTeamPlayersBoxscore(
  providerMatchId: string,
  providerTeamId: string,
  usePolling = false,
) {
  const { data, loading, error } = useQuery<MatchTeamPlayersBoxScoreResponse>(
    MATCH_TEAM_PLAYERS_BOXSCORE,
    {
      variables: {
        geniusMatchId: 0,
        geniusTeamId: 0,
        providerMatchId,
        providerTeamId,
      },
      fetchPolicy: 'network-only',
      pollInterval: usePolling ? 15 * 1000 : 0, // 15 seconds in milliseconds
      notifyOnNetworkStatusChange: false,
    },
  );

  if (error) {
    console.error(error);
  }

  return { data: data?.matchPlayersBoxscore ?? [], loading, error };
}

type MatchResponse = {
  match: MatchType;
};

export function useMatch(matchProviderId: string, usePoll = false) {
  const { data, loading, error } = useQuery<MatchResponse>(MATCH, {
    variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
    fetchPolicy: 'network-only',
    pollInterval: usePoll ? 15 * 1000 : 0, // 15 seconds in milliseconds
    notifyOnNetworkStatusChange: false,
  });

  if (error) {
    console.error(error);
  }

  return {
    data: data?.match,
    loading,
    error,
  };
}
