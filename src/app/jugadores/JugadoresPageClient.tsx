'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { fmt, normalizeSearch } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import HistoricPlayersList, { CountCard, CountLine, EmptyRows, FiltersCard, LoadMore, PillGroup, ROW, SearchField, SelectField, TH } from '@/historia/components/players/HistoricPlayersList';
import { ACTIVE_PAGE, filterActive, type PositionGroup } from '@/historia/lib/players-list';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';

const TEAM_LOGO_MAP: Record<string, string> = {
  AGU: 'Aguada',
  ARE: 'Arecibo',
  BAY: 'Bayamon',
  CAG: 'Caguas',
  CAR: 'Carolina',
  GBO: 'Guaynabo',
  MAN: 'Manati',
  MAY: 'Mayaguez',
  PON: 'Ponce',
  QUE: 'Quebradillas',
  SGE: 'San-German',
  SCE: 'Santurce',
};

const TEAM_SHORT_NAME: Record<string, string> = {
  AGU: 'Santeros',
  ARE: 'Capitanes',
  BAY: 'Vaqueros',
  CAG: 'Criollos',
  CAR: 'Gigantes',
  GBO: 'Mets',
  MAN: 'Osos',
  MAY: 'Indios',
  PON: 'Leones',
  QUE: 'Piratas',
  SGE: 'Atléticos',
  SCE: 'Cangrejeros',
};

const TEAM_FULL_NAME: Record<string, string> = {
  AGU: 'Santeros de Aguada',
  ARE: 'Capitanes de Arecibo',
  BAY: 'Vaqueros de Bayamón',
  CAG: 'Criollos de Caguas',
  CAR: 'Gigantes de Carolina',
  GBO: 'Mets de Guaynabo',
  MAN: 'Osos de Manatí',
  MAY: 'Indios de Mayagüez',
  PON: 'Leones de Ponce',
  QUE: 'Piratas de Quebradillas',
  SGE: 'Atléticos de San Germán',
  SCE: 'Cangrejeros de Santurce',
};

// Used in dropdowns — display city names users are familiar with
const TEAM_DISPLAY_NAMES: Record<string, string> = {
  AGU: 'Aguada',
  ARE: 'Arecibo',
  BAY: 'Bayamón',
  CAG: 'Caguas',
  CAR: 'Carolina',
  GBO: 'Guaynabo',
  MAN: 'Manatí',
  MAY: 'Mayagüez',
  PON: 'Ponce',
  QUE: 'Quebradillas',
  SGE: 'San Germán',
  SCE: 'Santurce',
};

const TEAM_OPTIONS = Object.entries(TEAM_DISPLAY_NAMES).sort(([, a], [, b]) => a.localeCompare(b, 'es'));
const POSITION_OPTIONS: Array<[PositionGroup | '', string]> = [
  ['', 'Todas'],
  ['G', 'G'],
  ['F', 'F'],
  ['C', 'C'],
];
const COLS = 'grid-cols-[minmax(0,1fr)_84px_30px_44px] gap-x-[12px] px-[8px] lg:grid-cols-[minmax(0,1fr)_220px_64px_80px] lg:gap-x-[16px] lg:px-[10px]';

export type JugadorItem = {
  providerId: string;
  name: string;
  avatarUrl: string | null;
  teamCode: string;
  playingPosition: string;
  height: number;
  weight: number;
  dob: string;
  /** Points per game this season, from the archive's live stats; null when the player has not played. */
  ppg: number | null;
};

export type JugadoresView = 'activos' | 'historicos';

export const HISTORICOS_HREF = '/jugadores?vista=historicos';

/* ---------- Hero controls (same content on the desktop band and the phone band) ---------- */

const HERO_PILL = `inline-flex h-[35px] flex-[1_1_auto] items-center justify-center whitespace-nowrap rounded-[100px] border px-[18px] font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 lg:flex-none lg:min-w-[150px] ${cls.focusOnDark}`;
const HERO_PILL_ON = 'border-white bg-white text-[#0F171F]';
const HERO_PILL_OFF = 'border-white/30 bg-transparent text-[rgba(255,255,255,0.85)] hover:border-white/60 hover:bg-white/5';

/**
 * Activos | Históricos pills (the view lives in the URL) and the link to the comparison, three identical pills
 * in one row. On narrow phones the third one wraps to its own full-width line.
 */
export function JugadoresHeroControls({ vista }: { vista: JugadoresView }) {
  const views: Array<[JugadoresView, string, string]> = [
    ['activos', 'Activos', '/jugadores'],
    ['historicos', 'Históricos', HISTORICOS_HREF],
  ];
  return (
    <div className="mt-[20px] flex flex-wrap justify-center gap-[8px] lg:mt-[16px] lg:flex-nowrap">
      <div role="radiogroup" aria-label="Vista" className="flex flex-[2_1_auto] gap-[8px] lg:flex-none">
        {views.map(([key, label, href]) => (
          <Link key={key} href={href} replace scroll={false} role="radio" aria-checked={vista === key} className={`${HERO_PILL} ${vista === key ? HERO_PILL_ON : HERO_PILL_OFF}`}>
            {label}
          </Link>
        ))}
      </div>
      <Link href="/jugadores/comparar" className={`${HERO_PILL} ${HERO_PILL_OFF}`}>
        Comparar jugadores
      </Link>
    </div>
  );
}

/* ---------- Page ---------- */

type Props = {
  players: JugadorItem[];
  vista: JugadoresView;
  franchises: Record<string, FranchiseView>;
  /** Earliest debut year of the archive. */
  firstYear: number;
  season: number;
};

export default function JugadoresPageClient({ players, vista, franchises, firstYear, season }: Props) {
  return (
    <>
      {/* Mobile hero — flat #0F171F continues seamlessly from the navbar's bg-bsn gradient end */}
      <div className="border-b border-white/10 bg-[#0F171F] lg:hidden">
        <div className="container">
          <div className="pb-[24px] pt-[32px]">
            <h1 className="mb-0 text-center font-special-gothic-condensed-one text-[38px] tracking-[0.4px] text-white">Jugadores</h1>
            <JugadoresHeroControls vista={vista} />
          </div>
        </div>
      </div>

      <div className="bg-[#fdfdfd]">
        <div className="container py-6 lg:pb-12 lg:pt-[50px]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-[50px]">{vista === 'historicos' ? <HistoricPlayersList franchises={franchises} firstYear={firstYear} season={season} /> : <ActivePlayersList players={players} season={season} />}</div>
        </div>
      </div>
    </>
  );
}

/* ---------- Active view ---------- */

function ActivePlayersList({ players, season }: { players: JugadorItem[]; season: number }) {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState<PositionGroup | ''>('');
  const [visibleCount, setVisibleCount] = useState(ACTIVE_PAGE);

  const filtered = useMemo(() => {
    const q = normalizeSearch(search);
    const base = filterActive(players, { team, position });
    return q ? base.filter((p) => normalizeSearch(p.name).includes(q)) : base;
  }, [players, search, team, position]);
  const visible = filtered.slice(0, visibleCount);

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setVisibleCount(ACTIVE_PAGE);
  };
  const reset = () => {
    setSearch('');
    setTeam('');
    setPosition('');
    setVisibleCount(ACTIVE_PAGE);
  };

  const searchField = (showLabel: boolean) => <SearchField value={search} onChange={change(setSearch)} placeholder="Buscar jugador" label="Buscar" showLabel={showLabel} />;
  const teamField = (showLabel: boolean) => (
    <SelectField label="Por equipo" value={team} onChange={change(setTeam)} showLabel={showLabel}>
      <option value="">Todos los equipos</option>
      {TEAM_OPTIONS.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </SelectField>
  );
  const positionField = <PillGroup label="Posición" value={position} options={POSITION_OPTIONS} onChange={change(setPosition)} />;

  return (
    <>
      <div className="min-w-0 flex-1">
        {/* Phone filters */}
        <div className="mb-[20px] flex flex-col gap-[10px] lg:hidden">
          {searchField(false)}
          {positionField}
          {teamField(false)}
        </div>

        <CountLine shown={visible.length} total={filtered.length} order="orden alfabético" />

        <div className={`${cls.card} px-[12px] pb-[4px] pt-[12px]`}>
          <div role="table" aria-label="Jugadores activos">
            <div role="row" className={`grid ${COLS} items-center pb-[9px] pt-[2px]`}>
              <span role="columnheader" className={TH}>
                Jugador
              </span>
              <span role="columnheader" className={TH}>
                Equipo
              </span>
              <span role="columnheader" className={`${TH} text-center`}>
                Pos
              </span>
              <span role="columnheader" className={`${TH} text-right`}>
                <abbr title="Puntos por juego" className="no-underline">
                  PPJ
                </abbr>
              </span>
            </div>

            {visible.map((p) => (
              <Link key={p.providerId} href={`/jugadores/${p.providerId}`} role="row" className={`${ROW} ${COLS}`}>
                <span role="cell" className="flex min-w-0 items-center gap-[8px] lg:gap-[10px]">
                  <span className="shrink-0 overflow-hidden rounded-full lg:hidden" style={{ width: 32, height: 32, outline: '0.5px solid rgba(81,81,81,0.25)' }}>
                    <PlayerPhotoAvatar photoUrl={p.avatarUrl ?? ''} size={32} name={p.name} />
                  </span>
                  <span className="hidden shrink-0 overflow-hidden rounded-full lg:block" style={{ width: 36, height: 36, outline: '0.5px solid rgba(81,81,81,0.25)' }}>
                    <PlayerPhotoAvatar photoUrl={p.avatarUrl ?? ''} size={36} name={p.name} />
                  </span>
                  <span className="truncate text-[16px] leading-[1.3] tracking-[0.15px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
                </span>
                <span role="cell" className="flex min-w-0 items-center gap-[6px]">
                  {TEAM_LOGO_MAP[p.teamCode] ? <img src={`/assets/images/teams/${TEAM_LOGO_MAP[p.teamCode]}.png`} alt="" width={18} height={18} loading="lazy" className="shrink-0 object-contain" /> : null}
                  <span className="truncate font-barlow text-[13px] font-medium text-[rgba(15,23,31,0.6)]">
                    <span className="lg:hidden">{TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode}</span>
                    <span className="hidden lg:inline">{TEAM_FULL_NAME[p.teamCode] ?? p.teamCode}</span>
                  </span>
                </span>
                <span role="cell" className="whitespace-nowrap text-center font-barlow text-[13px] font-medium text-[#0F171F]">
                  {p.playingPosition || '–'}
                </span>
                <span role="cell" className={`whitespace-nowrap text-right font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>
                  {fmt(p.ppg)}
                </span>
              </Link>
            ))}

            {!filtered.length ? <EmptyRows onReset={reset}>{search.trim() ? `Sin resultados para “${search.trim()}”. Prueba sin acentos o con el apellido.` : 'Ningún jugador con esos filtros.'}</EmptyRows> : null}
          </div>
        </div>

        <LoadMore page={ACTIVE_PAGE} remaining={filtered.length - visible.length} onClick={() => setVisibleCount((c) => c + ACTIVE_PAGE)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-6 hidden w-[360px] shrink-0 lg:block">
        <FiltersCard>
          {searchField(true)}
          {teamField(true)}
          <div className="space-y-[5px]">
            <span className="block font-barlow text-[13px] font-semibold tracking-[-0.13px] text-[rgba(94,94,94,0.9)]">Posición</span>
            {positionField}
          </div>
        </FiltersCard>
        <CountCard count={players.length}>
          jugadores activos en BSN {season}. Los retirados viven en{' '}
          <Link href={HISTORICOS_HREF} replace scroll={false} className={`${cls.textLink} ${cls.focus} rounded-[2px]`}>
            Históricos
          </Link>
          .
        </CountCard>
      </aside>
    </>
  );
}
