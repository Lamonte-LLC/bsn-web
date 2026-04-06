import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import {
  useMatchTeamAggregateBoxscore,
  useMatchTeamPlayersBoxscore,
  type MatchPlayerBoxscoreFields,
  type MatchTeamAggregateBoxscore,
} from '../hooks/matches';
import numeral from 'numeral';
import Link from 'next/link';
import { useMemo } from 'react';

/** # + jugador + 20 stats (Figma 1538:23603). */
const COL_COUNT = 22;
const STAT_COL_COUNT = 20;

const STAT_HEADERS = [
  'MIN',
  'PTS',
  'FG',
  'FG%',
  '2P',
  '2P%',
  '3P',
  '3P%',
  'FT',
  'FT%',
  'OFF',
  'DEF',
  'REB',
  'AST',
  'TO',
  'STL',
  'BLK',
  'PF',
  'fls on',
  '+/-',
] as const;

// ---------------------------------------------------------------------------
// TODO(remove): Placeholder box score — delete this block when done testing.
// ---------------------------------------------------------------------------
const USE_PLACEHOLDER_BOXSCORE_PLAYERS = false;

type BoxscoreTableRow = {
  player: {
    providerId: string;
    avatarUrl?: string | null;
    name: string;
    nickname: string;
    shirtNumber: string;
    playingPosition: string;
  };
  boxscore: MatchPlayerBoxscoreFields;
};

type Props = {
  matchProviderId: string;
  teamProviderId: string;
  usePolling?: boolean;
  /** Parent fetched both teams in one query; skips per-tab player `useQuery`. */
  batchedPlayers?: BoxscoreTableRow[];
  batchedPlayersLoading?: boolean;
  /** Parent `MATCH_TABBED_BOXSCORE_PANEL`: skip aggregate `useQuery` for this tab. */
  importSharedAggregate?: boolean;
  /** Team totals + extended metrics from parent (nullable when match row exists but box empty). */
  sharedTeamAggregate?: MatchTeamAggregateBoxscore | null;
};

const _pbDefaults: MatchPlayerBoxscoreFields = {
  minutes: 0,
  points: 0,
  reboundsTotal: 0,
  offensiveRebounds: 0,
  defensiveRebounds: 0,
  assists: 0,
  fieldGoalsMade: 0,
  fieldGoalsAttempted: 0,
  fieldGoalsPercentage: 0,
  threePointersMade: 0,
  threePointersAttempted: 0,
  threePointersPercentage: 0,
  twoPointersMade: 0,
  twoPointersAttempted: 0,
  twoPointersPercentage: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  freeThrowsPercentage: 0,
  foulsPersonal: 0,
  foulsDrawn: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  plusMinusPoints: 0,
};

function pb(over: Partial<MatchPlayerBoxscoreFields>): MatchPlayerBoxscoreFields {
  return { ..._pbDefaults, ...over };
}

/** Team row + estadísticas equipo (coherent with placeholder jugadores). */
const PLACEHOLDER_TEAM_AGGREGATE: MatchTeamAggregateBoxscore = {
  fieldGoalsMade: 38,
  fieldGoalsAttempted: 79,
  fieldGoalsPercentage: 38 / 79,
  threePointersMade: 11,
  threePointersAttempted: 28,
  threePointersPercentage: 11 / 28,
  freeThrowsMade: 14,
  freeThrowsAttempted: 18,
  freeThrowsPercentage: 14 / 18,
  offensiveRebounds: 12,
  defensiveRebounds: 31,
  reboundsTotal: 43,
  assists: 24,
  turnovers: 13,
  steals: 8,
  blocks: 5,
  foulsPersonal: 18,
  points: 101,
  twoPointersMade: 27,
  twoPointersAttempted: 51,
  twoPointersPercentage: 27 / 51,
  pointsFromTurnover: 15,
  pointsInThePaint: 42,
  pointsSecondChance: 11,
  pointsFastBreak: 9,
  pointsFromBench: 28,
  biggestLead: 14,
  biggestScoringRun: 10,
};

const PLACEHOLDER_PLAYER_ROWS: BoxscoreTableRow[] = [
  {
    player: {
      providerId: '__placeholder_p01__',
      avatarUrl: null,
      name: 'Placeholder Base',
      nickname: 'P.Base',
      shirtNumber: '4',
      playingPosition: 'G',
    },
    boxscore: pb({
      minutes: 34.2,
      points: 22,
      fieldGoalsMade: 8,
      fieldGoalsAttempted: 15,
      fieldGoalsPercentage: 8 / 15,
      twoPointersMade: 5,
      twoPointersAttempted: 9,
      twoPointersPercentage: 5 / 9,
      threePointersMade: 3,
      threePointersAttempted: 6,
      threePointersPercentage: 3 / 6,
      freeThrowsMade: 3,
      freeThrowsAttempted: 4,
      freeThrowsPercentage: 3 / 4,
      offensiveRebounds: 1,
      defensiveRebounds: 4,
      reboundsTotal: 5,
      assists: 7,
      turnovers: 2,
      steals: 1,
      blocks: 0,
      foulsPersonal: 2,
      foulsDrawn: 4,
      plusMinusPoints: 12,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p02__',
      avatarUrl: null,
      name: 'Placeholder Escolta',
      nickname: 'P.Esc',
      shirtNumber: '7',
      playingPosition: 'G',
    },
    boxscore: pb({
      minutes: 31.5,
      points: 18,
      fieldGoalsMade: 6,
      fieldGoalsAttempted: 14,
      fieldGoalsPercentage: 6 / 14,
      twoPointersMade: 3,
      twoPointersAttempted: 7,
      twoPointersPercentage: 3 / 7,
      threePointersMade: 3,
      threePointersAttempted: 7,
      threePointersPercentage: 3 / 7,
      freeThrowsMade: 3,
      freeThrowsAttempted: 3,
      freeThrowsPercentage: 1,
      offensiveRebounds: 0,
      defensiveRebounds: 3,
      reboundsTotal: 3,
      assists: 4,
      turnovers: 1,
      steals: 2,
      blocks: 0,
      foulsPersonal: 3,
      foulsDrawn: 2,
      plusMinusPoints: 5,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p03__',
      avatarUrl: null,
      name: 'Placeholder Alero',
      nickname: 'P.Ale',
      shirtNumber: '23',
      playingPosition: 'F',
    },
    boxscore: pb({
      minutes: 29.8,
      points: 14,
      fieldGoalsMade: 5,
      fieldGoalsAttempted: 11,
      fieldGoalsPercentage: 5 / 11,
      twoPointersMade: 4,
      twoPointersAttempted: 8,
      twoPointersPercentage: 4 / 8,
      threePointersMade: 1,
      threePointersAttempted: 3,
      threePointersPercentage: 1 / 3,
      freeThrowsMade: 3,
      freeThrowsAttempted: 4,
      freeThrowsPercentage: 3 / 4,
      offensiveRebounds: 2,
      defensiveRebounds: 6,
      reboundsTotal: 8,
      assists: 2,
      turnovers: 2,
      steals: 1,
      blocks: 1,
      foulsPersonal: 2,
      foulsDrawn: 1,
      plusMinusPoints: 3,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p04__',
      avatarUrl: null,
      name: 'Placeholder Ala-pívot',
      nickname: 'P.AP',
      shirtNumber: '11',
      playingPosition: 'F',
    },
    boxscore: pb({
      minutes: 27.1,
      points: 11,
      fieldGoalsMade: 4,
      fieldGoalsAttempted: 9,
      fieldGoalsPercentage: 4 / 9,
      twoPointersMade: 3,
      twoPointersAttempted: 6,
      twoPointersPercentage: 3 / 6,
      threePointersMade: 1,
      threePointersAttempted: 3,
      threePointersPercentage: 1 / 3,
      freeThrowsMade: 2,
      freeThrowsAttempted: 2,
      freeThrowsPercentage: 1,
      offensiveRebounds: 3,
      defensiveRebounds: 5,
      reboundsTotal: 8,
      assists: 3,
      turnovers: 1,
      steals: 0,
      blocks: 2,
      foulsPersonal: 4,
      foulsDrawn: 0,
      plusMinusPoints: -2,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p05__',
      avatarUrl: null,
      name: 'Placeholder Pívot',
      nickname: 'P.Pív',
      shirtNumber: '33',
      playingPosition: 'C',
    },
    boxscore: pb({
      minutes: 24.6,
      points: 9,
      fieldGoalsMade: 4,
      fieldGoalsAttempted: 7,
      fieldGoalsPercentage: 4 / 7,
      twoPointersMade: 4,
      twoPointersAttempted: 7,
      twoPointersPercentage: 4 / 7,
      threePointersMade: 0,
      threePointersAttempted: 0,
      threePointersPercentage: 0,
      freeThrowsMade: 1,
      freeThrowsAttempted: 2,
      freeThrowsPercentage: 1 / 2,
      offensiveRebounds: 4,
      defensiveRebounds: 7,
      reboundsTotal: 11,
      assists: 1,
      turnovers: 2,
      steals: 0,
      blocks: 3,
      foulsPersonal: 3,
      foulsDrawn: 2,
      plusMinusPoints: 1,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p06__',
      avatarUrl: null,
      name: 'Placeholder Banca 1',
      nickname: 'P.B1',
      shirtNumber: '2',
      playingPosition: 'G',
    },
    boxscore: pb({
      minutes: 16.4,
      points: 10,
      fieldGoalsMade: 4,
      fieldGoalsAttempted: 8,
      fieldGoalsPercentage: 4 / 8,
      twoPointersMade: 2,
      twoPointersAttempted: 4,
      twoPointersPercentage: 2 / 4,
      threePointersMade: 2,
      threePointersAttempted: 4,
      threePointersPercentage: 2 / 4,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      freeThrowsPercentage: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 2,
      reboundsTotal: 2,
      assists: 3,
      turnovers: 1,
      steals: 1,
      blocks: 0,
      foulsPersonal: 1,
      foulsDrawn: 1,
      plusMinusPoints: 4,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p07__',
      avatarUrl: null,
      name: 'Placeholder Banca 2',
      nickname: 'P.B2',
      shirtNumber: '15',
      playingPosition: 'F',
    },
    boxscore: pb({
      minutes: 12.8,
      points: 6,
      fieldGoalsMade: 2,
      fieldGoalsAttempted: 5,
      fieldGoalsPercentage: 2 / 5,
      twoPointersMade: 1,
      twoPointersAttempted: 2,
      twoPointersPercentage: 1 / 2,
      threePointersMade: 1,
      threePointersAttempted: 3,
      threePointersPercentage: 1 / 3,
      freeThrowsMade: 1,
      freeThrowsAttempted: 2,
      freeThrowsPercentage: 1 / 2,
      offensiveRebounds: 1,
      defensiveRebounds: 1,
      reboundsTotal: 2,
      assists: 0,
      turnovers: 0,
      steals: 0,
      blocks: 0,
      foulsPersonal: 2,
      foulsDrawn: 0,
      plusMinusPoints: -1,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p08__',
      avatarUrl: null,
      name: 'Placeholder Banca 3',
      nickname: 'P.B3',
      shirtNumber: '21',
      playingPosition: 'C',
    },
    boxscore: pb({
      minutes: 8.2,
      points: 4,
      fieldGoalsMade: 2,
      fieldGoalsAttempted: 3,
      fieldGoalsPercentage: 2 / 3,
      twoPointersMade: 2,
      twoPointersAttempted: 3,
      twoPointersPercentage: 2 / 3,
      threePointersMade: 0,
      threePointersAttempted: 0,
      threePointersPercentage: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      freeThrowsPercentage: 0,
      offensiveRebounds: 1,
      defensiveRebounds: 3,
      reboundsTotal: 4,
      assists: 1,
      turnovers: 1,
      steals: 0,
      blocks: 1,
      foulsPersonal: 1,
      foulsDrawn: 1,
      plusMinusPoints: 0,
    }),
  },
  {
    player: {
      providerId: '__placeholder_p09__',
      avatarUrl: null,
      name: 'Placeholder DNP 1',
      nickname: 'P.D1',
      shirtNumber: '9',
      playingPosition: 'G',
    },
    boxscore: pb({ minutes: 0 }),
  },
  {
    player: {
      providerId: '__placeholder_p10__',
      avatarUrl: null,
      name: 'Placeholder DNP 2',
      nickname: 'P.D2',
      shirtNumber: '14',
      playingPosition: 'F',
    },
    boxscore: pb({ minutes: 0 }),
  },
];
// ---------------------------------------------------------------------------
// End TODO(remove) placeholder block
// ---------------------------------------------------------------------------

type BoxscoreTwoPointFields = Pick<
  MatchPlayerBoxscoreFields,
  | 'twoPointersMade'
  | 'twoPointersAttempted'
  | 'twoPointersPercentage'
  | 'fieldGoalsMade'
  | 'fieldGoalsAttempted'
  | 'threePointersMade'
  | 'threePointersAttempted'
>;

function effectiveTwoPointLine(b: BoxscoreTwoPointFields) {
  const made =
    b.twoPointersMade ||
    Math.max(0, b.fieldGoalsMade - b.threePointersMade);
  const att =
    b.twoPointersAttempted ||
    Math.max(0, b.fieldGoalsAttempted - b.threePointersAttempted);
  const pct =
    att > 0 ? made / att : b.twoPointersPercentage || 0;
  return { made, att, pct };
}

/** Figma: minutos como `20:57` (decimal de minutos → mm:ss). */
function fmtMinutesPlayed(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '0:00';
  }
  const totalSec = Math.round(minutes * 60);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

/** Nombre corto tipo `D. Galinari` (misma línea que Figma). */
function formatAbbrevPlayerName(fullName: string): string {
  const t = fullName.trim();
  if (!t) {
    return '';
  }
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const initial = first[0]?.toUpperCase() ?? '';
  return `${initial}. ${last}`;
}

function fmtMadeAtt(made: number, att: number): string {
  const m = Number.isFinite(made) ? made : 0;
  const a = Number.isFinite(att) ? att : 0;
  return `${numeral(m).format('0')}-${numeral(a).format('0')}`;
}

/** Porcentajes en celdas: solo entero (el `%` va solo en cabeceras; Figma). */
function fmtPctInt(ratio: number, attempts: number): string {
  if (!Number.isFinite(attempts) || attempts <= 0) {
    return '0';
  }
  return String(Math.round((Number.isFinite(ratio) ? ratio : 0) * 100));
}

function fmtPlusMinus(n: number): string {
  if (!Number.isFinite(n)) {
    return '0';
  }
  if (n > 0) {
    return `+${numeral(n).format('0')}`;
  }
  return numeral(n).format('0');
}

function jerseyDisplay(shirtNumber: string | number | undefined | null): string {
  if (shirtNumber == null) {
    return '–';
  }
  const s = String(shirtNumber).trim();
  return s.length > 0 ? s : '–';
}

/** Sum player lines into team totals; percentages from summed made/attempted. */
function computeAggregateFromPlayerRows(
  rows: BoxscoreTableRow[],
): MatchTeamAggregateBoxscore | null {
  if (rows.length === 0) {
    return null;
  }
  let fgM = 0;
  let fgA = 0;
  let tpM = 0;
  let tpA = 0;
  let ftM = 0;
  let ftA = 0;
  let orb = 0;
  let drb = 0;
  let reb = 0;
  let ast = 0;
  let to = 0;
  let stl = 0;
  let blk = 0;
  let pf = 0;
  let pts = 0;
  for (const { boxscore: b } of rows) {
    fgM += b.fieldGoalsMade ?? 0;
    fgA += b.fieldGoalsAttempted ?? 0;
    tpM += b.threePointersMade ?? 0;
    tpA += b.threePointersAttempted ?? 0;
    ftM += b.freeThrowsMade ?? 0;
    ftA += b.freeThrowsAttempted ?? 0;
    orb += b.offensiveRebounds ?? 0;
    drb += b.defensiveRebounds ?? 0;
    reb += b.reboundsTotal ?? 0;
    ast += b.assists ?? 0;
    to += b.turnovers ?? 0;
    stl += b.steals ?? 0;
    blk += b.blocks ?? 0;
    pf += b.foulsPersonal ?? 0;
    pts += b.points ?? 0;
  }
  const twoM = Math.max(0, fgM - tpM);
  const twoA = Math.max(0, fgA - tpA);
  return {
    fieldGoalsMade: fgM,
    fieldGoalsAttempted: fgA,
    fieldGoalsPercentage: fgA > 0 ? fgM / fgA : 0,
    threePointersMade: tpM,
    threePointersAttempted: tpA,
    threePointersPercentage: tpA > 0 ? tpM / tpA : 0,
    freeThrowsMade: ftM,
    freeThrowsAttempted: ftA,
    freeThrowsPercentage: ftA > 0 ? ftM / ftA : 0,
    offensiveRebounds: orb,
    defensiveRebounds: drb,
    reboundsTotal: reb,
    assists: ast,
    turnovers: to,
    steals: stl,
    blocks: blk,
    foulsPersonal: pf,
    points: pts,
    twoPointersMade: twoM,
    twoPointersAttempted: twoA,
    twoPointersPercentage: twoA > 0 ? twoM / twoA : 0,
    pointsFromTurnover: 0,
    pointsInThePaint: 0,
    pointsSecondChance: 0,
    pointsFastBreak: 0,
    pointsFromBench: 0,
    biggestLead: 0,
    biggestScoringRun: 0,
  };
}

function sumMinutesFoulsDrawnPlusMinus(rows: BoxscoreTableRow[]) {
  let minutes = 0;
  let foulsDrawn = 0;
  let plusMinus = 0;
  for (const r of rows) {
    minutes += Number(r.boxscore.minutes) || 0;
    foulsDrawn += r.boxscore.foulsDrawn ?? 0;
    plusMinus += r.boxscore.plusMinusPoints ?? 0;
  }
  return { minutes, foulsDrawn, plusMinus };
}

function mergeTeamBoxWithPlayerComputed(
  api: MatchTeamAggregateBoxscore | null,
  computed: MatchTeamAggregateBoxscore | null,
): MatchTeamAggregateBoxscore | null {
  if (!computed && !api) {
    return null;
  }
  if (!computed) {
    return api;
  }
  if (!api) {
    return computed;
  }
  const diffPts = Math.abs((api.points ?? 0) - (computed.points ?? 0));
  const apiLooksEmpty =
    (api.points ?? 0) === 0 && (computed.points ?? 0) > 0;
  if (!apiLooksEmpty && diffPts <= 2) {
    return api;
  }
  return {
    ...computed,
    pointsFromTurnover: api.pointsFromTurnover ?? 0,
    pointsInThePaint: api.pointsInThePaint ?? 0,
    pointsSecondChance: api.pointsSecondChance ?? 0,
    pointsFastBreak: api.pointsFastBreak ?? 0,
    pointsFromBench: api.pointsFromBench ?? 0,
    biggestLead: api.biggestLead ?? 0,
    biggestScoringRun: api.biggestScoringRun ?? 0,
  };
}

/** Figma: filas de jugador sobre blanco; solo líneas horizontales. */
function dataRowBg(): string {
  return '#ffffff';
}

const TOTALS_ROW_BG = 'rgba(239, 239, 239, 0.9)';

const tableBorder = 'border-[rgba(0,0,0,0.1)]';

const statHeaderClass =
  'font-special-gothic-condensed-one text-[13px] font-normal uppercase leading-[1.4] tracking-[1.17px] text-[rgba(0,0,0,0.8)]';

const statBodyText =
  'font-barlow text-[13px] font-normal leading-[1.4] tracking-[0.26px] text-black';

/** Filas jugador: alto 42.5px (capa Figma); padding ~9px respecto al marco. */
const rowCell = `h-[42.5px] min-h-[42.5px] align-middle border-b ${tableBorder} px-[9px] py-0 box-border bg-white`;

const theadCell = `h-[42.5px] min-h-[42.5px] align-middle border-b ${tableBorder} bg-[rgba(247,247,247,0.9)] px-[9px] py-0`;

const totalsRowCell = `h-[44px] min-h-[44px] align-middle border-b ${tableBorder} px-[9px] py-0 box-border`;

const sectionLabelRow =
  `border-b ${tableBorder} bg-white text-left align-bottom px-[9px] pt-5 pb-2`;

function PlayerStatCells({
  b,
  bg,
}: {
  b: MatchPlayerBoxscoreFields;
  bg: string;
}) {
  const two = effectiveTwoPointLine(b);
  const cell = `${rowCell} text-center`;
  const fgAtt = b.fieldGoalsAttempted ?? 0;
  const tpAtt = b.threePointersAttempted ?? 0;
  const ftAtt = b.freeThrowsAttempted ?? 0;
  return (
    <>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${statBodyText} tabular-nums whitespace-nowrap`}>
          {fmtMinutesPlayed(b.minutes)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${statBodyText} tabular-nums`}>
          {numeral(b.points ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtMadeAtt(b.fieldGoalsMade, b.fieldGoalsAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtPctInt(b.fieldGoalsPercentage, fgAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtMadeAtt(two.made, two.att)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtPctInt(two.pct, two.att)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtMadeAtt(b.threePointersMade, b.threePointersAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtPctInt(b.threePointersPercentage, tpAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtMadeAtt(b.freeThrowsMade, b.freeThrowsAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {fmtPctInt(b.freeThrowsPercentage, ftAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.offensiveRebounds ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.defensiveRebounds ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.reboundsTotal ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.assists ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.turnovers ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.steals ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.blocks ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={statBodyText}>
          {numeral(b.foulsPersonal ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${statBodyText} text-[rgba(0,0,0,0.7)]`}>
          {numeral(b.foulsDrawn ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${statBodyText} text-[rgba(0,0,0,0.7)] tabular-nums`}>
          {fmtPlusMinus(b.plusMinusPoints ?? 0)}
        </span>
      </td>
    </>
  );
}

function TotalsStatCells({
  t,
  bg,
  totalMinutes,
  sumFoulsDrawn,
  sumPlusMinus,
}: {
  t: MatchTeamAggregateBoxscore;
  bg: string;
  totalMinutes: number;
  sumFoulsDrawn: number;
  sumPlusMinus: number;
}) {
  const cell = `${totalsRowCell} text-center font-semibold`;
  const totalsText = `${statBodyText} font-semibold`;
  const two = effectiveTwoPointLine(t);
  const fgAtt = t.fieldGoalsAttempted ?? 0;
  const tpAtt = t.threePointersAttempted ?? 0;
  const ftAtt = t.freeThrowsAttempted ?? 0;
  return (
    <>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${totalsText} tabular-nums whitespace-nowrap`}>
          {fmtMinutesPlayed(totalMinutes)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${totalsText} tabular-nums`}>
          {numeral(t.points ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtMadeAtt(t.fieldGoalsMade, t.fieldGoalsAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtPctInt(t.fieldGoalsPercentage, fgAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtMadeAtt(two.made, two.att)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtPctInt(two.pct, two.att)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtMadeAtt(t.threePointersMade, t.threePointersAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtPctInt(t.threePointersPercentage, tpAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtMadeAtt(t.freeThrowsMade, t.freeThrowsAttempted)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {fmtPctInt(t.freeThrowsPercentage, ftAtt)}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.offensiveRebounds ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.defensiveRebounds ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.reboundsTotal ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.assists ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.turnovers ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.steals ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.blocks ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={totalsText}>
          {numeral(t.foulsPersonal ?? 0).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${totalsText} text-[rgba(0,0,0,0.7)]`}>
          {numeral(sumFoulsDrawn).format('0')}
        </span>
      </td>
      <td className={cell} style={{ backgroundColor: bg }}>
        <span className={`${totalsText} text-[rgba(0,0,0,0.7)] tabular-nums`}>
          {fmtPlusMinus(sumPlusMinus)}
        </span>
      </td>
    </>
  );
}

function TeamStatsStrip({ team }: { team: MatchTeamAggregateBoxscore }) {
  const cards: { label: string; value: number }[] = [
    { label: 'Puntos de pérdidas', value: team.pointsFromTurnover },
    { label: 'Puntos en la pintura', value: team.pointsInThePaint },
    { label: 'Puntos de segunda oportunidad', value: team.pointsSecondChance },
    { label: 'Puntos en contraataque', value: team.pointsFastBreak },
    { label: 'Puntos de la banca', value: team.pointsFromBench },
    { label: 'Mayor ventaja', value: team.biggestLead },
    { label: 'Mayor parcial', value: team.biggestScoringRun },
  ];

  const hasExtendedStats = cards.some(
    ({ value }) => Number.isFinite(value) && value !== 0,
  );
  if (!hasExtendedStats) {
    return null;
  }

  return (
    <div className="mt-8 px-1">
      <h4 className="mb-4 text-left font-special-gothic-condensed-one text-[13px] font-normal uppercase leading-[1.4] tracking-[1.17px] text-[rgba(0,0,0,0.7)]">
        Estadísticas equipo
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[12px] border border-[rgba(0,0,0,0.1)] border-solid bg-[rgba(213,213,213,0.1)] px-4 py-4 text-left"
          >
            <p className="font-barlow-condensed text-[16px] font-normal leading-[1.2] tracking-[0.16px] text-[rgba(0,0,0,0.7)]">
              {label}
            </p>
            <p className="mt-2 font-special-gothic-condensed-one text-[27px] font-normal leading-[25px] tracking-[0.27px] text-[rgba(0,0,0,0.8)] tabular-nums">
              {numeral(value).format('0')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchTeamBoxScoreWidget({
  matchProviderId,
  teamProviderId,
  usePolling = false,
  batchedPlayers,
  batchedPlayersLoading,
  importSharedAggregate = false,
  sharedTeamAggregate,
}: Props) {
  const useBatched = batchedPlayers !== undefined;
  const { data, loading: playersLoading } = useMatchTeamPlayersBoxscore(
    matchProviderId,
    teamProviderId,
    useBatched ? false : usePolling,
    { skip: useBatched },
  );
  const { teamBox: fetchedTeamBox } = useMatchTeamAggregateBoxscore(
    matchProviderId,
    teamProviderId,
    usePolling,
    { skip: importSharedAggregate },
  );
  const teamBox = importSharedAggregate
    ? (sharedTeamAggregate ?? null)
    : fetchedTeamBox;

  const tableRows: BoxscoreTableRow[] = USE_PLACEHOLDER_BOXSCORE_PLAYERS
    ? PLACEHOLDER_PLAYER_ROWS
    : useBatched
      ? batchedPlayers
      : data;

  const computedFromPlayers = useMemo(
    () =>
      USE_PLACEHOLDER_BOXSCORE_PLAYERS
        ? null
        : computeAggregateFromPlayerRows(tableRows),
    [tableRows],
  );

  const rollup = useMemo(
    () => sumMinutesFoulsDrawnPlusMinus(tableRows),
    [tableRows],
  );

  const aggregateForTotals: MatchTeamAggregateBoxscore | null = useMemo(() => {
    if (USE_PLACEHOLDER_BOXSCORE_PLAYERS) {
      return PLACEHOLDER_TEAM_AGGREGATE;
    }
    return mergeTeamBoxWithPlayerComputed(teamBox, computedFromPlayers);
  }, [teamBox, computedFromPlayers]);

  const { starters, bench } = useMemo(() => {
    const sorted = [...tableRows].sort(
      (a, b) => Number(b.boxscore.minutes) - Number(a.boxscore.minutes),
    );
    const played = sorted.filter((r) => Number(r.boxscore.minutes) > 0);
    const streamMarkedStarters = tableRows.some(
      (r) => r.boxscore.isStarter === true,
    );
    const starterIds = new Set<string>();
    if (streamMarkedStarters) {
      for (const r of tableRows) {
        if (r.boxscore.isStarter === true) {
          starterIds.add(r.player.providerId);
        }
      }
    } else {
      for (const r of played.slice(0, 5)) {
        starterIds.add(r.player.providerId);
      }
    }
    const startersList = sorted.filter((r) => starterIds.has(r.player.providerId));
    const benchList = sorted.filter((r) => !starterIds.has(r.player.providerId));
    return { starters: startersList, bench: benchList };
  }, [tableRows]);

  const loading =
    !USE_PLACEHOLDER_BOXSCORE_PLAYERS &&
    (useBatched ? (batchedPlayersLoading ?? false) : playersLoading);

  if (loading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 8 }, (_, i) => (
          <ShimmerLine key={i} height="42.5px" />
        ))}
      </div>
    );
  }

  const renderSectionLabel = (title: string, tone: 'primary' | 'muted' = 'primary') => (
    <tr key={`label-${title}`}>
      <td
        className={`${sectionLabelRow} w-[15px] max-w-[15px]`}
        aria-hidden
      />
      <td colSpan={COL_COUNT - 1} className={sectionLabelRow}>
        <span
          className={`font-special-gothic-condensed-one text-[13px] font-normal uppercase leading-[1.4] tracking-[1.17px] ${
            tone === 'muted' ? 'text-[rgba(0,0,0,0.7)]' : 'text-[rgba(0,0,0,0.8)]'
          }`}
        >
          {title}
        </span>
      </td>
    </tr>
  );

  const renderDnpRow = (item: BoxscoreTableRow, key: string) => {
    const bg = dataRowBg();
    const displayName = formatAbbrevPlayerName(item.player.name);
    return (
      <tr key={key}>
        <td
          className={`${rowCell} w-[15px] max-w-[15px] whitespace-nowrap text-left`}
          style={{ backgroundColor: bg }}
        >
          <span className="inline-block font-barlow text-[13px] leading-none text-[rgba(0,0,0,0.6)]">
            {jerseyDisplay(item.player.shirtNumber)}
          </span>
        </td>
        <td className={`${rowCell} min-w-0 max-w-[220px] text-left`} style={{ backgroundColor: bg }}>
          <div className="flex h-[22px] min-w-0 max-w-[200px] items-center">
            <Link
              href={`/jugadores/${item.player.providerId}`}
              className="min-w-0 shrink truncate font-special-gothic-condensed-one text-[15px] font-normal leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.8)]"
              title={item.player.name}
            >
              {displayName}
            </Link>
          </div>
        </td>
        <td
          colSpan={STAT_COL_COUNT}
          className={`${rowCell} text-left`}
          style={{ backgroundColor: bg }}
        >
          <span className="font-barlow text-[13px] font-normal leading-[1.4] tracking-[0.26px] text-[rgba(0,0,0,0.45)]">
            DNP
          </span>
        </td>
      </tr>
    );
  };

  const renderPlayerRow = (item: BoxscoreTableRow, key: string) => {
    const bg = dataRowBg();
    const b = item.boxscore;
    const pos = (item.player.playingPosition ?? '').trim();
    const displayName = formatAbbrevPlayerName(item.player.name);
    return (
      <tr key={key}>
        <td
          className={`${rowCell} w-[15px] max-w-[15px] whitespace-nowrap text-left`}
          style={{ backgroundColor: bg }}
        >
          <span className="inline-block font-barlow text-[13px] leading-none text-[rgba(0,0,0,0.6)]">
            {jerseyDisplay(item.player.shirtNumber)}
          </span>
        </td>
        <td className={`${rowCell} min-w-0 max-w-[220px] text-left`} style={{ backgroundColor: bg }}>
          <div className="flex h-[22px] min-w-0 max-w-[200px] items-center gap-[7px]">
            <Link
              href={`/jugadores/${item.player.providerId}`}
              className="min-w-0 shrink truncate font-special-gothic-condensed-one text-[15px] font-normal leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.8)]"
              title={item.player.name}
            >
              {displayName}
            </Link>
            {pos ? (
              <span className="shrink-0 font-barlow text-[13px] font-normal leading-none text-[rgba(0,0,0,0.7)]">
                {pos}
              </span>
            ) : null}
          </div>
        </td>
        <PlayerStatCells b={b} bg={bg} />
      </tr>
    );
  };

  const totalsBg = TOTALS_ROW_BG;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead>
          <tr>
            <th className={`${theadCell} w-[15px] max-w-[15px] whitespace-nowrap text-left`}>
              <span className={statHeaderClass}>#</span>
            </th>
            <th className={`${theadCell} text-left`}>
              <span className={statHeaderClass}>Jugador</span>
            </th>
            {STAT_HEADERS.map((header) => (
              <th key={header} className={`${theadCell} whitespace-nowrap text-center`}>
                <span className={statHeaderClass}>{header}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starters.length > 0 && (
            <>
              {renderSectionLabel('Iniciales')}
              {starters.map((item) =>
                Number(item.boxscore.minutes) <= 0
                  ? renderDnpRow(item, `starter-dnp-${item.player.providerId}`)
                  : renderPlayerRow(item, item.player.providerId),
              )}
            </>
          )}
          {bench.length > 0 && (
            <>
              {renderSectionLabel('Banca', 'muted')}
              {bench.map((item) =>
                Number(item.boxscore.minutes) <= 0
                  ? renderDnpRow(item, `bench-dnp-${item.player.providerId}`)
                  : renderPlayerRow(item, `bench-${item.player.providerId}`),
              )}
            </>
          )}
          {tableRows.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center" colSpan={COL_COUNT}>
                No hay datos disponibles.
              </td>
            </tr>
          )}
          {aggregateForTotals && tableRows.length > 0 && (
            <tr>
              <td
                className={`${totalsRowCell} text-left font-semibold`}
                style={{ backgroundColor: totalsBg }}
                colSpan={2}
              >
                <span className="font-special-gothic-condensed-one text-[13px] font-semibold uppercase leading-[1.4] tracking-[1.17px] text-[rgba(0,0,0,0.8)]">
                  Totales equipo
                </span>
              </td>
              <TotalsStatCells
                t={aggregateForTotals}
                bg={totalsBg}
                totalMinutes={rollup.minutes}
                sumFoulsDrawn={rollup.foulsDrawn}
                sumPlusMinus={rollup.plusMinus}
              />
            </tr>
          )}
        </tbody>
      </table>
      {aggregateForTotals ? <TeamStatsStrip team={aggregateForTotals} /> : null}
    </div>
  );
}
