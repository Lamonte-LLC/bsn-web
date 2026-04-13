'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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

const PAGE_SIZE = 25;

export type JugadorItem = {
  providerId: string;
  name: string;
  avatarUrl: string | null;
  teamCode: string;
  playingPosition: string;
  height: number;
  weight: number;
  dob: string;
};

type Props = {
  players: JugadorItem[];
};

export default function JugadoresPageClient({ players }: Props) {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return players.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesTeam = !teamFilter || p.teamCode === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [players, search, teamFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleTeamFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeamFilter(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const searchInput = (dark?: boolean) => (
    <div className="relative">
      <div className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <circle cx="7.5" cy="7.5" r="5.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" />
          <path d="M11.5 11.5L14.5 14.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Buscar jugador..."
        className="w-full h-[41px] pl-[36px] pr-3 bg-[#f6f6f6] border border-white/80 rounded-[6px] font-barlow font-medium text-[14px] text-[rgba(15,23,31,0.9)] placeholder:text-[rgba(15,23,31,0.5)] outline-none focus:border-[rgba(15,23,31,0.2)] tracking-[-0.14px]"
      />
    </div>
  );

  const teamDropdown = (dark?: boolean) => (
    <div>
      <p className={`font-barlow font-semibold text-[13px] tracking-[-0.13px] mb-1.5 ${dark ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(15,23,31,0.5)]'}`}>
        Filtrar por equipo
      </p>
      <div className="relative">
        <select
          value={teamFilter}
          onChange={handleTeamFilter}
          className="w-full h-[41px] pl-3 pr-8 bg-[#fafafa] border border-white/80 rounded-[6px] font-barlow font-medium text-[14px] text-[rgba(15,23,31,0.9)] appearance-none outline-none cursor-pointer focus:border-[rgba(15,23,31,0.2)] tracking-[-0.14px]"
        >
          <option value="">Todos los equipos</option>
          {Object.entries(TEAM_DISPLAY_NAMES)
            .sort(([, a], [, b]) => a.localeCompare(b, 'es'))
            .map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hero — title + mobile filters */}
      <div className="bg-bsn border-b border-white/10">
        <div className="container">
          <div className="hidden lg:block border-b border-white/10" />
          <div className="pt-8 pb-6 lg:pt-[50px] lg:pb-11">
            <h1 className="font-special-gothic-condensed-one text-white text-center text-[38px] lg:text-[42px] tracking-[0.4px] mb-6 lg:mb-0">
              Jugadores
            </h1>
            <div className="flex flex-col gap-3 lg:hidden">
              {searchInput(true)}
              {teamDropdown(true)}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#fdfdfd]">
        <div className="container py-6 lg:pt-[50px] lg:pb-12">
          <div className="flex flex-col lg:flex-row lg:gap-[50px] lg:items-start">

            {/* Player table */}
            <div className="flex-1 min-w-0">

              {/* Count */}
              <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.7)] mb-[30px] lg:mb-[35px]">
                Mostrando {visible.length} de {filtered.length} jugadores
              </p>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_110px_52px] lg:grid-cols-[1fr_200px_64px] items-center py-2 border-b border-[rgba(0,0,0,0.08)]">
                <span className="font-special-gothic-condensed-one text-[13px] text-[rgba(0,0,0,0.6)] tracking-[1.17px] uppercase pl-1">
                  JUGADOR
                </span>
                <span className="font-special-gothic-condensed-one text-[13px] text-[rgba(0,0,0,0.6)] tracking-[1.17px] uppercase">
                  EQUIPO
                </span>
                <span className="font-special-gothic-condensed-one text-[13px] text-[rgba(0,0,0,0.6)] tracking-[1.17px] uppercase text-center">
                  POS
                </span>
              </div>

              {/* Player rows */}
              {visible.map((p, index) => (
                <Link
                  key={p.providerId}
                  href={`/jugadores/${p.providerId}`}
                  className={`grid grid-cols-[1fr_110px_52px] lg:grid-cols-[1fr_200px_64px] items-center py-[9px] -mx-2 px-2 rounded transition-colors duration-150 ${
                    index % 2 === 1 ? 'bg-[#f9f9f9] hover:bg-[#efefef]' : 'hover:bg-[#f5f5f5]'
                  } active:brightness-95`}
                >
                  <div className="flex items-center gap-2.5 pl-1 min-w-0">
                    <div
                      className="rounded-full overflow-hidden shrink-0"
                      style={{ width: 32, height: 32, outline: '0.5px solid rgba(81,81,81,0.25)' }}
                    >
                      <PlayerPhotoAvatar
                        photoUrl={p.avatarUrl ?? ''}
                        size={32}
                        name={p.name}
                      />
                    </div>
                    <span className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.9)] tracking-[0.15px] leading-[1.4] truncate">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-start gap-1.5 pl-2 lg:pl-0">
                    {TEAM_LOGO_MAP[p.teamCode] && (
                      <img
                        src={`/assets/images/teams/${TEAM_LOGO_MAP[p.teamCode]}.png`}
                        alt={p.teamCode}
                        width={18}
                        height={18}
                        className="object-contain shrink-0"
                      />
                    )}
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)] truncate">
                      <span className="lg:hidden">{TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode}</span>
                      <span className="hidden lg:inline">{TEAM_FULL_NAME[p.teamCode] ?? p.teamCode}</span>
                    </span>
                  </div>
                  <span className="font-barlow font-medium text-[13px] text-[#0f171f] text-center">
                    {p.playingPosition || '—'}
                  </span>
                </Link>
              ))}

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="py-12 text-center font-barlow text-sm text-[rgba(0,0,0,0.4)]">
                  No se encontraron jugadores.
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className="mt-4">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="bg-[#fcfcfc] border border-[#d9d3d3] cursor-pointer px-4 py-2.5 rounded-[12px] w-full transition-all duration-150 hover:bg-[#f4f4f4] hover:border-[#c5bfbf] active:scale-[0.97]"
                  >
                    <span className="font-special-gothic-condensed-one text-[16px] text-black tracking-[0.32px]">
                      Cargar más jugadores
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop sticky sidebar */}
            <div className="hidden lg:block w-[360px] shrink-0 sticky top-6">
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
                <div className="px-[30px] pt-6 pb-0">
                  <h3 className="font-special-gothic-condensed-one text-2xl text-[rgba(15,23,31,0.9)] tracking-[0.24px]">
                    Filtros
                  </h3>
                </div>
                <div className="px-[30px] pt-5 pb-6 space-y-5">
                  {/* Search */}
                  <div className="space-y-[5px]">
                    <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)] tracking-[-0.13px]">
                      Buscar
                    </label>
                    <div className="relative">
                      <div className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 17 17" fill="none">
                          <circle cx="7.5" cy="7.5" r="5.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" />
                          <path d="M11.5 11.5L14.5 14.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Buscar jugador..."
                        className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] pl-[34px] pr-4 rounded-[6px] text-sm font-barlow font-medium text-[rgba(15,23,31,0.9)] tracking-[-0.14px] w-full outline-none focus:border-[rgba(15,23,31,0.2)] placeholder:text-[rgba(15,23,31,0.4)]"
                      />
                    </div>
                  </div>
                  {/* Team */}
                  <div className="space-y-[5px]">
                    <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)] tracking-[-0.13px]">
                      Por equipo
                    </label>
                    <div className="relative">
                      <select
                        value={teamFilter}
                        onChange={handleTeamFilter}
                        className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] pl-4 pr-10 rounded-[6px] text-sm font-barlow font-medium text-[rgba(15,23,31,0.9)] tracking-[-0.14px] w-full appearance-none cursor-pointer outline-none"
                      >
                        <option value="">Todos los equipos</option>
                        {Object.entries(TEAM_DISPLAY_NAMES)
                          .sort(([, a], [, b]) => a.localeCompare(b, 'es'))
                          .map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                          ))}
                      </select>
                      <img
                        src="/assets/images/icons/icon-chevron-down.png"
                        alt=""
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
