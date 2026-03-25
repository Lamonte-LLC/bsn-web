import { getClient } from '@/apollo-client';
import { MATCH_STATUS } from '@/constants';
import {
  HEAD_TO_HEAD_MATCHES,
  MATCH,
  MATCH_PERIODS_BOXSCORE,
  MATCH_TEAMS_BOXSCORE,
} from '@/graphql/match';
import { MATCH_LEADERS_STATS, SEASON_TEAM_LEADER_PLAYER_STATS } from '@/graphql/stats';
import { TEAM_DETAIL } from '@/graphql/team';
import CompletedMatchPage from '@/match/client/components/page/CompletedMatchPage';
import LiveMatchPage from '@/match/client/components/page/LiveMatchPage';
import ScheduledMatchPage from '@/match/client/components/page/ScheduledMatchPage';
import type { MatchTeamComparisonBoxScore } from '@/match/components/stats/MatchTeamStatsComparison';
import { MatchType } from '@/match/types';
import { isLiveMatchPageStatus } from '@/match/utils/matchStatus';

type LeadersCategoryStatsType = {
  player: {
    providerId: string;
    avatarUrl: string;
    name: string;
  };
  value: number;
};

type MatchPlayerBoxScore = {
  player: {
    providerId: string;
    name: string;
    avatarUrl: string;
    teamCode?: string;
    team?: {
      code: string;
      name: string;
    };
  };
  boxscore: {
    points: number;
    reboundsTotal: number;
    assists: number;
    steals: number;
    blocks: number;
    threePointersMade: number;
  };
};

type MatchResponse = {
  match: MatchType;
  homeTeamBoxScore: MatchTeamComparisonBoxScore;
  visitorTeamBoxScore: MatchTeamComparisonBoxScore;
  homeTeamPointsLeaders: LeadersCategoryStatsType[];
  homeTeamAssistsLeaders: LeadersCategoryStatsType[];
  homeTeamReboundsLeaders: LeadersCategoryStatsType[];
  visitorTeamPointsLeaders: LeadersCategoryStatsType[];
  visitorTeamAssistsLeaders: LeadersCategoryStatsType[];
  visitorTeamReboundsLeaders: LeadersCategoryStatsType[];
  headToHeadMatches: MatchType[];
  homeTeamPlayersBoxScore: MatchPlayerBoxScore[];
  visitorTeamPlayersBoxScore: MatchPlayerBoxScore[];
  pointsLeaders: MatchPlayerBoxScore[];
  reboundsLeaders: MatchPlayerBoxScore[];
  assistsLeaders: MatchPlayerBoxScore[];
  stealsLeaders: MatchPlayerBoxScore[];
  blocksLeaders: MatchPlayerBoxScore[];
  threePointersMadeLeaders: MatchPlayerBoxScore[];
};

/** Fragment returned by `MATCH_TEAMS_BOXSCORE` (typed loosely; aligns with team comparison mapping). */
type GraphqlTeamBoxscore = {
  fieldGoalsMade?: number | null;
  fieldGoalsAttempted?: number | null;
  fieldGoalsPercentage?: number | null;
  threePointersMade?: number | null;
  threePointersAttempted?: number | null;
  threePointersPercentage?: number | null;
  freeThrowsMade?: number | null;
  freeThrowsAttempted?: number | null;
  freeThrowsPercentage?: number | null;
  offensiveRebounds?: number | null;
  reboundsTotal?: number | null;
  assists?: number | null;
  turnovers?: number | null;
  steals?: number | null;
  blocks?: number | null;
  foulsPersonal?: number | null;
};

type MatchTeamsBoxScoreResponse = {
  matchTeamsBoxscore: {
    homeTeamBoxscore?: GraphqlTeamBoxscore | null;
    visitorTeamBoxscore?: GraphqlTeamBoxscore | null;
  } | null;
};

function teamComparisonBoxScoreFromGraphql(
  team: GraphqlTeamBoxscore | null | undefined,
): MatchTeamComparisonBoxScore {
  return {
    fieldGoalsMade: team?.fieldGoalsMade ?? 0,
    fieldGoalsAttempted: team?.fieldGoalsAttempted ?? 0,
    fieldGoalsPercentage: team?.fieldGoalsPercentage ?? 0,
    threePointersMade: team?.threePointersMade ?? 0,
    threePointersAttempted: team?.threePointersAttempted ?? 0,
    threePointersPercentage: team?.threePointersPercentage ?? 0,
    freeThrowsMade: team?.freeThrowsMade ?? 0,
    freeThrowsAttempted: team?.freeThrowsAttempted ?? 0,
    freeThrowsPercentage: team?.freeThrowsPercentage ?? 0,
    offensiveRebounds: team?.offensiveRebounds ?? 0,
    reboundsTotal: team?.reboundsTotal ?? 0,
    assists: team?.assists ?? 0,
    turnovers: team?.turnovers ?? 0,
    steals: team?.steals ?? 0,
    blocks: team?.blocks ?? 0,
    foulsPersonal: team?.foulsPersonal ?? 0,
  };
}

function applyMatchTeamsBoxscoreToResponse(
  response: MatchResponse,
  matchTeamsBoxScore: NonNullable<MatchTeamsBoxScoreResponse['matchTeamsBoxscore']>,
): void {
  response.homeTeamBoxScore = teamComparisonBoxScoreFromGraphql(
    matchTeamsBoxScore.homeTeamBoxscore,
  );
  response.visitorTeamBoxScore = teamComparisonBoxScoreFromGraphql(
    matchTeamsBoxScore.visitorTeamBoxscore,
  );
}

type MatchPeriodsBoxScoreResponse = {
  matchPeriods: MatchType;
};

type MatchLeadersStatsResponse = {
  pointsLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
  reboundsLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
  assistsLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
  stealsLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
  blocksLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
  threePointersMadeLeaders: {
    edges: {
      node: MatchPlayerBoxScore;
    }[];
  };
};

/** `team(code)` — misma fuente que ficha de equipo; alinea W–L con la temporada actual. */
type TeamDetailStandingsResponse = {
  team?: {
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
};

type HeadToHeadMatchesResponse = {
  headToHeadMatchesConnection: {
    edges: {
      node: MatchType;
    }[];
  };
};

type MatchTeamLeadersResponse = {
  pointsLeaders: {
    edges: {
      node: LeadersCategoryStatsType;
    }[];
  };
  reboundsLeaders: {
    edges: {
      node: LeadersCategoryStatsType;
    }[];
  };
  assistsLeaders: {
    edges: {
      node: LeadersCategoryStatsType;
    }[];
  };
};

const fetchMatch = async (matchProviderId: string): Promise<MatchResponse> => {
  const { data, error } = await getClient().query<MatchResponse>({
    query: MATCH,
    variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
  });

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch match data');
  }

  const match = data?.match;

  if (match == null) {
    console.error('No match data found for provider ID:', matchProviderId);
    throw new Error('Match not found');
  }

  const response: MatchResponse = {
    match,
    homeTeamBoxScore: {
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      fieldGoalsPercentage: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      threePointersPercentage: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      freeThrowsPercentage: 0,
      offensiveRebounds: 0,
      reboundsTotal: 0,
      assists: 0,
      turnovers: 0,
      steals: 0,
      blocks: 0,
      foulsPersonal: 0,
    },
    visitorTeamBoxScore: {
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      fieldGoalsPercentage: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      threePointersPercentage: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      freeThrowsPercentage: 0,
      offensiveRebounds: 0,
      reboundsTotal: 0,
      assists: 0,
      turnovers: 0,
      steals: 0,
      blocks: 0,
      foulsPersonal: 0,
    },
    headToHeadMatches: [],
    homeTeamPointsLeaders: [],
    homeTeamAssistsLeaders: [],
    homeTeamReboundsLeaders: [],
    visitorTeamPointsLeaders: [],
    visitorTeamAssistsLeaders: [],
    visitorTeamReboundsLeaders: [],
    homeTeamPlayersBoxScore: [],
    visitorTeamPlayersBoxScore: [],
    pointsLeaders: [],
    reboundsLeaders: [],
    assistsLeaders: [],
    stealsLeaders: [],
    blocksLeaders: [],
    threePointersMadeLeaders: [],
  };

  if (match.status === MATCH_STATUS.SCHEDULED) {
    const [{ data: homeTeamDetail }, { data: visitorTeamDetail }] =
      await Promise.all([
        getClient().query<TeamDetailStandingsResponse>({
          query: TEAM_DETAIL,
          variables: { code: match.homeTeam.code },
        }),
        getClient().query<TeamDetailStandingsResponse>({
          query: TEAM_DETAIL,
          variables: { code: match.visitorTeam.code },
        }),
      ]);

    const homeFromTeam = homeTeamDetail?.team?.competitionStandings;
    const visitorFromTeam = visitorTeamDetail?.team?.competitionStandings;

    if (homeFromTeam != null || visitorFromTeam != null) {
      response.match = {
        ...response.match,
        homeTeam: {
          ...response.match.homeTeam,
          competitionStandings:
            homeFromTeam != null
              ? { won: homeFromTeam.won, lost: homeFromTeam.lost }
              : response.match.homeTeam.competitionStandings,
        },
        visitorTeam: {
          ...response.match.visitorTeam,
          competitionStandings:
            visitorFromTeam != null
              ? { won: visitorFromTeam.won, lost: visitorFromTeam.lost }
              : response.match.visitorTeam.competitionStandings,
        },
      };
    }

    const { data: headToHeadMatchesData } =
      await getClient().query<HeadToHeadMatchesResponse>({
        query: HEAD_TO_HEAD_MATCHES,
        variables: {
          teamCodeA: match.homeTeam.code,
          teamCodeB: match.visitorTeam.code,
          toDate: match.startAt,
          first: 5,
        },
      });
    response.headToHeadMatches =
      headToHeadMatchesData?.headToHeadMatchesConnection.edges.map((edge) => edge.node) ??
      [];

    const { data: matchHomeTeamLeadersData } =
      await getClient().query<MatchTeamLeadersResponse>({
        query: SEASON_TEAM_LEADER_PLAYER_STATS,
        variables: { teamCode: match.homeTeam.code, first: 3 },
      });

    response.homeTeamPointsLeaders =
      matchHomeTeamLeadersData?.pointsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.homeTeamAssistsLeaders =
      matchHomeTeamLeadersData?.assistsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.homeTeamReboundsLeaders =
      matchHomeTeamLeadersData?.reboundsLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];

    const { data: matchVisitorTeamLeadersData } =
      await getClient().query<MatchTeamLeadersResponse>({
        query: SEASON_TEAM_LEADER_PLAYER_STATS,
        variables: { teamCode: match.visitorTeam.code, first: 3 },
      });

    response.visitorTeamPointsLeaders =
      matchVisitorTeamLeadersData?.pointsLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
    response.visitorTeamAssistsLeaders =
      matchVisitorTeamLeadersData?.assistsLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
    response.visitorTeamReboundsLeaders =
      matchVisitorTeamLeadersData?.reboundsLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
  }

  const needsTeamComparisonBoxscore =
    isLiveMatchPageStatus(match.status) ||
    [MATCH_STATUS.COMPLETE, MATCH_STATUS.FINISHED].includes(match.status);

  if (needsTeamComparisonBoxscore) {
    const { data: matchTeamsBoxScoreData } =
      await getClient().query<MatchTeamsBoxScoreResponse>({
        query: MATCH_TEAMS_BOXSCORE,
        variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
      });

    const matchTeamsBoxScore = matchTeamsBoxScoreData?.matchTeamsBoxscore;

    if (matchTeamsBoxScore == null) {
      console.error(
        'No match teams boxscore data found for provider ID:',
        matchProviderId,
      );
      throw new Error('Match teams boxscore not found');
    }

    applyMatchTeamsBoxscoreToResponse(response, matchTeamsBoxScore);
  }

  if ([MATCH_STATUS.COMPLETE, MATCH_STATUS.FINISHED].includes(match.status)) {
    const { data: matchPeriodsBoxScoreData } =
      await getClient().query<MatchPeriodsBoxScoreResponse>({
        query: MATCH_PERIODS_BOXSCORE,
        variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
      });

    const matchPeriodsBoxScore = matchPeriodsBoxScoreData?.matchPeriods;

    if (matchPeriodsBoxScore == null) {
      console.error(
        'No match periods boxscore data found for provider ID:',
        matchProviderId,
      );
      throw new Error('Match periods boxscore not found');
    }

    response.match = {
      ...response.match,
      periods: matchPeriodsBoxScore.periods,
    };

    const { data: matchLeadersStatsData } =
      await getClient().query<MatchLeadersStatsResponse>({
        query: MATCH_LEADERS_STATS,
        variables: { matchProviderId: matchProviderId, first: 3 },
        fetchPolicy: 'network-only',
      });

    response.pointsLeaders = matchLeadersStatsData?.pointsLeaders.edges.map(
      (edge) => edge.node,
    ) ?? [];
    response.reboundsLeaders = matchLeadersStatsData?.reboundsLeaders.edges.map(
      (edge) => edge.node,
    ) ?? [];
    response.assistsLeaders = matchLeadersStatsData?.assistsLeaders.edges.map(
      (edge) => edge.node,
    ) ?? [];
    response.stealsLeaders = matchLeadersStatsData?.stealsLeaders.edges.map(
      (edge) => edge.node,
    ) ?? [];
    response.blocksLeaders = matchLeadersStatsData?.blocksLeaders.edges.map(
      (edge) => edge.node,
    ) ?? [];
    response.threePointersMadeLeaders =
      matchLeadersStatsData?.threePointersMadeLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
  }

  return response;
};

export default async function PartidoPage({
  params,
}: PageProps<'/partidos/[id]'>) {
  const { id } = await params;
  const data: MatchResponse = await fetchMatch(id);

  return (
    <>
      {isLiveMatchPageStatus(data.match.status) && (
        <LiveMatchPage
          match={data.match}
          homeTeamBoxScore={data.homeTeamBoxScore}
          visitorTeamBoxScore={data.visitorTeamBoxScore}
        />
      )}
      {[MATCH_STATUS.COMPLETE, MATCH_STATUS.FINISHED].includes(
        data.match.status,
      ) && (
        <CompletedMatchPage
          match={data.match}
          homeTeamBoxScore={data.homeTeamBoxScore}
          visitorTeamBoxScore={data.visitorTeamBoxScore}
          pointsLeaders={data.pointsLeaders}
          reboundsLeaders={data.reboundsLeaders}
          assistsLeaders={data.assistsLeaders}
          stealsLeaders={data.stealsLeaders}
          blocksLeaders={data.blocksLeaders}
          threePointersMadeLeaders={data.threePointersMadeLeaders}
        />
      )}
      {[MATCH_STATUS.SCHEDULED, MATCH_STATUS.RESCHEDULED].includes(
        data.match.status,
      ) && (
        <ScheduledMatchPage
          match={data.match}
          headToHeadMatches={data.headToHeadMatches}
          homeTeamPointsLeaders={data.homeTeamPointsLeaders}
          homeTeamAssistsLeaders={data.homeTeamAssistsLeaders}
          homeTeamReboundsLeaders={data.homeTeamReboundsLeaders}
          visitorTeamPointsLeaders={data.visitorTeamPointsLeaders}
          visitorTeamAssistsLeaders={data.visitorTeamAssistsLeaders}
          visitorTeamReboundsLeaders={data.visitorTeamReboundsLeaders}
        />
      )}
    </>
  );
}
