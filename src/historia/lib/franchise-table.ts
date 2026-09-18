import 'server-only';
import { getFranchiseFile, getPlayer } from '@/archivo/lib/data';
import { aggregateFranchiseLines, type FranchiseCareerRow } from './franchise-stats';

const cache = new Map<string, FranchiseCareerRow[]>();

/** Every player who wore the jersey with their regular-season career for that franchise, most points first. */
export function franchiseCareerRows(slug: string): FranchiseCareerRow[] {
  const hit = cache.get(slug);
  if (hit) return hit;
  const file = getFranchiseFile(slug);
  const rows: FranchiseCareerRow[] = [];
  for (const p of file?.players ?? []) {
    const player = getPlayer(p.id);
    if (!player) continue;
    const row = aggregateFranchiseLines({ id: player.id, slug: player.slug, name: player.name }, player.lines.regular ?? [], slug);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => b.pts - a.pts || b.g - a.g || a.name.localeCompare(b.name, 'es'));
  cache.set(slug, rows);
  return rows;
}
