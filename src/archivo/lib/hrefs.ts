/**
 * Internal links of the archive views, in two flavors: the archive's own routes (/archivo/...) and the public
 * site (/jugadores, /temporadas, /equipos, /estadisticas). Views that render in both places take `site` and
 * build every link through this helper, so neither flavor hardcodes the other's paths.
 */
export interface FranchiseRef {
  slug: string;
  status: 'active' | 'extinct';
  code: string | null;
}

export type EnNumerosView = 'dirigentes' | 'mvp-y-campeon' | 'multi-mvp' | 'longevidad' | 'lealtad' | 'club-de-los-20' | 'records-por-decada' | 'dinastias';

export function hrefs(site = false) {
  return {
    player: (slug: string) => (site ? `/jugadores/${slug}` : `/archivo/jugadores/${slug}`),
    season: (year: number | string) => (site ? `/temporadas/${year}` : `/archivo/temporadas/${year}`),
    compare: (a: string, b: string) => (site ? `/jugadores/comparar?p=${a},${b}` : `/archivo/comparar?a=${a}&b=${b}`),
    enNumeros: (view?: EnNumerosView) => `${site ? '/estadisticas' : '/archivo'}/en-numeros${view ? `/${view}` : ''}`,
    /** Active franchises open the team page on its Historia tab; extinct ones, their historical page. */
    franchise: (f: FranchiseRef) => (site ? (f.status === 'active' && f.code ? `/equipos/${f.code}?tab=historia` : `/equipos/historicos/${f.slug}`) : `/archivo/franquicias/${f.slug}`),
  };
}

export type Hrefs = ReturnType<typeof hrefs>;
