import 'server-only';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type {
  CareerArc,
  CareerArcIndexEntry,
  Champion,
  CoachInsight,
  Franchise,
  FranchiseEntry,
  FranchiseFile,
  LongevityFile,
  LoyaltyFile,
  MultiMvpEntry,
  Mvp,
  MvpChampionOverlapFile,
  PlayerFile,
  PlayerIndexEntry,
  RecordsByDecadeFile,
  RecordsFile,
  ScoringClubFile,
  SeasonFile,
  SimilarityFile,
} from '../../../types/archivo';
import { EXTINCT_COLORS, EXTINCT_FALLBACK } from './tokens';

const DATA_DIR = join(process.cwd(), 'data', 'archivo');
const cache = new Map<string, unknown>();

function readJson<T>(relPath: string): T {
  const hit = cache.get(relPath);
  if (hit !== undefined) return hit as T;
  const value = JSON.parse(readFileSync(join(DATA_DIR, relPath), 'utf8')) as T;
  cache.set(relPath, value);
  return value;
}

function readJsonOrNull<T>(relPath: string): T | null {
  return existsSync(join(DATA_DIR, relPath)) ? readJson<T>(relPath) : null;
}

// ---------- franchises ----------

/**
 * Franchises with the archive's provisional palette applied to the extinct ones whose color came from the
 * league prototype (see lib/tokens.ts). The JSON keeps the prototype value; only the rendered color changes.
 */
export function getFranchises(): Franchise[] {
  const key = '__franchises';
  const hit = cache.get(key) as Franchise[] | undefined;
  if (hit) return hit;
  const list = readJson<FranchiseEntry[]>('franchises.json')
    .filter((f): f is Franchise => f.type === 'franchise')
    .map((f) =>
      f.colorSource === 'prototype' ? { ...f, colors: { ...f.colors, primary: EXTINCT_COLORS[f.slug] ?? EXTINCT_FALLBACK } } : f,
    );
  cache.set(key, list);
  return list;
}

export function getFranchiseMap(): Map<string, Franchise> {
  const key = '__franchiseMap';
  const hit = cache.get(key) as Map<string, Franchise> | undefined;
  if (hit) return hit;
  const map = new Map(getFranchises().map((f) => [f.slug, f]));
  cache.set(key, map);
  return map;
}

export function getFranchise(slug: string): Franchise | null {
  return getFranchiseMap().get(slug) ?? null;
}

export function getFranchiseFile(slug: string): FranchiseFile | null {
  return readJsonOrNull<FranchiseFile>(`franchises/${slug}.json`);
}

// ---------- players ----------

export function getPlayerIndex(): PlayerIndexEntry[] {
  return readJson<PlayerIndexEntry[]>('players.json');
}

export function getPlayerIndexBySlug(slug: string): PlayerIndexEntry | null {
  const key = '__playerSlugMap';
  let map = cache.get(key) as Map<string, PlayerIndexEntry> | undefined;
  if (!map) {
    map = new Map(getPlayerIndex().map((p) => [p.slug, p]));
    cache.set(key, map);
  }
  return map.get(slug) ?? null;
}

export function getPlayerIndexById(id: string): PlayerIndexEntry | null {
  const key = '__playerIdMap';
  let map = cache.get(key) as Map<string, PlayerIndexEntry> | undefined;
  if (!map) {
    map = new Map(getPlayerIndex().map((p) => [p.id, p]));
    cache.set(key, map);
  }
  return map.get(id) ?? null;
}

export function getPlayer(id: string): PlayerFile | null {
  return readJsonOrNull<PlayerFile>(`players/${id}.json`);
}

export function getPlayerBySlug(slug: string): PlayerFile | null {
  const entry = getPlayerIndexBySlug(slug);
  return entry ? getPlayer(entry.id) : null;
}

// ---------- seasons / champions / mvps / records ----------

export function getSeasonYears(): number[] {
  const key = '__seasonYears';
  const hit = cache.get(key) as number[] | undefined;
  if (hit) return hit;
  const years = readdirSync(join(DATA_DIR, 'seasons'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
  cache.set(key, years);
  return years;
}

export function getSeason(year: number): SeasonFile | null {
  return readJsonOrNull<SeasonFile>(`seasons/${year}.json`);
}

export function getChampions(): Champion[] {
  return readJson<Champion[]>('champions.json');
}

export function getMvps(): Mvp[] {
  return readJson<Mvp[]>('mvps.json');
}

export function getRecords(): RecordsFile {
  return readJson<RecordsFile>('records.json');
}

// ---------- insights ----------

export function getCoaches(): CoachInsight[] {
  return readJson<CoachInsight[]>('insights/coaches.json');
}

export function getMvpChampionOverlap(): MvpChampionOverlapFile {
  return readJson<MvpChampionOverlapFile>('insights/mvp-champion-overlap.json');
}

export function getMultiMvps(): MultiMvpEntry[] {
  return readJson<MultiMvpEntry[]>('insights/multi-mvps.json');
}

export function getLongevity(): LongevityFile {
  return readJson<LongevityFile>('insights/longevity.json');
}

export function getLoyalty(): LoyaltyFile {
  return readJson<LoyaltyFile>('insights/loyalty.json');
}

export function getScoringClub(): ScoringClubFile {
  return readJson<ScoringClubFile>('insights/scoring-club.json');
}

export function getRecordsByDecade(): RecordsByDecadeFile {
  return readJson<RecordsByDecadeFile>('insights/records-by-decade.json');
}

export function getSimilarity(): SimilarityFile {
  return readJson<SimilarityFile>('insights/similarity.json');
}

export function getSimilarPlayers(playerId: string) {
  return getSimilarity()[playerId] ?? [];
}

// career-arcs.json is either the full list or an index pointing at career-arcs/{id}.json
export function getCareerArc(playerId: string): CareerArc | null {
  const key = '__careerArcMap';
  let map = cache.get(key) as Map<string, CareerArc | CareerArcIndexEntry> | undefined;
  if (!map) {
    const list = readJson<Array<CareerArc | CareerArcIndexEntry>>('insights/career-arcs.json');
    map = new Map(list.map((a) => [a.playerId, a]));
    cache.set(key, map);
  }
  const entry = map.get(playerId);
  if (!entry) return null;
  if ('arc' in entry) return entry;
  return readJsonOrNull<CareerArc>(`insights/${entry.file}`);
}
