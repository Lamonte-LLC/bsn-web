// Precomputed insights for Archivo BSN. Reads data/archivo/** (output of etl-stats.ts) and writes
// data/archivo/insights/**. Pure derivation: nothing here is invented, nulls stay null.
//
// Similarity score (similarity.json):
//   vector = [ppg, rpg, apg, spg, bpg, fgPct, fg3Pct, ftPct, g, seasons] from regular-season lines with
//   franchise teams (same null gating as the ETL: a dimension is null when any season lacks it).
//   Each dimension is z-scored over the population of players with 3+ seasons. Distance between two players
//   is the root-mean-square of z differences over the dimensions where BOTH have data (dividing by the shared
//   count keeps pairs with many shared dimensions from looking farther than pairs with few); pairs sharing
//   fewer than MIN_SHARED dimensions are skipped. score = 100 * (1 - distance / maxDistance), clamped to 0..100,
//   where maxDistance is the largest distance observed across all pairs.
//
// Run AFTER etl-stats.ts:  node --experimental-strip-types scripts/archivo/build-insights.ts

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CareerArc,
  CareerArcIndexEntry,
  CareerArcPoint,
  Champion,
  CoachChampionship,
  CoachInsight,
  DecadeRecord,
  Franchise,
  FranchiseEntry,
  LongevityEntry,
  LongevityFile,
  LoyaltyEntry,
  LoyaltyFile,
  MultiMvpEntry,
  Mvp,
  MvpChampionOverlapFile,
  MvpChampionYear,
  PlayerFile,
  RecordsByDecadeFile,
  ScoringClubFile,
  ScoringSeason,
  SeasonRecordKey,
  SimilarPlayer,
  SimilarityFile,
  StatLine,
} from '../../types/archivo';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(SCRIPT_DIR, '..', '..', 'data', 'archivo');
const OUT_DIR = join(DATA_DIR, 'insights');
const MIN_GAMES = 10;
const MIN_ARC_SEASONS = 3;
const MIN_LOYALTY_SEASONS = 5;
const MIN_SHARED = 5;
const ARC_SPLIT_BYTES = 2 * 1024 * 1024;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function writeJson(relPath: string, value: unknown, pretty = true): string {
  const full = join(OUT_DIR, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pretty ? JSON.stringify(value, null, 2) + '\n' : JSON.stringify(value));
  return full;
}

function normalizeKey(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ---------- load ----------

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const champions = readJson<Champion[]>(join(DATA_DIR, 'champions.json'));
const mvps = readJson<Mvp[]>(join(DATA_DIR, 'mvps.json'));
const franchises = readJson<FranchiseEntry[]>(join(DATA_DIR, 'franchises.json')).filter((f): f is Franchise => f.type === 'franchise');
const franchiseBySlug = new Map(franchises.map((f) => [f.slug, f]));
const players: PlayerFile[] = readdirSync(join(DATA_DIR, 'players'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson<PlayerFile>(join(DATA_DIR, 'players', f)));
const playerById = new Map(players.map((p) => [p.id, p]));

const franchiseName = (slug: string | null): string => (slug ? franchiseBySlug.get(slug)?.fullName ?? slug : '');

// Regular-season lines with a real franchise, the basis for everything stat-driven below.
const regularLines = (p: PlayerFile): StatLine[] => p.lines.regular.filter((l) => l.franchiseSlug !== null);

// Chronological franchise sequence (regular + playoffs).
function franchiseSequence(p: PlayerFile): string[] {
  const seq: string[] = [];
  for (const l of [...p.lines.regular, ...p.lines.playoffs].sort((a, b) => a.year - b.year)) {
    if (l.franchiseSlug && !seq.includes(l.franchiseSlug)) seq.push(l.franchiseSlug);
  }
  return seq;
}

// ---------- 1. coaches ----------

const coachMap = new Map<string, CoachInsight>();
for (const c of champions) {
  if (!c.coach) continue;
  const names = c.coach.split(/\s+y\s+/i).map((n) => n.trim()).filter(Boolean);
  for (const name of names) {
    const key = normalizeKey(name);
    const entry = coachMap.get(key) ?? { name, titles: 0, championships: [] };
    const champ: CoachChampionship = {
      year: c.year,
      franchiseSlug: c.franchiseSlug,
      franchiseName: c.franchiseSlug ? franchiseName(c.franchiseSlug) : c.name,
      series: c.series,
      coCoach: names.length > 1 ? names.filter((n) => n !== name).join(' y ') : null,
    };
    entry.titles++;
    entry.championships.push(champ);
    coachMap.set(key, entry);
  }
}
const coaches = [...coachMap.values()]
  .map((c) => ({ ...c, championships: c.championships.sort((a, b) => b.year - a.year) }))
  .sort((a, b) => b.titles - a.titles || a.championships[a.championships.length - 1].year - b.championships[b.championships.length - 1].year);
writeJson('coaches.json', coaches);

// ---------- 2. mvp vs champion ----------

const championByYear = new Map(champions.map((c) => [c.year, c]));
const overlapYears: MvpChampionYear[] = [];
for (const m of [...mvps].sort((a, b) => a.year - b.year)) {
  const c = championByYear.get(m.year);
  if (!c) continue;
  overlapYears.push({
    year: m.year,
    mvp: { playerId: m.playerId, slug: m.slug, name: m.name, franchiseSlugs: m.franchiseSlugs },
    champion: { franchiseSlug: c.franchiseSlug, name: c.name },
    overlap: c.franchiseSlug !== null && m.franchiseSlugs.includes(c.franchiseSlug),
  });
}
function longestStreak(want: boolean): MvpChampionOverlapFile['longestOverlapStreak'] {
  type Streak = { length: number; from: number; to: number };
  let best: Streak | null = null;
  let run: Streak | null = null;
  for (const y of overlapYears) {
    if (y.overlap === want) {
      run = run === null ? { length: 1, from: y.year, to: y.year } : { length: run.length + 1, from: run.from, to: y.year };
      if (best === null || run.length > best.length) best = { length: run.length, from: run.from, to: run.to };
    } else run = null;
  }
  return best;
}
const overlapCount = overlapYears.filter((y) => y.overlap).length;
const mvpChampion: MvpChampionOverlapFile = {
  totalYears: overlapYears.length,
  overlapYears: overlapCount,
  overlapPct: round1((overlapCount / overlapYears.length) * 100),
  longestOverlapStreak: longestStreak(true),
  longestNoOverlapStreak: longestStreak(false),
  years: overlapYears.sort((a, b) => b.year - a.year),
};
writeJson('mvp-champion-overlap.json', mvpChampion);

// ---------- 3. multi MVPs ----------

const mvpGroups = new Map<string, MultiMvpEntry>();
for (const m of mvps) {
  const key = m.playerId ?? `name:${normalizeKey(m.name)}`;
  const entry = mvpGroups.get(key) ?? { playerId: m.playerId, slug: m.slug, name: m.playerId ? playerById.get(m.playerId)!.name : m.name, count: 0, mvps: [], distinctFranchises: 0, wonWithMultipleTeams: false };
  entry.count++;
  entry.mvps.push({ year: m.year, franchiseSlug: m.franchiseSlugs[0] ?? null });
  mvpGroups.set(key, entry);
}
const multiMvps = [...mvpGroups.values()]
  .filter((e) => e.count >= 2)
  .map((e) => {
    e.mvps.sort((a, b) => a.year - b.year);
    e.distinctFranchises = new Set(e.mvps.map((m) => m.franchiseSlug).filter(Boolean)).size;
    e.wonWithMultipleTeams = e.distinctFranchises > 1;
    return e;
  })
  .sort((a, b) => b.count - a.count || a.mvps[0].year - b.mvps[0].year);
writeJson('multi-mvps.json', multiMvps);

// ---------- 4. longevity ----------

const longevityEntries: LongevityEntry[] = players
  .filter((p) => p.career)
  .map((p) => ({
    playerId: p.id,
    slug: p.slug,
    name: p.name,
    seasons: p.seasons,
    g: p.career?.g ?? p.computed.regular.g ?? 0,
    fy: p.fy,
    ly: p.ly,
    span: p.ly - p.fy + 1,
    franchiseSlugs: franchiseSequence(p),
  }));
const longevity: LongevityFile = {
  bySeasons: [...longevityEntries].sort((a, b) => b.seasons - a.seasons || b.g - a.g).slice(0, 25),
  byGames: [...longevityEntries].sort((a, b) => b.g - a.g || b.seasons - a.seasons).slice(0, 25),
};
writeJson('longevity.json', longevity);

// ---------- 5. loyalty ----------

const loyaltyPool = players.filter((p) => p.seasons >= MIN_LOYALTY_SEASONS && p.career);
const toLoyalty = (p: PlayerFile): LoyaltyEntry => ({ playerId: p.id, slug: p.slug, name: p.name, seasons: p.seasons, franchiseSlugs: franchiseSequence(p) });
const loyalty: LoyaltyFile = {
  minSeasons: MIN_LOYALTY_SEASONS,
  oneClub: loyaltyPool.map(toLoyalty).filter((e) => e.franchiseSlugs.length === 1).sort((a, b) => b.seasons - a.seasons || a.name.localeCompare(b.name)),
  journeymen: loyaltyPool.map(toLoyalty).filter((e) => e.franchiseSlugs.length >= 4).sort((a, b) => b.franchiseSlugs.length - a.franchiseSlugs.length || b.seasons - a.seasons),
};
writeJson('loyalty.json', loyalty);

// ---------- 6. scoring club ----------

interface SeasonRow {
  player: PlayerFile;
  line: StatLine;
}
const seasonRows: SeasonRow[] = players.flatMap((p) => regularLines(p).filter((l) => l.g >= MIN_GAMES).map((line) => ({ player: p, line })));
const THRESHOLDS = [15, 20, 25, 30];
const decadeOf = (year: number): number => Math.floor(year / 10) * 10;
const scoringClub: ScoringClubFile = { minGames: MIN_GAMES, thresholds: THRESHOLDS, byThreshold: {}, byDecade: [] };
for (const t of THRESHOLDS) {
  scoringClub.byThreshold[String(t)] = seasonRows
    .filter((r) => r.line.ppg !== null && r.line.ppg >= t)
    .map((r): ScoringSeason => ({ playerId: r.player.id, slug: r.player.slug, name: r.player.name, year: r.line.year, franchiseSlug: r.line.franchiseSlug, ppg: r.line.ppg!, g: r.line.g }))
    .sort((a, b) => b.ppg - a.ppg || a.year - b.year);
}
for (let decade = 1950; decade <= 2020; decade += 10) {
  const counts: Record<string, number> = {};
  for (const t of THRESHOLDS) counts[String(t)] = scoringClub.byThreshold[String(t)].filter((s) => decadeOf(s.year) === decade).length;
  scoringClub.byDecade.push({ decade, counts });
}
writeJson('scoring-club.json', scoringClub);

// ---------- 7. records by decade ----------

const RECORD_KEYS: SeasonRecordKey[] = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'pts'];
const recordsByDecade: RecordsByDecadeFile = { minGames: MIN_GAMES, categories: RECORD_KEYS, decades: [] };
for (let decade = 1950; decade <= 2020; decade += 10) {
  const rows = seasonRows.filter((r) => decadeOf(r.line.year) === decade);
  const records = {} as Record<SeasonRecordKey, DecadeRecord>;
  for (const key of RECORD_KEYS) {
    const best = rows.filter((r) => r.line[key] !== null).sort((a, b) => b.line[key]! - a.line[key]! || b.line.g - a.line.g)[0];
    records[key] = best
      ? { playerId: best.player.id, slug: best.player.slug, name: best.player.name, year: best.line.year, franchiseSlug: best.line.franchiseSlug, value: best.line[key], reason: null }
      : { playerId: null, slug: null, name: null, year: null, franchiseSlug: null, value: null, reason: 'no data' };
  }
  recordsByDecade.decades.push({ decade, records });
}
writeJson('records-by-decade.json', recordsByDecade);

// ---------- 8. career arcs ----------

// One point per year; a player traded mid-season gets a games-weighted average and the franchise he played most for.
function yearPoint(lines: StatLine[]): Omit<CareerArcPoint, 'seasonNumber'> {
  const g = lines.reduce((a, l) => a + l.g, 0);
  const weighted = (key: 'ppg' | 'rpg' | 'apg'): number | null => {
    if (lines.some((l) => l[key] === null) || g === 0) return null;
    return round1(lines.reduce((a, l) => a + l[key]! * l.g, 0) / g);
  };
  const top = [...lines].sort((a, b) => b.g - a.g)[0];
  return { year: top.year, franchiseSlug: top.franchiseSlug, ppg: weighted('ppg'), rpg: weighted('rpg'), apg: weighted('apg'), g };
}

const arcs: CareerArc[] = [];
for (const p of players) {
  if (p.seasons < MIN_ARC_SEASONS) continue;
  const byYear = new Map<number, StatLine[]>();
  for (const l of regularLines(p)) byYear.set(l.year, [...(byYear.get(l.year) ?? []), l]);
  if (byYear.size < MIN_ARC_SEASONS) continue;
  const arc: CareerArcPoint[] = [...byYear.keys()].sort((a, b) => a - b).map((year, i) => ({ seasonNumber: i + 1, ...yearPoint(byYear.get(year)!) }));
  const peak = arc.filter((a) => a.ppg !== null).sort((a, b) => b.ppg! - a.ppg!)[0];
  arcs.push({ playerId: p.id, slug: p.slug, name: p.name, peakSeason: peak?.seasonNumber ?? null, arc });
}
const arcsPath = writeJson('career-arcs.json', arcs, false);
let arcsSplit = false;
if (statSync(arcsPath).size > ARC_SPLIT_BYTES) {
  arcsSplit = true;
  rmSync(arcsPath);
  const index: CareerArcIndexEntry[] = [];
  for (const a of arcs) {
    writeJson(`career-arcs/${a.playerId}.json`, a, false);
    index.push({ playerId: a.playerId, slug: a.slug, name: a.name, seasons: a.arc.length, peakSeason: a.peakSeason, file: `career-arcs/${a.playerId}.json` });
  }
  writeJson('career-arcs.json', index, false);
}

// ---------- 9. similarity ----------

const DIMS = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgPct', 'fg3Pct', 'ftPct', 'g', 'seasons'] as const;
type Dim = (typeof DIMS)[number];

function careerVector(p: PlayerFile): Record<Dim, number | null> | null {
  const lines = regularLines(p);
  const g = lines.reduce((a, l) => a + l.g, 0);
  if (lines.length < MIN_ARC_SEASONS || g === 0) return null;
  const avg = (key: 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg'): number | null =>
    lines.some((l) => l[key] === null) ? null : round2(lines.reduce((a, l) => a + l[key]! * l.g, 0) / g);
  const pct = (m: 'fgm' | 'fg3m' | 'ftm', a: 'fga' | 'fg3a' | 'fta'): number | null => {
    if (lines.some((l) => l[m] === null || l[a] === null)) return null;
    const att = lines.reduce((s, l) => s + l[a]!, 0);
    return att === 0 ? null : round2((lines.reduce((s, l) => s + l[m]!, 0) / att) * 100);
  };
  return { ppg: avg('ppg'), rpg: avg('rpg'), apg: avg('apg'), spg: avg('spg'), bpg: avg('bpg'), fgPct: pct('fgm', 'fga'), fg3Pct: pct('fg3m', 'fg3a'), ftPct: pct('ftm', 'fta'), g, seasons: new Set(lines.map((l) => l.year)).size };
}

const vectors: Array<{ p: PlayerFile; v: Record<Dim, number | null> }> = [];
for (const p of players) {
  const v = careerVector(p);
  if (v) vectors.push({ p, v });
}
const stats = {} as Record<Dim, { mean: number; sd: number }>;
for (const d of DIMS) {
  const vals = vectors.map((x) => x.v[d]).filter((v): v is number => v !== null);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 1;
  stats[d] = { mean, sd };
}
const z: Array<Array<number | null>> = vectors.map((x) => DIMS.map((d) => (x.v[d] === null ? null : (x.v[d]! - stats[d].mean) / stats[d].sd)));

interface Neighbor {
  index: number;
  distance: number;
  shared: number;
}
const neighbors: Neighbor[][] = vectors.map(() => []);
let maxDistance = 0;
for (let i = 0; i < z.length; i++) {
  for (let j = i + 1; j < z.length; j++) {
    let sum = 0;
    let shared = 0;
    for (let d = 0; d < DIMS.length; d++) {
      const a = z[i][d];
      const b = z[j][d];
      if (a === null || b === null) continue;
      sum += (a - b) ** 2;
      shared++;
    }
    if (shared < MIN_SHARED) continue;
    const distance = Math.sqrt(sum / shared);
    if (distance > maxDistance) maxDistance = distance;
    const push = (list: Neighbor[], n: Neighbor): void => {
      if (list.length < 8) {
        list.push(n);
        list.sort((x, y) => x.distance - y.distance);
      } else if (n.distance < list[7].distance) {
        list[7] = n;
        list.sort((x, y) => x.distance - y.distance);
      }
    };
    push(neighbors[i], { index: j, distance, shared });
    push(neighbors[j], { index: i, distance, shared });
  }
}
const similarity: SimilarityFile = {};
vectors.forEach((x, i) => {
  similarity[x.p.id] = neighbors[i].map((n): SimilarPlayer => ({
    playerId: vectors[n.index].p.id,
    slug: vectors[n.index].p.slug,
    name: vectors[n.index].p.name,
    score: Math.max(0, Math.min(100, round1(100 * (1 - n.distance / maxDistance)))),
    sharedDimensions: n.shared,
  }));
});
writeJson('similarity.json', similarity, false);

// ---------- README ----------

writeFileSync(
  join(OUT_DIR, 'README.md'),
  `# Insights de Archivo BSN

Generado por \`scripts/archivo/build-insights.ts\` a partir de \`data/archivo/\`. No editar a mano.

| Archivo | Contenido |
|---|---|
| coaches.json | Dirigentes campeones; co-dirigentes ("A y B") cuentan el título para ambos |
| mvp-champion-overlap.json | Por año, si el MVP jugaba en el equipo campeón (${mvpChampion.overlapPct}% de ${mvpChampion.totalYears} años) |
| multi-mvps.json | Jugadores con 2+ MVPs |
| longevity.json | Top 25 por temporadas y por juegos |
| loyalty.json | Un solo club vs 4+ franquicias (mínimo ${MIN_LOYALTY_SEASONS} temporadas) |
| scoring-club.json | Temporadas con ppg >= 15/20/25/30 (mínimo ${MIN_GAMES} juegos) y conteo por década |
| records-by-decade.json | Mejor registro por década; \`value: null\` con \`reason: "no data"\` cuando la stat no se registraba |
| career-arcs.json${arcsSplit ? ' + career-arcs/{id}.json' : ''} | Arco de carrera (temporada regular, un punto por año) para jugadores con ${MIN_ARC_SEASONS}+ temporadas |
| similarity.json | 8 jugadores más parecidos por jugador con ${MIN_ARC_SEASONS}+ temporadas |

## Similarity score

Vector por jugador: \`[ppg, rpg, apg, spg, bpg, fgPct, fg3Pct, ftPct, g, seasons]\` calculado sobre líneas de Serie Regular con franquicias reales; una dimensión es null si alguna temporada no la tiene (misma regla que el ETL).

1. Cada dimensión se normaliza a z-score sobre la población (${vectors.length} jugadores).
2. Distancia entre dos jugadores = raíz de la media de las diferencias de z al cuadrado, solo sobre las dimensiones donde ambos tienen data. Dividir por el número de dimensiones compartidas evita que compartir más dimensiones parezca estar más lejos. Pares con menos de ${MIN_SHARED} dimensiones compartidas se descartan.
3. \`score = 100 * (1 - distancia / distanciaMáxima)\` acotado a 0..100, con la distancia máxima observada entre todos los pares (${round2(maxDistance)}).

\`sharedDimensions\` indica sobre cuántas dimensiones se calculó cada score; un score sobre 5 dimensiones (jugador pre-1975) es menos preciso que uno sobre 10.
`,
);

// ---------- validation ----------

console.log('\n=== VALIDACION INSIGHTS ===');
const toro = coaches.find((c) => normalizeKey(c.name) === 'julio toro');
console.log(`${toro?.titles === 12 ? 'OK ' : 'XX '} Julio Toro: ${toro?.titles ?? 0} títulos (esperado 12)`);
console.log(`   dirigentes: ${coaches.length} | top 5: ${coaches.slice(0, 5).map((c) => `${c.name} ${c.titles}`).join(', ')}`);
console.log(`   MVP vs campeón: ${mvpChampion.overlapYears} de ${mvpChampion.totalYears} (${mvpChampion.overlapPct}%) | racha solape ${JSON.stringify(mvpChampion.longestOverlapStreak)} | sin solape ${JSON.stringify(mvpChampion.longestNoOverlapStreak)}`);
for (const expected of ['pachin', 'teofilo', 'quijote']) {
  const e = multiMvps.find((m) => normalizeKey(m.name).includes(expected));
  console.log(`${e?.count === 4 ? 'OK ' : 'XX '} ${e?.name ?? expected}: ${e?.count ?? 0} MVPs (esperado 4)`);
}
console.log(`   MVPs múltiples: ${multiMvps.length} jugadores | con más de un equipo: ${multiMvps.filter((m) => m.wonWithMultipleTeams).map((m) => m.name).join(', ')}`);
console.log(`   longevidad por temporadas: ${longevity.bySeasons.slice(0, 5).map((e) => `${e.name} ${e.seasons}`).join(', ')}`);
console.log(`   longevidad por juegos: ${longevity.byGames.slice(0, 5).map((e) => `${e.name} ${e.g}`).join(', ')}`);
console.log(`   lealtad: un solo club ${loyalty.oneClub.length} (top: ${loyalty.oneClub.slice(0, 3).map((e) => `${e.name} ${e.seasons}`).join(', ')}) | trotamundos ${loyalty.journeymen.length} (top: ${loyalty.journeymen.slice(0, 3).map((e) => `${e.name} ${e.franchiseSlugs.length}`).join(', ')})`);
console.log(`   club de los 20 por década: ${scoringClub.byDecade.map((d) => `${d.decade}s ${d.counts['20']}`).join(', ')}`);
console.log(`   récords por década sin data: ${recordsByDecade.decades.flatMap((d) => RECORD_KEYS.filter((k) => d.records[k].value === null).map((k) => `${d.decade}s ${k}`)).join(', ') || 'ninguno'}`);
console.log(`   arcos de carrera: ${arcs.length} jugadores${arcsSplit ? ' (separados en career-arcs/{id}.json)' : ''} | similarity: ${Object.keys(similarity).length} jugadores, distancia máxima ${round2(maxDistance)}`);

for (const [id, label] of [['788', 'Georgie Torres'], ['273', 'Carlos Arroyo']] as const) {
  console.log(`   parecidos a ${label}: ${(similarity[id] ?? []).slice(0, 5).map((s) => `${s.name} ${s.score} (${s.sharedDimensions}d)`).join(' | ')}`);
}

console.log('\n   top 10 anotadores de carrera (pts publicados) vs referencia externa:');
// [nombre en la referencia, puntos, tokens con los que se busca en nuestra data]
const reference: Array<[string, number, string[]]> = [
  ['Georgie Torres', 15863, ['torres', 'dougherty']], ['Quijote Morales', 15293, ['quijote', 'morales']], ['Mario Butler', 12252, ['mario', 'butler']],
  ['Rolando Frazer', 12096, ['rolando', 'frazer']], ['Raymond Dalmau', 11592, ['raymond', 'dalmau']], ['Rubén Rodríguez', 11549, ['ruben', 'rodriguez', 'leon']],
  ['Roberto Ríos', 11312, ['roberto', 'rios']], ['Cachorro Santiago', 11287, ['cachorro', 'santiago']], ['José Quiñones', 11012, ['willie', 'quinonez']],
  ['Christian Dalmau', 10570, ['christian', 'dalmau']],
];
const scorers = players.filter((p) => p.career?.pts).sort((a, b) => b.career!.pts! - a.career!.pts!);
scorers.slice(0, 10).forEach((p, i) => console.log(`     ${String(i + 1).padStart(2)}. ${p.name.padEnd(42)} ${p.career!.pts}`));
console.log('   referencia:');
for (const [name, pts, toks] of reference) {
  const found = scorers.slice(0, 60).find((p) => toks.every((t) => normalizeKey(p.name).split(' ').includes(t)));
  if (!found) console.log(`     ${name.padEnd(20)} ${pts}  -> no encontrado en el top 60`);
  else {
    const diff = found.career!.pts! - pts;
    console.log(`     ${name.padEnd(20)} ${pts}  -> ${found.name} ${found.career!.pts} (${diff >= 0 ? '+' : ''}${diff})`);
  }
}
