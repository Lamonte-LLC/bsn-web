import {
  RECENT_CALENDAR,
  MATCH_TEAM_PLAYERS_BOXSCORE,
  MATCH_BOTH_TEAMS_PLAYERS_BOXSCORE,
  MATCH_TEAMS_BOXSCORE,
  MATCH,
  MATCH_LIVE_SCOREBOARD,
} from '@/graphql/match';
import { MatchType } from '@/match/types';
import { useQuery } from '@apollo/client/react';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';

import { usePollIntervalWhenTabVisible } from './usePollIntervalWhenTabVisible';

/** Mismo intervalo para marcador en cabecera y box score por jugador en partidos en vivo. */
const LIVE_MATCH_POLL_MS = 5_000;

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

  const calendarPollMs = usePollIntervalWhenTabVisible(
    usePolling ? 30 * 1000 : 0,
  );

  const { data, loading, error, fetchMore } = useQuery<RecentCalendarResponse>(
    RECENT_CALENDAR,
    {
      variables: initialRange,
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      pollInterval: calendarPollMs,
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

export type MatchPlayerBoxscoreFields = {
  minutes: number;
  points: number;
  reboundsTotal: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  /** DataCore stream `persons.starter`; null/undefined if not received yet. */
  isStarter?: boolean | null;
  assists: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointersPercentage: number;
  twoPointersMade: number;
  twoPointersAttempted: number;
  twoPointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowsPercentage: number;
  foulsPersonal: number;
  foulsDrawn: number;
  steals: number;
  blocks: number;
  turnovers: number;
  plusMinusPoints: number;
};

type MatchTeamPlayersBoxScoreResponse = {
  matchPlayersBoxscore: {
    player: {
      providerId: string;
      avatarUrl?: string | null;
      name: string;
      nickname: string;
      shirtNumber: string;
      playingPosition: string;
    };
    boxscore: MatchPlayerBoxscoreFields;
  }[];
};

export type MatchTeamAggregateBoxscore = {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowsPercentage: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  reboundsTotal: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  foulsPersonal: number;
  points: number;
  twoPointersMade: number;
  twoPointersAttempted: number;
  twoPointersPercentage: number;
  pointsFromTurnover: number;
  pointsInThePaint: number;
  pointsSecondChance: number;
  pointsFastBreak: number;
  pointsFromBench: number;
  biggestLead: number;
  biggestScoringRun: number;
};

type MatchTeamsBoxscoreQueryResponse = {
  matchTeamsBoxscore: {
    homeTeam: { providerId?: string | null };
    visitorTeam: { providerId?: string | null };
    homeTeamBoxscore: MatchTeamAggregateBoxscore;
    visitorTeamBoxscore: MatchTeamAggregateBoxscore;
  } | null;
};

export function useMatchTeamPlayersBoxscore(
  providerMatchId: string,
  providerTeamId: string,
  usePolling = false,
  options?: { skip?: boolean },
) {
  const playerBoxPollMs = usePollIntervalWhenTabVisible(
    usePolling ? LIVE_MATCH_POLL_MS : 0,
  );

  const { data, loading, error } = useQuery<MatchTeamPlayersBoxScoreResponse>(
    MATCH_TEAM_PLAYERS_BOXSCORE,
    {
      skip: options?.skip ?? false,
      variables: {
        geniusMatchId: 0,
        geniusTeamId: 0,
        providerMatchId,
        providerTeamId,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      pollInterval: playerBoxPollMs,
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) {
    console.error(error);
  }

  const rows = data?.matchPlayersBoxscore ?? [];
  // Igual que `useMatch`: no tratar refetch/poll como “sin datos” (evita parpadeo tabla ↔ skeleton).
  const showInitialLoading = rows.length === 0 && loading;

  return { data: rows, loading: showInitialLoading, error };
}

export function useMatchTeamAggregateBoxscore(
  providerMatchId: string,
  teamProviderId: string,
  usePolling = false,
) {
  const teamAggPollMs = usePollIntervalWhenTabVisible(
    usePolling ? LIVE_MATCH_POLL_MS : 0,
  );

  const { data, loading, error } = useQuery<MatchTeamsBoxscoreQueryResponse>(
    MATCH_TEAMS_BOXSCORE,
    {
      variables: { geniusMatchId: 0, providerMatchId },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      pollInterval: teamAggPollMs,
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) {
    console.error(error);
  }

  const row = data?.matchTeamsBoxscore;
  let teamBox: MatchTeamAggregateBoxscore | null = null;
  if (row) {
    if (row.homeTeam?.providerId === teamProviderId) {
      teamBox = row.homeTeamBoxscore;
    } else if (row.visitorTeam?.providerId === teamProviderId) {
      teamBox = row.visitorTeamBoxscore;
    }
  }

  const showInitialLoading = !teamBox && loading;

  return { teamBox, loading: showInitialLoading, error };
}

type BothTeamsPlayersBoxScoreResponse = {
  visitorPlayers: MatchTeamPlayersBoxScoreResponse['matchPlayersBoxscore'];
  homePlayers: MatchTeamPlayersBoxScoreResponse['matchPlayersBoxscore'];
};

/**
 * One HTTP request for both teams' player lines (half the traffic vs two useQuery hooks).
 */
export function useMatchBothTeamsPlayersBoxscore(
  providerMatchId: string,
  visitorTeamProviderId: string,
  homeTeamProviderId: string,
  usePolling = false,
) {
  const bothTeamsPollMs = usePollIntervalWhenTabVisible(
    usePolling ? LIVE_MATCH_POLL_MS : 0,
  );

  const { data, loading, error } = useQuery<BothTeamsPlayersBoxScoreResponse>(
    MATCH_BOTH_TEAMS_PLAYERS_BOXSCORE,
    {
      variables: {
        geniusMatchId: 0,
        providerMatchId,
        visitorProviderTeamId: visitorTeamProviderId,
        homeProviderTeamId: homeTeamProviderId,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      pollInterval: bothTeamsPollMs,
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) {
    console.error(error);
  }

  const visitorPlayers = data?.visitorPlayers ?? [];
  const homePlayers = data?.homePlayers ?? [];
  const showInitialLoading =
    visitorPlayers.length === 0 && homePlayers.length === 0 && loading;

  return {
    visitorPlayers,
    homePlayers,
    loading: showInitialLoading,
    error,
  };
}

type MatchResponse = {
  match: MatchType;
};

export function useMatch(matchProviderId: string, usePoll = false) {
  const matchPollMs = usePollIntervalWhenTabVisible(
    usePoll ? LIVE_MATCH_POLL_MS : 0,
  );

  const { data, loading, error } = useQuery<MatchResponse>(
    usePoll ? MATCH_LIVE_SCOREBOARD : MATCH,
    {
      variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      pollInterval: matchPollMs,
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) {
    console.error(error);
  }

  const match = data?.match;
  // No enmascarar datos ya recibidos con skeleton cuando Apollo hace refetch en segundo plano.
  const showInitialLoading = !match && loading;

  return {
    data: match,
    loading: showInitialLoading,
    error,
  };
}
