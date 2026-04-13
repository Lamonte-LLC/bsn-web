'use client';

import { useState } from 'react';
import numeral from 'numeral';
import Link from 'next/link';
import StatsFiltersBox, {
  StatsFilters,
} from '@/stats/client/components/filters/StatsFiltersBox';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';

type PageTab = 'jugadores' | 'equipos';

const STAT_CATEGORIES = [
  { code: 'POINTS_AVG', label: 'Puntos', shortLabel: 'PPG' },
  { code: 'REBOUNDS_AVG', label: 'Rebotes', shortLabel: 'RPG' },
  { code: 'ASSISTS_AVG', label: 'Asistencias', shortLabel: 'APG' },
  { code: 'BLOCKS_AVG', label: 'Tapones', shortLabel: 'BPG' },
  { code: 'STEALS_AVG', label: 'Robos', shortLabel: 'SPG' },
  { code: 'THREE_POINTERS_MADE_AVG', label: '3PTM', shortLabel: '3PTM' },
  { code: 'THREE_POINTERS_PERCENTAGE', label: '3P%', shortLabel: '3P%' },
  { code: 'TURNOVERS_AVG', label: 'Pérdidas', shortLabel: 'TO' },
  { code: 'FIELD_GOALS_AVG', label: 'FG%', shortLabel: 'FG%' },
  { code: 'FREE_THROWS_PERCENTAGE', label: 'FT%', shortLabel: 'FT%' },
];

const STAT_TITLE: Record<string, string> = {
  POINTS_AVG: 'Puntos por juego',
  REBOUNDS_AVG: 'Rebotes por juego',
  ASSISTS_AVG: 'Asistencias por juego',
  BLOCKS_AVG: 'Tapones por juego',
  STEALS_AVG: 'Robos por juego',
  THREE_POINTERS_MADE_AVG: 'Triples anotados por juego',
  THREE_POINTERS_PERCENTAGE: 'Porcentaje de triples',
  TURNOVERS_AVG: 'Pérdidas por juego',
  FIELD_GOALS_AVG: 'Porcentaje de tiro',
  FREE_THROWS_PERCENTAGE: 'Porcentaje de tiros libres',
};

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

type PlayerItem = {
  player: {
    providerId: string;
    name: string;
    avatarUrl?: string;
    teamCode: string;
  };
  gamesPlayed?: number;
  value: number;
};

type TeamItem = {
  name: string;
  nickname: string;
  code: string;
  competitionStandings: {
    won: number;
    lost: number;
    pointsAverage: number;
    reboundsTotalAverage: number;
    assistsAverage: number;
    fieldGoalsPercentage: number;
  };
};

const TEAM_STAT_FIELD: Record<string, keyof TeamItem['competitionStandings'] | null> = {
  POINTS_AVG:                'pointsAverage',
  REBOUNDS_AVG:              'reboundsTotalAverage',
  ASSISTS_AVG:               'assistsAverage',
  FIELD_GOALS_AVG:           'fieldGoalsPercentage',
  BLOCKS_AVG:                null,
  STEALS_AVG:                null,
  THREE_POINTERS_MADE_AVG:   null,
  THREE_POINTERS_PERCENTAGE: null,
  TURNOVERS_AVG:             null,
  FREE_THROWS_PERCENTAGE:    null,
};

const DEFAULT_FILTERS: StatsFilters = {
  season: null,
  phase: 'REGULAR',
  view: 'AVERAGE',
};

export default function EstadisticasPageClient() {
  const [activeTab, setActiveTab] = useState<PageTab>('jugadores');
  const [activeStatCode, setActiveStatCode] = useState('POINTS_AVG');
  const [filters, setFilters] = useState<StatsFilters>(DEFAULT_FILTERS);

  const players: PlayerItem[] = [
    { player: { providerId: 'p1', name: 'Carlos Velázquez', teamCode: 'BAY' }, gamesPlayed: 18, value: 24.3 },
    { player: { providerId: 'p2', name: 'Javier Morales',   teamCode: 'QUE' }, gamesPlayed: 16, value: 22.1 },
    { player: { providerId: 'p3', name: 'Miguel Rivera',    teamCode: 'PON' }, gamesPlayed: 17, value: 19.8 },
    { player: { providerId: 'p4', name: 'Luis Santana',     teamCode: 'AGU' }, gamesPlayed: 15, value: 18.5 },
    { player: { providerId: 'p5', name: 'Héctor Colón',     teamCode: 'SCE' }, gamesPlayed: 18, value: 17.2 },
  ];
  const playerLoading = false;

  const teams: TeamItem[] = [
    { name: 'Vaqueros',    nickname: 'Vaqueros de Bayamón',      code: 'BAY', competitionStandings: { won: 14, lost: 4,  pointsAverage: 98.2, reboundsTotalAverage: 41.3, assistsAverage: 22.1, fieldGoalsPercentage: 0.487 } },
    { name: 'Piratas',     nickname: 'Piratas de Quebradillas',  code: 'QUE', competitionStandings: { won: 12, lost: 6,  pointsAverage: 94.7, reboundsTotalAverage: 39.8, assistsAverage: 20.4, fieldGoalsPercentage: 0.462 } },
    { name: 'Leones',      nickname: 'Leones de Ponce',          code: 'PON', competitionStandings: { won: 11, lost: 7,  pointsAverage: 91.5, reboundsTotalAverage: 38.6, assistsAverage: 19.7, fieldGoalsPercentage: 0.451 } },
    { name: 'Santeros',    nickname: 'Santeros de Aguada',       code: 'AGU', competitionStandings: { won: 9,  lost: 9,  pointsAverage: 88.3, reboundsTotalAverage: 37.2, assistsAverage: 18.9, fieldGoalsPercentage: 0.438 } },
    { name: 'Cangrejeros', nickname: 'Cangrejeros de Santurce',  code: 'SCE', competitionStandings: { won: 7,  lost: 11, pointsAverage: 85.1, reboundsTotalAverage: 35.9, assistsAverage: 17.6, fieldGoalsPercentage: 0.421 } },
  ];
  const teamLoading = false;

  const activeCategory =
    STAT_CATEGORIES.find((c) => c.code === activeStatCode) ?? STAT_CATEGORIES[0];

  const handleStatCodeChange = (code: string) => {
    setActiveStatCode(code);
  };

  return (
    <>
      {/* Hero */}
      <div className="bg-bsn border-b border-white/10">
        <div className="container">
          {/* Desktop separator line */}
          <div className="hidden lg:block border-b border-white/10" />

          {/* Mobile layout: title left, tabs right on same row */}
          <div className="flex items-center justify-between py-8 lg:hidden">
            <h1 className="font-special-gothic-condensed-one text-white text-[38px] tracking-[0.4px]">
              Estadísticas
            </h1>
            <div className="flex gap-6">
              {(['jugadores', 'equipos'] as PageTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative font-special-gothic-condensed-one text-[20px] pb-2 capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/75 active:text-white/60'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop layout: centered title + tabs */}
          <div className="hidden lg:block pt-[50px] pb-11 text-center">
            <h1 className="font-special-gothic-condensed-one text-white text-[42px] tracking-[0.4px] mb-5">
              Estadísticas
            </h1>
            <div className="flex justify-center gap-8">
              {(['jugadores', 'equipos'] as PageTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative font-special-gothic-condensed-one text-[20px] pb-2 capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/75 active:text-white/60'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#fdfdfd]">
        <div className="container py-8 lg:pt-[50px] lg:pb-12">
          {/* Mobile: filters box */}
          <div className="lg:hidden mb-4">
            <StatsFiltersBox onApply={setFilters} />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-[47px] no-scrollbar lg:justify-center lg:flex-wrap lg:overflow-visible">
            {STAT_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => handleStatCodeChange(cat.code)}
                className={`flex-none px-[18px] py-[7px] rounded-[100px] border text-[15px] font-special-gothic-condensed-one tracking-[0.3px] whitespace-nowrap transition-colors ${
                  activeStatCode === cat.code
                    ? 'bg-[#0F171F] border-[#0F171F] text-white'
                    : 'bg-white border-[#d5d5d5] text-[#0F171F] hover:border-[#0F171F]/40 hover:bg-[#F8F8F8] active:scale-[0.97]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row lg:gap-[50px] lg:items-start">
            {/* ── Left column ── */}
            <div className="flex-1 min-w-0">

              {/* ── JUGADORES TAB ── */}
              {activeTab === 'jugadores' && (
                <>
                  {/* Table title + meta */}
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="font-special-gothic-condensed-one text-[22px] lg:text-[24px] text-[rgba(15,23,31,0.9)] tracking-[0.22px]">
                      {STAT_TITLE[activeStatCode]}
                    </h2>
                    <span className="hidden lg:block font-barlow text-[13px] text-[rgba(0,0,0,0.4)]">
                      2026 &bull; Temporada Regular &bull;{' '}
                      {filters.view === 'AVERAGE' ? 'Promedios' : 'Totales'}
                    </span>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-[44px_1fr_80px_36px_52px] lg:grid-cols-[56px_44px_1fr_96px_56px_76px] gap-x-3 lg:gap-x-2 items-center py-2 border-b border-[rgba(0,0,0,0.1)] mb-0.5">
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-center">
                      RANK
                    </span>
                    <span className="lg:col-span-2 font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase">
                      JUGADOR
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-center">
                      EQUIPO
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-center">
                      PJ
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-right">
                      {activeCategory.shortLabel}
                    </span>
                  </div>

                  {/* Loading skeletons */}
                  {playerLoading &&
                    players.length === 0 &&
                    Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`px-0 py-3 ${i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}`}
                      >
                        <ShimmerLine />
                      </div>
                    ))}

                  {/* Player rows */}
                  {players.map((item, index) => (
                    <Link
                      key={item.player.providerId}
                      href={`/jugadores/${item.player.providerId}`}
                      className={`grid grid-cols-[44px_1fr_80px_36px_52px] lg:grid-cols-[56px_44px_1fr_96px_56px_76px] gap-x-3 lg:gap-x-2 items-center py-[8px] -mx-2 px-2 rounded transition-colors duration-150 ${
                        index % 2 === 1 ? 'bg-[#f9f9f9] hover:bg-[#efefef]' : 'hover:bg-[#f5f5f5]'
                      } active:brightness-95`}
                    >
                      <span className="font-barlow-condensed text-[14px] text-[rgba(0,0,0,0.8)] tracking-[0.42px] text-center">
                        {index + 1}
                      </span>
                      <div
                        className="hidden lg:block rounded-full overflow-hidden shrink-0"
                        style={{
                          width: 32,
                          height: 32,
                          outline: '0.5px solid rgba(81,81,81,0.25)',
                        }}
                      >
                        <PlayerPhotoAvatar
                          photoUrl={item.player.avatarUrl ?? ''}
                          size={32}
                          name={item.player.name}
                        />
                      </div>
                      <span className="font-special-gothic-condensed-one text-[16px] text-[rgba(15,23,31,0.9)] tracking-[0.15px] leading-[1.4] pr-2">
                        {item.player.name}
                      </span>
                      <div className="flex items-center justify-center gap-1">
                        {TEAM_LOGO_MAP[item.player.teamCode] && (
                          <img
                            src={`/assets/images/teams/${TEAM_LOGO_MAP[item.player.teamCode]}.png`}
                            alt={item.player.teamCode}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        )}
                        <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.7)]">
                          {item.player.teamCode}
                        </span>
                      </div>
                      <span className="font-barlow text-[13px] text-[rgba(15,23,31,0.5)] text-center">
                        {item.gamesPlayed ?? '—'}
                      </span>
                      <span className="font-special-gothic-condensed-one text-[20px] text-[#0F171F] text-right tracking-[0.2px]">
                        {numeral(item.value).format('0.0')}
                      </span>
                    </Link>
                  ))}

                  {!playerLoading && players.length === 0 && (
                    <div className="py-12 text-center font-barlow text-sm text-[rgba(0,0,0,0.4)]">
                      No hay datos disponibles.
                    </div>
                  )}

                  {/* Load more */}
                  {players.length > 0 && (
                    <div className="flex justify-center mt-4">
                      <button className="bg-[#FCFCFC] border border-[#D9D3D3] cursor-pointer px-4 py-2.5 rounded-[12px] w-full transition-all duration-150 hover:bg-[#F4F4F4] hover:border-[#C5BFBF] active:scale-[0.97]">
                        <span className="text-base text-black tracking-[2%]">
                          Cargar más
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── EQUIPOS TAB ── */}
              {activeTab === 'equipos' && (
                <>
                  {/* Table title + meta */}
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="font-special-gothic-condensed-one text-[22px] lg:text-[24px] text-[rgba(15,23,31,0.9)] tracking-[0.22px]">
                      {STAT_TITLE[activeStatCode]}
                    </h2>
                    <span className="hidden lg:block font-barlow text-[13px] text-[rgba(0,0,0,0.4)]">
                      2026 &bull; Temporada Regular &bull;{' '}
                      {filters.view === 'AVERAGE' ? 'Promedios' : 'Totales'}
                    </span>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-[44px_1fr_40px_52px] lg:grid-cols-[56px_1fr_56px_76px] items-center py-2 border-b border-[rgba(0,0,0,0.1)] mb-0.5">
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-center">
                      RANK
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase">
                      EQUIPO
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-center">
                      PJ
                    </span>
                    <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.6)] tracking-[1.1px] uppercase text-right">
                      {activeCategory.shortLabel}
                    </span>
                  </div>

                  {/* Loading skeletons */}
                  {teamLoading &&
                    teams.length === 0 &&
                    Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`px-0 py-3 ${i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}`}
                      >
                        <ShimmerLine />
                      </div>
                    ))}

                  {/* Team rows */}
                  {teams.map((team, index) => {
                    const gamesPlayed = team.competitionStandings.won + team.competitionStandings.lost;
                    const field = TEAM_STAT_FIELD[activeStatCode];
                    const statVal = field ? team.competitionStandings[field] : null;
                    const isPercentage = activeStatCode === 'FIELD_GOALS_AVG' || activeStatCode === 'FREE_THROWS_PERCENTAGE' || activeStatCode === 'THREE_POINTERS_PERCENTAGE';
                    const formattedVal = statVal !== null
                      ? isPercentage
                        ? numeral(statVal).format('0.0%')
                        : numeral(statVal).format('0.0')
                      : '—';
                    return (
                      <Link
                        key={team.code}
                        href={`/equipos/${team.code.toLowerCase()}`}
                        className={`grid grid-cols-[44px_1fr_40px_52px] lg:grid-cols-[56px_1fr_56px_76px] items-center py-[8px] -mx-2 px-2 rounded transition-colors duration-150 ${
                          index % 2 === 1 ? 'bg-[#f9f9f9] hover:bg-[#efefef]' : 'hover:bg-[#f5f5f5]'
                        } active:brightness-95`}
                      >
                        <span className="font-barlow-condensed text-[14px] text-[rgba(0,0,0,0.8)] tracking-[0.42px] text-center">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2 pr-2">
                          {TEAM_LOGO_MAP[team.code] && (
                            <img
                              src={`/assets/images/teams/${TEAM_LOGO_MAP[team.code]}.png`}
                              alt={team.nickname}
                              width={24}
                              height={24}
                              className="object-contain shrink-0"
                            />
                          )}
                          <span className="font-special-gothic-condensed-one text-[16px] text-[rgba(15,23,31,0.9)] tracking-[0.15px] leading-[1.4]">
                            {team.name}
                          </span>
                        </div>
                        <span className="font-barlow text-[13px] text-[rgba(15,23,31,0.5)] text-center">
                          {gamesPlayed}
                        </span>
                        <span className="font-special-gothic-condensed-one text-[20px] text-[#0F171F] text-right tracking-[0.2px]">
                          {formattedVal}
                        </span>
                      </Link>
                    );
                  })}

                  {!teamLoading && teams.length === 0 && (
                    <div className="py-12 text-center font-barlow text-sm text-[rgba(0,0,0,0.4)]">
                      No hay datos disponibles.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Right column: Filters (desktop only) ── */}
            <div className="hidden lg:block w-[340px] shrink-0 sticky top-6">
              <StatsFiltersBox onApply={setFilters} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
