import {
  DATE_TIME_TZ_FORMAT,
  SEASON_TEAM_LEADERS_CONNECTION_FIRST,
} from '@/constants';
import {
  TEAM_LEADERS_STATS_CONNECTION,
  TEAM_PLAYERS_CONNECTION,
  TEAM_PLAYERS_STATS_CONNECTION,
  TEAM_STATS,
  TEAM_UPCOMING_CALENDAR,
} from '@/graphql/team';
import { MatchType } from '@/match/types';
import { TeamPlayerType, TeamType } from '@/team/types';
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
