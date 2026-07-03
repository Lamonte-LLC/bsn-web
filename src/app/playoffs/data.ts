// Shared playoffs dummy data + types. Lives outside the client so server
// components (hero) and client components (page client) can both consume.

export type SeriesStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
export type Round = 'CUARTOS' | 'GRUPO_FINAL' | 'FINAL';
export type MobileRound = Round;

export type SeriesTeam = { code: string; name: string; seed: number; wins: number };

export type Game = {
  gameNumber: number;
  homeCode: string;
  visitorCode: string;
  homeScore: number | null;
  visitorScore: number | null;
  date: string;
  status: 'UPCOMING' | 'COMPLETED';
  matchId?: string;
};

export type Series = {
  id: string;
  round: Round;
  group: 'A' | 'B' | null;
  conferenceLabel?: string;
  team1: SeriesTeam;
  team2: SeriesTeam;
  status: SeriesStatus;
  nextGame?: { date: string; time: string; venue: string };
  games: Game[];
};

export const TEAM_COLOR: Record<string, string> = {
  SGE: '#F75400', SCE: '#FA4515', ARE: '#FFB900', CAG: '#DDB7E7',
  CAR: '#FEC200', MAY: '#F5E0BF', PON: '#B82027', GBO: '#245AA3',
  MAN: '#347CAF', QUE: '#F9170C', AGU: '#67CA59', BAY: '#468AD9',
};

// 2 series ended, 4 in progress, 1 upcoming (Final BSN).
export const SERIES_DATA: Series[] = [
  // Cuartos de Final — 2 ENDED
  {
    id: 'A-Q1', round: 'CUARTOS', group: 'A', conferenceLabel: 'Cuartos de Final',
    team1: { code: 'BAY', name: 'Vaqueros', seed: 1, wins: 4 },
    team2: { code: 'GBO', name: 'Mets', seed: 8, wins: 0 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'BAY', visitorCode: 'GBO', homeScore: 102, visitorScore: 81, date: 'Abr 5',  status: 'COMPLETED', matchId: '10001' },
      { gameNumber: 2, homeCode: 'BAY', visitorCode: 'GBO', homeScore: 95,  visitorScore: 78, date: 'Abr 7',  status: 'COMPLETED', matchId: '10002' },
      { gameNumber: 3, homeCode: 'GBO', visitorCode: 'BAY', homeScore: 84,  visitorScore: 99, date: 'Abr 9',  status: 'COMPLETED', matchId: '10003' },
      { gameNumber: 4, homeCode: 'GBO', visitorCode: 'BAY', homeScore: 76,  visitorScore: 88, date: 'Abr 11', status: 'COMPLETED', matchId: '10004' },
    ],
  },
  {
    id: 'B-Q1', round: 'CUARTOS', group: 'B', conferenceLabel: 'Cuartos de Final',
    team1: { code: 'CAG', name: 'Criollos', seed: 2, wins: 4 },
    team2: { code: 'MAN', name: 'Osos',     seed: 7, wins: 1 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'CAG', visitorCode: 'MAN', homeScore: 99,  visitorScore: 78, date: 'Abr 5',  status: 'COMPLETED', matchId: '10011' },
      { gameNumber: 2, homeCode: 'CAG', visitorCode: 'MAN', homeScore: 86,  visitorScore: 90, date: 'Abr 7',  status: 'COMPLETED', matchId: '10012' },
      { gameNumber: 3, homeCode: 'MAN', visitorCode: 'CAG', homeScore: 82,  visitorScore: 95, date: 'Abr 9',  status: 'COMPLETED', matchId: '10013' },
      { gameNumber: 4, homeCode: 'MAN', visitorCode: 'CAG', homeScore: 79,  visitorScore: 88, date: 'Abr 11', status: 'COMPLETED', matchId: '10014' },
      { gameNumber: 5, homeCode: 'CAG', visitorCode: 'MAN', homeScore: 101, visitorScore: 91, date: 'Abr 13', status: 'COMPLETED', matchId: '10015' },
    ],
  },
  // Cuartos de Final — 2 IN PROGRESS
  {
    id: 'A-Q2', round: 'CUARTOS', group: 'A', conferenceLabel: 'Cuartos de Final',
    team1: { code: 'CAR', name: 'Gigantes', seed: 4, wins: 2 },
    team2: { code: 'PON', name: 'Leones',   seed: 5, wins: 4 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'CAR', visitorCode: 'PON', homeScore: 90, visitorScore: 88, date: 'Abr 5',  status: 'COMPLETED', matchId: '10005' },
      { gameNumber: 2, homeCode: 'CAR', visitorCode: 'PON', homeScore: 78, visitorScore: 92, date: 'Abr 7',  status: 'COMPLETED', matchId: '10006' },
      { gameNumber: 3, homeCode: 'PON', visitorCode: 'CAR', homeScore: 95, visitorScore: 84, date: 'Abr 9',  status: 'COMPLETED', matchId: '10007' },
      { gameNumber: 4, homeCode: 'PON', visitorCode: 'CAR', homeScore: 88, visitorScore: 91, date: 'Abr 11', status: 'COMPLETED', matchId: '10008' },
      { gameNumber: 5, homeCode: 'CAR', visitorCode: 'PON', homeScore: 79, visitorScore: 93, date: 'Abr 13', status: 'COMPLETED', matchId: '10009' },
      { gameNumber: 6, homeCode: 'PON', visitorCode: 'CAR', homeScore: 102, visitorScore: 88, date: 'Abr 15', status: 'COMPLETED', matchId: '10010' },
    ],
  },
  {
    id: 'B-Q2', round: 'CUARTOS', group: 'B', conferenceLabel: 'Cuartos de Final',
    team1: { code: 'SGE', name: 'Atléticos', seed: 3, wins: 3 },
    team2: { code: 'MAY', name: 'Indios',    seed: 6, wins: 3 },
    status: 'IN_PROGRESS',
    games: [
      { gameNumber: 1, homeCode: 'SGE', visitorCode: 'MAY', homeScore: 88, visitorScore: 85, date: 'Abr 5',  status: 'COMPLETED', matchId: '10016' },
      { gameNumber: 2, homeCode: 'SGE', visitorCode: 'MAY', homeScore: 81, visitorScore: 92, date: 'Abr 7',  status: 'COMPLETED', matchId: '10017' },
      { gameNumber: 3, homeCode: 'MAY', visitorCode: 'SGE', homeScore: 90, visitorScore: 87, date: 'Abr 9',  status: 'COMPLETED', matchId: '10018' },
      { gameNumber: 4, homeCode: 'MAY', visitorCode: 'SGE', homeScore: 82, visitorScore: 94, date: 'Abr 11', status: 'COMPLETED', matchId: '10019' },
      { gameNumber: 5, homeCode: 'SGE', visitorCode: 'MAY', homeScore: 88, visitorScore: 83, date: 'Abr 13', status: 'COMPLETED', matchId: '10020' },
      { gameNumber: 6, homeCode: 'MAY', visitorCode: 'SGE', homeScore: 91, visitorScore: 86, date: 'Abr 15', status: 'COMPLETED', matchId: '10021' },
    ],
  },
  // Final de Conferencia — both IN PROGRESS
  {
    id: 'A-GF', round: 'GRUPO_FINAL', group: 'A', conferenceLabel: 'Final de Conferencia',
    team1: { code: 'BAY', name: 'Vaqueros', seed: 1, wins: 3 },
    team2: { code: 'PON', name: 'Leones',   seed: 5, wins: 1 },
    status: 'IN_PROGRESS',
    games: [
      { gameNumber: 1, homeCode: 'BAY', visitorCode: 'PON', homeScore: 95,  visitorScore: 82, date: 'Abr 23', status: 'COMPLETED', matchId: '10023' },
      { gameNumber: 2, homeCode: 'BAY', visitorCode: 'PON', homeScore: 78,  visitorScore: 89, date: 'Abr 25', status: 'COMPLETED', matchId: '10024' },
      { gameNumber: 3, homeCode: 'PON', visitorCode: 'BAY', homeScore: 84,  visitorScore: 92, date: 'Abr 26', status: 'COMPLETED', matchId: '10025' },
      { gameNumber: 4, homeCode: 'PON', visitorCode: 'BAY', homeScore: 77,  visitorScore: 88, date: 'Abr 27', status: 'COMPLETED', matchId: '10026' },
    ],
  },
  // B-GF: Criollos advanced; opponent TBD until B-Q2 (SGE vs MAY) finishes.
  {
    id: 'B-GF', round: 'GRUPO_FINAL', group: 'B', conferenceLabel: 'Final de Conferencia',
    team1: { code: 'CAG', name: 'Criollos',  seed: 2, wins: 0 },
    team2: { code: '',    name: 'Por definir', seed: 0, wins: 0 },
    status: 'UPCOMING',
    games: [],
  },
  // Final BSN — UPCOMING (waiting on both conference finals).
  {
    id: 'FINAL', round: 'FINAL', group: null, conferenceLabel: 'Final BSN',
    team1: { code: '', name: 'Ganador SF1', seed: 0, wins: 0 },
    team2: { code: '', name: 'Ganador SF2', seed: 0, wins: 0 },
    status: 'UPCOMING',
    games: [],
  },
];

export const MOBILE_ROUNDS: { key: MobileRound; label: string }[] = [
  { key: 'CUARTOS',     label: 'Cuartos' },
  { key: 'GRUPO_FINAL', label: 'Final Conf.' },
  { key: 'FINAL',       label: 'Final BSN' },
];
