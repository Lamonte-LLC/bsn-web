// Types of the integrated history layer (components under src/historia). Everything here is derived from
// types/archivo.ts plus the live season; nothing new is fetched.

import type { Franchise, FranchiseFile, PlayerFile, PlayerIndexEntry } from './archivo';

/** Which era notes apply to a set of stats, derived from the earliest debut year involved. */
export type EraNoteKey = 'assists' | 'threes' | 'stealsBlocks' | 'rebounds2000s';

/** A player as the integrated profile sees it: live identity, archive identity, or both. */
export interface UnifiedPlayer {
  /** Live API providerId (UUID) when the player is on a 2026 roster. */
  providerId: string | null;
  /** Archive id and slug when a historical career exists. */
  archive: PlayerFile | null;
  /** Index entry, cheaper than the full file, when only the summary is needed. */
  index: PlayerIndexEntry | null;
  name: string;
  /** How the two identities were joined; "none" = active player without a historical record. */
  link: 'exact' | 'alias' | 'surname' | 'archive-only' | 'none';
}

export interface FranchiseContext {
  franchise: Pick<Franchise, 'slug' | 'nickname' | 'fullName' | 'firstYear' | 'status'>;
  titles: FranchiseFile['titles'];
}

/** Archive index entry extended with the live identity, served by /api/historia/players. */
export interface UnifiedIndexEntry extends PlayerIndexEntry {
  isActive: boolean;
  providerId: string | null;
}
