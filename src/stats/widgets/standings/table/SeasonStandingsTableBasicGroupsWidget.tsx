import { getClient } from '@/apollo-client';
import { STANDINGS_TABLE_BASIC } from '@/graphql/stats';
import SeasonStandingsTableBasicGroups from '@/stats/client/components/standings/SeasonStandingsTableBasicGroups';

type StandingsGroupTeam = {
  nickname: string;
  code: string;
  competitionStandings: {
    won: number;
    lost: number;
    percentageWon: number;
    homeWins: number;
    homeLosses: number;
    awayWins: number;
    awayLosses: number;
  };
};

type StandingsGroup = {
  name: string;
  teams: StandingsGroupTeam[];
};

type StandingsTableBasicResponse = {
  standings: {
    groups: StandingsGroup[];
  };
};

const ZERO_STANDINGS = { won: 0, lost: 0, percentageWon: 0 };

const TEAM_NICKNAMES: Record<string, string> = {
  AGU: 'Santeros',
  ARE: 'Capitanes',
  CAG: 'Criollos',
  CAR: 'Gigantes',
  SGE: 'Atléticos',
  PON: 'Leones',
  BAY: 'Vaqueros',
  GBO: 'Mets',
  MAN: 'Osos',
  MAY: 'Indios',
  QUE: 'Piratas',
  SCE: 'Cangrejeros',
};

const FALLBACK_GROUPS: StandingsGroup[] = [
  {
    name: 'Grupo A',
    teams: ['AGU', 'ARE', 'CAG', 'CAR', 'SGE', 'PON'].map((code) => ({
      code,
      nickname: TEAM_NICKNAMES[code],
      competitionStandings: { ...ZERO_STANDINGS, homeWins: 0, homeLosses: 0, awayWins: 0, awayLosses: 0 },
    })),
  },
  {
    name: 'Grupo B',
    teams: ['BAY', 'GBO', 'MAN', 'MAY', 'QUE', 'SCE'].map((code) => ({
      code,
      nickname: TEAM_NICKNAMES[code],
      competitionStandings: { ...ZERO_STANDINGS, homeWins: 0, homeLosses: 0, awayWins: 0, awayLosses: 0 },
    })),
  },
];

const fetchSeasonStandingsTableBasicGroups = async (): Promise<
  StandingsGroup[]
> => {
  const { data, error } = await getClient().query<StandingsTableBasicResponse>({
    query: STANDINGS_TABLE_BASIC,
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.standings.groups ?? [];
};

const mapGroup = (group: StandingsGroup) => ({
  name: group.name,
  teams: group.teams.map((team) => ({
    team: { code: team.code, nickname: team.nickname },
    pg: team.competitionStandings.won,
    pp: team.competitionStandings.lost,
    pct: team.competitionStandings.percentageWon,
  })),
});

export default async function SeasonStandingsTableBasicGroupsWidget() {
  const data: StandingsGroup[] = await fetchSeasonStandingsTableBasicGroups();
  const hasData = data.length > 0 && data.some((g) => g.teams.length > 0);
  const groups = (hasData ? data : FALLBACK_GROUPS).map(mapGroup);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 rounded-[12px] bg-white sm:border sm:border-[#EAEAEA] sm:shadow-[0px_1px_3px_0px_#14181F0A]">
        <div className="sm:p-[16px] xl:p-[24px]">
          <SeasonStandingsTableBasicGroups groups={groups} />
        </div>
      </div>
    </div>
  );
}
