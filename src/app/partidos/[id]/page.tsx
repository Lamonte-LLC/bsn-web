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
import { TEAM_DETAIL } from '@/graphql/team';
import CompletedMatchPage from '@/match/client/components/page/CompletedMatchPage';
import LiveMatchPage from '@/match/client/components/page/LiveMatchPage';
import ScheduledMatchPage from '@/match/client/components/page/ScheduledMatchPage';
import { MatchType } from '@/match/types';
import {
  isCompletedMatchForUi,
  isLiveMatchPageStatus,
  isScheduledMatchPageStatus,
  shouldUseLiveMatchPageLayout,
} from '@/match/utils/matchStatus';

/*
 * Página de detalle de partido: el layout (live / finalizado / programado) y los datos extra
 * (líderes, períodos, H2H) siguen `isCompletedMatchForUi`, `isLiveMatchPageStatus` e
 * `isScheduledMatchPageStatus`, usando `providerFixtureStatus` cuando el proveedor y el `status`
 * interno no van sincronizados.
 */
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
  homeTeamBoxScore: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
  };
  visitorTeamBoxScore: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
  };
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

  // Totales de equipo (boxscore agregado): aplica a en vivo, pre-partido y otros estados listados.
  if (
    [
      MATCH_STATUS.IN_PROGRESS,
      MATCH_STATUS.PERIOD_BREAK,
      MATCH_STATUS.PENDING,
      MATCH_STATUS.READY,
      MATCH_STATUS.SCHEDULED,
      MATCH_STATUS.DELAYED,
      MATCH_STATUS.INTERRUPTED,
      MATCH_STATUS.WARMUP,
      MATCH_STATUS.PREMATCH,
      MATCH_STATUS.ANTHEM,
      MATCH_STATUS.ONCOURT,
      MATCH_STATUS.STANDBY,
      MATCH_STATUS.COUNTDOWN,
      MATCH_STATUS.LOADED,
    ].includes(match.status)
  ) {
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
  }

  // Programado o reprogramado: W–L desde `team`, cara a cara, líderes de TEMPORADA por equipo (no del juego).
  if (isScheduledMatchPageStatus(match.status, match.providerFixtureStatus)) {
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
      headToHeadMatchesData?.headToHeadMatchesConnection.edges.map(
        (edge) => edge.node,
      ) ?? [];

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

  // Partido cerrado: parciales + líderes del JUEGO (`matchLeadersConnection` por `matchProviderId`).
  if (isCompletedMatchForUi(match.status, match.providerFixtureStatus)) {
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

    response.pointsLeaders =
      matchLeadersStatsData?.pointsLeaders.edges.map((edge) => edge.node) ?? [];
    response.reboundsLeaders =
      matchLeadersStatsData?.reboundsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.assistsLeaders =
      matchLeadersStatsData?.assistsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.stealsLeaders =
      matchLeadersStatsData?.stealsLeaders.edges.map((edge) => edge.node) ?? [];
    response.blocksLeaders =
      matchLeadersStatsData?.blocksLeaders.edges.map((edge) => edge.node) ?? [];
    response.threePointersMadeLeaders =
      matchLeadersStatsData?.threePointersMadeLeaders.edges.map(
        (edge) => edge.node,
      ) ?? [];
  } else if (isLiveMatchPageStatus(match.status, match.providerFixtureStatus)) {
    // En vivo: mismos líderes con scope de partido que al finalizar (no líderes de liga ni solo un equipo).
    const { data: matchLeadersStatsData } =
      await getClient().query<MatchLeadersStatsResponse>({
        query: MATCH_LEADERS_STATS,
        variables: { matchProviderId: matchProviderId, first: 3 },
        fetchPolicy: 'network-only',
      });

    response.pointsLeaders =
      matchLeadersStatsData?.pointsLeaders.edges.map((edge) => edge.node) ?? [];
    response.reboundsLeaders =
      matchLeadersStatsData?.reboundsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.assistsLeaders =
      matchLeadersStatsData?.assistsLeaders.edges.map((edge) => edge.node) ??
      [];
    response.stealsLeaders =
      matchLeadersStatsData?.stealsLeaders.edges.map((edge) => edge.node) ?? [];
    response.blocksLeaders =
      matchLeadersStatsData?.blocksLeaders.edges.map((edge) => edge.node) ?? [];
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
      {isCompletedMatchForUi(
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
      {isScheduledMatchPageStatus(
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
    </>
  );
}
