import type { Franchise } from './types';

/** The subset of a franchise that client components need to render logos and colors. Serializable. */
export type FranchiseView = Pick<Franchise, 'slug' | 'nickname' | 'fullName' | 'logo' | 'colors' | 'status'>;

export function toFranchiseView(f: Franchise): FranchiseView {
  return { slug: f.slug, nickname: f.nickname, fullName: f.fullName, logo: f.logo, colors: f.colors, status: f.status };
}

export function franchiseViewMap(list: Franchise[]): Record<string, FranchiseView> {
  const out: Record<string, FranchiseView> = {};
  for (const f of list) out[f.slug] = toFranchiseView(f);
  return out;
}
