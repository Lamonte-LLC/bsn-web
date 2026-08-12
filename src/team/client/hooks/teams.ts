import {
  DATE_TIME_TZ_FORMAT,
  SEASON_TEAM_LEADERS_CONNECTION_FIRST,
} from '@/constants';
import { SEASON_HEAD_TO_HEAD_MATCHES } from '@/graphql/match';
import { HEAD_TO_HEAD_TEAM_STATS_EXTENDED } from '@/graphql/stats';
import {
  COMPARE_TEAMS_STATS,
  TEAM_LEADERS_STATS_CONNECTION,
  TEAM_PLAYERS_CONNECTION,
  TEAM_PLAYERS_STATS_CONNECTION,
  TEAM_STATS,
  TEAM_UPCOMING_CALENDAR,
} from '@/graphql/team';
import { MatchType } from '@/match/types';
import type { TeamRecord } from '@/team/components/compare/types';
import {
  SeasonHeadToHeadMatchType,
  TeamPlayerType,
  TeamSeasonStatsType,
  TeamType,
} from '@/team/types';
import { useQuery } from '@apollo/client/react';
import moment from 'moment';

type UpcomingCalendarConnectionResponse = {
  teamUpcomingCalendarConnection: {
    edges: {
      node: MatchType;
    }[];
  };
};

export function useUpcomingCalendarConnection(code: string, first: number = 5) {
  const date = moment().format(DATE_TIME_TZ_FORMAT);

  const { data, loading, error } = useQuery<UpcomingCalendarConnectionResponse>(
    TEAM_UPCOMING_CALENDAR,
    {
      variables: { code, date, first },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.teamUpcomingCalendarConnection ?? { edges: [] },
    loading,
    error,
  };
}

type TeamPlayersConnectionResponse = {
  teamRostersConnection: {
    edges: {
      node: {
        player: TeamPlayerType;
        playingPosition: string;
        jerseyNumber: number;
        status: string;
      };
    }[];
  };
};

export function useTeamPlayersConnection(code: string, seasonProviderId?: string, first: number = 25) {
  const { data, loading, error } = useQuery<TeamPlayersConnectionResponse>(
    TEAM_PLAYERS_CONNECTION,
    {
      variables: { code, seasonProviderId, first },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.teamRostersConnection?.edges.map(edge => edge.node) ?? [],
    loading,
    error,
  };
}

type TeamPlayersStatsConnectionResponse = {
  teamPlayersStatsConnection: {
    edges: {
      node: TeamPlayerType;
    }[];
  };
};

export function useTeamPlayersStatsConnection(
  code: string,
  first: number = 25,
) {
  const { data, loading, error } = useQuery<TeamPlayersStatsConnectionResponse>(
    TEAM_PLAYERS_STATS_CONNECTION,
    {
      variables: { code, first },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.teamPlayersStatsConnection ?? { edges: [] },
    loading,
    error,
  };
}

type TeamLeadersConnectionResponse = {
  pointsLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
  reboundsLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
  assistsLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
  blocksLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
  stealsLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
  fieldGoalsLeaders: {
    edges: {
      node: {
        player: TeamPlayerType;
        value: number;
      };
    }[];
  };
};

export function useTeamLeadersConnection(
  code: string,
  first: number = SEASON_TEAM_LEADERS_CONNECTION_FIRST,
) {
  const { data, loading, error } = useQuery<TeamLeadersConnectionResponse>(
    TEAM_LEADERS_STATS_CONNECTION,
    {
      variables: { teamCode: code, first },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data ?? {
      pointsLeaders: { edges: [] },
      reboundsLeaders: { edges: [] },
      assistsLeaders: { edges: [] },
      blocksLeaders: { edges: [] },
      stealsLeaders: { edges: [] },
      fieldGoalsLeaders: { edges: [] },
    },
    loading,
    error,
  };
}

type TeamStatsResponse = {
  team: TeamType;
};

export function useTeamStats(code: string) {
  const { data, loading, error } = useQuery<TeamStatsResponse>(
    TEAM_STATS,
    {
      variables: { code },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.team,
    loading,
    error,
  };
}

type HeadToHeadTeamStatsResponse = {
  headToHeadTeamStats: {
    team: Pick<
      TeamType,
      'providerId' | 'code' | 'name' | 'nickname' | 'city' | 'colorPrimary'
    >;
    stats: TeamSeasonStatsType;
  }[];
};

/**
 * Stats de varios equipos en un solo request (vs. una query por equipo).
 * Usado por la página de comparar equipos.
 */
export function useHeadToHeadTeamStats(
  codes: string[],
  seasonProviderId?: string,
) {
  const { data, loading, error } = useQuery<HeadToHeadTeamStatsResponse>(
    HEAD_TO_HEAD_TEAM_STATS_EXTENDED,
    {
      variables: { teamCodes: codes, seasonProviderId },
      fetchPolicy: 'network-only',
      skip: codes.length === 0,
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.headToHeadTeamStats,
    loading,
    error,
  };
}

type SeasonHeadToHeadMatchesResponse = {
  seasonHeadToHeadMatchesConnection: {
    edges: {
      node: SeasonHeadToHeadMatchType;
    }[];
  };
};

/**
 * Historial de enfrentamientos entre los equipos seleccionados en una
 * temporada. Usado por "Últimos encuentros" en la página de comparar equipos.
 */
export function useSeasonHeadToHeadMatches(
  teamCodes: string[],
  seasonProviderId?: string,
  first: number = 999,
) {
  const { data, loading, error } = useQuery<SeasonHeadToHeadMatchesResponse>(
    SEASON_HEAD_TO_HEAD_MATCHES,
    {
      variables: { teamCodes, seasonProviderId, first },
      fetchPolicy: 'network-only',
      skip: teamCodes.length < 2,
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.seasonHeadToHeadMatchesConnection?.edges.map((edge) => edge.node) ?? [],
    loading,
    error,
  };
}

type TeamSeasonRecordsResponse = {
  teamsConnection: {
    edges: {
      node: {
        code: string;
        group?: string;
        seasonStats?: {
          position?: number;
          positionInGroup?: number;
          won: number;
          lost: number;
        };
      };
    }[];
  };
};

/**
 * Récords (G-P, posición, grupo) de todos los equipos para una temporada
 * específica. Usado por el hero de comparar equipos, que necesita que won/lost
 * cambien según la temporada seleccionada (a diferencia de standings, que
 * siempre refleja la temporada actual).
 */
export function useTeamSeasonRecords(seasonProviderId?: string, first: number = 50) {
  const { data, loading, error } = useQuery<TeamSeasonRecordsResponse>(
    COMPARE_TEAMS_STATS,
    {
      variables: { seasonProviderId, first },
      fetchPolicy: 'network-only',
      skip: !seasonProviderId,
    },
  );

  if (error) {
    console.error(error);
  }

  const records: Record<string, TeamRecord> = {};
  data?.teamsConnection.edges.forEach(({ node }) => {
    records[node.code] = {
      won: node.seasonStats?.won ?? 0,
      lost: node.seasonStats?.lost ?? 0,
      position: node.seasonStats?.positionInGroup,
      groupName: node.group ? `Grupo ${node.group}` : undefined,
    };
  });

  return {
    data: records,
    loading,
    error,
  };
}
