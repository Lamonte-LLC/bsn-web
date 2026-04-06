import { getClient } from '@/apollo-client';
import { MATCH_STATUS } from '@/constants';
import {
  HEAD_TO_HEAD_MATCHES,
  MATCH,
  MATCH_PERIODS_BOXSCORE,
  MATCH_TEAMS_BOXSCORE,
} from '@/graphql/match';
import {
  MATCH_LEADERS_STATS,
  SEASON_TEAM_LEADER_PLAYER_STATS,
} from '@/graphql/stats';
import { TEAM_DETAIL, TEAM_STATS } from '@/graphql/team';
import CompletedMatchPage from '@/match/client/components/page/CompletedMatchPage';
import LiveMatchPage from '@/match/client/components/page/LiveMatchPage';
import ScheduledMatchPage from '@/match/client/components/page/ScheduledMatchPage';
import { MatchType } from '@/match/types';
import {
  isCompletedMatchForUi,
  isDevForcedLiveMatchPage,
  isLiveMatchPageStatus,
  isScheduledMatchPageStatus,
  normalizeMatchStatus,
  shouldRenderScheduledMatchPageFallback,
  shouldUseLiveMatchPageLayout,
} from '@/match/utils/matchStatus';
import {
  SEASON_TEAM_LEADERS_CONNECTION_FIRST,
  SEASON_TEAM_LEADERS_DISPLAY_TOP,
} from '@/constants';

/*
 * Página de detalle de partido: el layout (live / finalizado / programado) y los datos extra
 * (líderes, períodos, H2H) siguen `isCompletedMatchForUi`, `isLiveMatchPageStatus` e
 * `isScheduledMatchPageStatus`, usando `providerFixtureStatus` cuando el proveedor y el `status`
 * interno no van sincronizados.
 */
type LeadersCategoryStatsType = {
  player: {
    providerId: string;
    avatarUrl?: string | null;
    name: string;
  };
  value: number;
};

type MatchPlayerBoxScore = {
  player: {
    providerId: string;
    name: string;
    avatarUrl?: string | null;
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

type MatchTeamComparisonBox = {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
};

type MatchResponse = {
  match: MatchType;
  homeTeamBoxScore: MatchTeamComparisonBox;
  visitorTeamBoxScore: MatchTeamComparisonBox;
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

type MatchTeamsBoxScoreResponse = {
  matchTeamsBoxscore: MatchType;
};

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

type TeamSeasonStatsPerGameForComparison = {
  pointsAverage: number;
  reboundsTotalAverage: number;
  assistsAverage: number;
  stealsAverage: number;
  blocksAverage: number;
  turnoversAverage: number;
};

type TeamStatsForComparisonResponse = {
  team?: {
    seasonStats?: TeamSeasonStatsPerGameForComparison;
  };
};

function teamSeasonPerGameAveragesForScheduledComparison(
  stats: TeamSeasonStatsPerGameForComparison | undefined,
): MatchTeamComparisonBox {
  return {
    points: Number(stats?.pointsAverage ?? 0),
    rebounds: Number(stats?.reboundsTotalAverage ?? 0),
    assists: Number(stats?.assistsAverage ?? 0),
    steals: Number(stats?.stealsAverage ?? 0),
    blocks: Number(stats?.blocksAverage ?? 0),
    turnovers: Number(stats?.turnoversAverage ?? 0),
  };
}

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

  const devForceLive = isDevForcedLiveMatchPage(matchProviderId);
  const scheduledPreview =
    !devForceLive &&
    isScheduledMatchPageStatus(match.status, match.providerFixtureStatus);
  const completedUi =
    !devForceLive &&
    isCompletedMatchForUi(match.status, match.providerFixtureStatus);
  /** Misma rama que antes: `devForceLive` o partido en juego (no cerrado en UI). */
  const liveLayoutLeaders =
    devForceLive ||
    isLiveMatchPageStatus(match.status, match.providerFixtureStatus);

  /** Estados con totales de equipo en juego; excluye programado/reprogramado (usan `TEAM_STATS` abajo). */
  const statusesNeedingMatchTeamsBoxscore = [
    MATCH_STATUS.IN_PROGRESS,
    MATCH_STATUS.PERIOD_BREAK,
    MATCH_STATUS.PENDING,
    MATCH_STATUS.READY,
    MATCH_STATUS.DELAYED,
    MATCH_STATUS.INTERRUPTED,
    MATCH_STATUS.WARMUP,
    MATCH_STATUS.PREMATCH,
    MATCH_STATUS.ANTHEM,
    MATCH_STATUS.ONCOURT,
    MATCH_STATUS.STANDBY,
    MATCH_STATUS.COUNTDOWN,
    MATCH_STATUS.LOADED,
    MATCH_STATUS.ABOUT_TO_START,
    MATCH_STATUS.ON_PITCH,
  ] as const;

  const statusNorm = normalizeMatchStatus(match.status);
  const needsMatchTeamsBoxscore =
    devForceLive ||
    (statusesNeedingMatchTeamsBoxscore as readonly string[]).includes(statusNorm);

  const response: MatchResponse = {
    match,
    homeTeamBoxScore: {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
    },
    visitorTeamBoxScore: {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
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

  // Tras MATCH: paralelizar GraphQL independiente (menos RTT acumulado en la primera carga).
  // Vista programada: no pedir `MATCH_TEAMS_BOXSCORE` (se reemplaza con `TEAM_STATS` abajo).
  type ParallelPiece =
    | {
        kind: 'teamsBox';
        data: MatchTeamsBoxScoreResponse | undefined;
        error: Error | undefined;
      }
    | {
        kind: 'periods';
        data: MatchPeriodsBoxScoreResponse | undefined;
        error: Error | undefined;
      }
    | {
        kind: 'gameLeaders';
        data: MatchLeadersStatsResponse | undefined;
        error: Error | undefined;
      };

  const parallelPieces: Promise<ParallelPiece>[] = [];

  if (!scheduledPreview && needsMatchTeamsBoxscore) {
    parallelPieces.push(
      getClient()
        .query<MatchTeamsBoxScoreResponse>({
          query: MATCH_TEAMS_BOXSCORE,
          variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
          errorPolicy: 'all',
        })
        .then((r) => ({
          kind: 'teamsBox' as const,
          data: r.data,
          error: r.error,
        }))
        .catch((e) => {
          console.error(
            '[fetchMatch] MATCH_TEAMS_BOXSCORE request failed:',
            matchProviderId,
            e,
          );
          return {
            kind: 'teamsBox' as const,
            data: undefined,
            error: e instanceof Error ? e : new Error(String(e)),
          };
        }),
    );
  }

  if (completedUi) {
    parallelPieces.push(
      getClient()
        .query<MatchPeriodsBoxScoreResponse>({
          query: MATCH_PERIODS_BOXSCORE,
          variables: { geniusMatchId: 0, providerMatchId: matchProviderId },
          errorPolicy: 'all',
        })
        .then((r) => ({
          kind: 'periods' as const,
          data: r.data,
          error: r.error,
        }))
        .catch((e) => {
          console.error(
            '[fetchMatch] MATCH_PERIODS_BOXSCORE request failed:',
            matchProviderId,
            e,
          );
          return {
            kind: 'periods' as const,
            data: undefined,
            error: e instanceof Error ? e : new Error(String(e)),
          };
        }),
    );
    parallelPieces.push(
      getClient()
        .query<MatchLeadersStatsResponse>({
          query: MATCH_LEADERS_STATS,
          variables: { matchProviderId: matchProviderId, first: 3 },
          errorPolicy: 'all',
        })
        .then((r) => ({
          kind: 'gameLeaders' as const,
          data: r.data,
          error: r.error,
        }))
        .catch((e) => {
          console.error(
            '[fetchMatch] MATCH_LEADERS_STATS (completed) request failed:',
            matchProviderId,
            e,
          );
          return {
            kind: 'gameLeaders' as const,
            data: undefined,
            error: e instanceof Error ? e : new Error(String(e)),
          };
        }),
    );
  } else if (liveLayoutLeaders) {
    parallelPieces.push(
      getClient()
        .query<MatchLeadersStatsResponse>({
          query: MATCH_LEADERS_STATS,
          variables: { matchProviderId: matchProviderId, first: 3 },
          errorPolicy: 'all',
        })
        .then((r) => ({
          kind: 'gameLeaders' as const,
          data: r.data,
          error: r.error,
        }))
        .catch((e) => {
          console.error(
            '[fetchMatch] live MATCH_LEADERS_STATS request failed:',
            matchProviderId,
            e,
          );
          return {
            kind: 'gameLeaders' as const,
            data: undefined,
            error: e instanceof Error ? e : new Error(String(e)),
          };
        }),
    );
  }

  const parallelResults = await Promise.all(parallelPieces);

  const teamsBoxPiece = parallelResults.find((p) => p.kind === 'teamsBox');
  const periodsPiece = parallelResults.find((p) => p.kind === 'periods');
  const gameLeadersPiece = parallelResults.find((p) => p.kind === 'gameLeaders');

  const applyGameLeaders = (
    matchLeadersStatsData: MatchLeadersStatsResponse | undefined,
  ) => {
    if (matchLeadersStatsData == null) {
      return;
    }
    response.pointsLeaders =
      matchLeadersStatsData.pointsLeaders.edges.map((edge) => edge.node) ?? [];
    response.reboundsLeaders =
      matchLeadersStatsData.reboundsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.assistsLeaders =
      matchLeadersStatsData.assistsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.stealsLeaders =
      matchLeadersStatsData.stealsLeaders.edges.map((edge) => edge.node) ?? [];
    response.blocksLeaders =
      matchLeadersStatsData.blocksLeaders.edges.map((edge) => edge.node) ?? [];
    response.threePointersMadeLeaders =
      matchLeadersStatsData.threePointersMadeLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
  };

  if (teamsBoxPiece != null && teamsBoxPiece.kind === 'teamsBox') {
    if (teamsBoxPiece.error) {
      console.error(
        '[fetchMatch] MATCH_TEAMS_BOXSCORE GraphQL error:',
        matchProviderId,
        teamsBoxPiece.error,
      );
    }
    const matchTeamsBoxScore = teamsBoxPiece.data?.matchTeamsBoxscore;
    if (matchTeamsBoxScore != null) {
      response.homeTeamBoxScore = {
        points: matchTeamsBoxScore.homeTeamBoxscore?.points ?? 0,
        rebounds: matchTeamsBoxScore.homeTeamBoxscore?.reboundsTotal ?? 0,
        assists: matchTeamsBoxScore.homeTeamBoxscore?.assists ?? 0,
        steals: matchTeamsBoxScore.homeTeamBoxscore?.steals ?? 0,
        blocks: matchTeamsBoxScore.homeTeamBoxscore?.blocks ?? 0,
        turnovers: matchTeamsBoxScore.homeTeamBoxscore?.turnovers ?? 0,
      };
      response.visitorTeamBoxScore = {
        points: matchTeamsBoxScore.visitorTeamBoxscore?.points ?? 0,
        rebounds: matchTeamsBoxScore.visitorTeamBoxscore?.reboundsTotal ?? 0,
        assists: matchTeamsBoxScore.visitorTeamBoxscore?.assists ?? 0,
        steals: matchTeamsBoxScore.visitorTeamBoxscore?.steals ?? 0,
        blocks: matchTeamsBoxScore.visitorTeamBoxscore?.blocks ?? 0,
        turnovers: matchTeamsBoxScore.visitorTeamBoxscore?.turnovers ?? 0,
      };
    } else {
      console.warn(
        '[fetchMatch] matchTeamsBoxscore null or missing; keeping zero totals',
        matchProviderId,
      );
    }
  }

  if (completedUi && periodsPiece != null && periodsPiece.kind === 'periods') {
    if (periodsPiece.error) {
      console.error(
        '[fetchMatch] MATCH_PERIODS_BOXSCORE GraphQL error:',
        matchProviderId,
        periodsPiece.error,
      );
    }
    const matchPeriodsBoxScore = periodsPiece.data?.matchPeriods;
    const periods = matchPeriodsBoxScore?.periods;
    if (periods != null && periods.length > 0) {
      response.match = {
        ...response.match,
        periods,
      };
    } else {
      console.warn(
        '[fetchMatch] matchPeriods missing or empty; rendering completed match without quarter rows',
        matchProviderId,
      );
      response.match = {
        ...response.match,
        periods: [],
      };
    }
  }

  if (
    gameLeadersPiece != null &&
    gameLeadersPiece.kind === 'gameLeaders'
  ) {
    if (completedUi) {
      if (gameLeadersPiece.error) {
        console.error(
          '[fetchMatch] MATCH_LEADERS_STATS (completed) error:',
          matchProviderId,
          gameLeadersPiece.error,
        );
      }
      applyGameLeaders(gameLeadersPiece.data);
    } else if (liveLayoutLeaders) {
      if (gameLeadersPiece.error) {
        console.error(
          '[fetchMatch] live MATCH_LEADERS_STATS error:',
          matchProviderId,
          gameLeadersPiece.error,
        );
      }
      applyGameLeaders(gameLeadersPiece.data);
    }
  }

  // Programado o reprogramado: una sola tanda paralela (antes: 4 + 1 + 2 RTT).
  if (scheduledPreview) {
    const [
      { data: homeTeamDetail },
      { data: visitorTeamDetail },
      { data: homeTeamStatsData },
      { data: visitorTeamStatsData },
      { data: headToHeadMatchesData },
      { data: matchHomeTeamLeadersData },
      { data: matchVisitorTeamLeadersData },
    ] = await Promise.all([
      getClient().query<TeamDetailStandingsResponse>({
        query: TEAM_DETAIL,
        variables: { code: match.homeTeam.code },
      }),
      getClient().query<TeamDetailStandingsResponse>({
        query: TEAM_DETAIL,
        variables: { code: match.visitorTeam.code },
      }),
      getClient().query<TeamStatsForComparisonResponse>({
        query: TEAM_STATS,
        variables: { code: match.homeTeam.code },
      }),
      getClient().query<TeamStatsForComparisonResponse>({
        query: TEAM_STATS,
        variables: { code: match.visitorTeam.code },
      }),
      getClient().query<HeadToHeadMatchesResponse>({
        query: HEAD_TO_HEAD_MATCHES,
        variables: {
          teamCodeA: match.homeTeam.code,
          teamCodeB: match.visitorTeam.code,
          toDate: match.startAt,
          first: 5,
        },
      }),
      getClient().query<MatchTeamLeadersResponse>({
        query: SEASON_TEAM_LEADER_PLAYER_STATS,
        variables: {
          teamCode: match.homeTeam.code,
          first: SEASON_TEAM_LEADERS_CONNECTION_FIRST,
        },
      }),
      getClient().query<MatchTeamLeadersResponse>({
        query: SEASON_TEAM_LEADER_PLAYER_STATS,
        variables: {
          teamCode: match.visitorTeam.code,
          first: SEASON_TEAM_LEADERS_CONNECTION_FIRST,
        },
      }),
    ]);

    response.homeTeamBoxScore = teamSeasonPerGameAveragesForScheduledComparison(
      homeTeamStatsData?.team?.seasonStats,
    );
    response.visitorTeamBoxScore = teamSeasonPerGameAveragesForScheduledComparison(
      visitorTeamStatsData?.team?.seasonStats,
    );

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

    response.headToHeadMatches =
      headToHeadMatchesData?.headToHeadMatchesConnection.edges.map(
        (edge) => edge.node,
      ) ?? [];

    const top = SEASON_TEAM_LEADERS_DISPLAY_TOP;

    response.homeTeamPointsLeaders = (
      matchHomeTeamLeadersData?.pointsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);
    response.homeTeamAssistsLeaders = (
      matchHomeTeamLeadersData?.assistsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);
    response.homeTeamReboundsLeaders = (
      matchHomeTeamLeadersData?.reboundsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);

    response.visitorTeamPointsLeaders = (
      matchVisitorTeamLeadersData?.pointsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);
    response.visitorTeamAssistsLeaders = (
      matchVisitorTeamLeadersData?.assistsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);
    response.visitorTeamReboundsLeaders = (
      matchVisitorTeamLeadersData?.reboundsLeaders.edges ?? []
    )
      .slice(0, top)
      .map((edge) => edge.node);
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
      {/* Layout “En vivo” solo según estado del partido (no según streamUrl). */}
      {shouldUseLiveMatchPageLayout(data.match) && (
        <LiveMatchPage
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
      {/* Partido cerrado: mismo criterio que `!shouldUseLiveMatchPageLayout` cuando no es programado. */}
      {!isDevForcedLiveMatchPage(data.match.providerId) &&
        isCompletedMatchForUi(
          data.match.status,
          data.match.providerFixtureStatus,
        ) && (
        <CompletedMatchPage
          match={data.match}
          pointsLeaders={data.pointsLeaders}
          reboundsLeaders={data.reboundsLeaders}
          assistsLeaders={data.assistsLeaders}
          stealsLeaders={data.stealsLeaders}
          blocksLeaders={data.blocksLeaders}
          threePointersMadeLeaders={data.threePointersMadeLeaders}
        />
      )}
      {/* SCHEDULED / RESCHEDULED y no cerrado: antes solo se cargaba preview si `status === SCHEDULED`. */}
      {!isDevForcedLiveMatchPage(data.match.providerId) &&
        isScheduledMatchPageStatus(
          data.match.status,
          data.match.providerFixtureStatus,
        ) && (
        <ScheduledMatchPage
          match={data.match}
          homeTeamBoxScore={data.homeTeamBoxScore}
          visitorTeamBoxScore={data.visitorTeamBoxScore}
          headToHeadMatches={data.headToHeadMatches}
          homeTeamPointsLeaders={data.homeTeamPointsLeaders}
          homeTeamAssistsLeaders={data.homeTeamAssistsLeaders}
          homeTeamReboundsLeaders={data.homeTeamReboundsLeaders}
          visitorTeamPointsLeaders={data.visitorTeamPointsLeaders}
          visitorTeamAssistsLeaders={data.visitorTeamAssistsLeaders}
          visitorTeamReboundsLeaders={data.visitorTeamReboundsLeaders}
        />
      )}
      {shouldRenderScheduledMatchPageFallback(data.match) && (
        <ScheduledMatchPage
          match={data.match}
          homeTeamBoxScore={data.homeTeamBoxScore}
          visitorTeamBoxScore={data.visitorTeamBoxScore}
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
