'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { splitForNickname } from '@/archivo/lib/names';
import { cls } from '@/archivo/lib/tokens';
import { useDebouncedValue } from '@/historia/hooks/useDebouncedValue';
import { useAllPlayers } from '@/historia/hooks/useAllPlayers';
import { usePlayerSuggestions } from '@/historia/hooks/usePlayerSuggestions';
import { MAX_COMPARE_PLAYERS, MIN_COMPARE_PLAYERS } from '@/historia/lib/compare-players';
import { positionLabel } from '@/historia/lib/copy';

const RESULTS_LIMIT = 50;

type Props = {
  open: boolean;
  onClose: () => void;
  selectedKeys: string[];
  onPick: (key: string) => void;
};

type Row = {
  key: string;
  name: string;
  /** Apodo, shown inside the name in quotes: Ángel “Cachorro” Santiago. */
  nickname: string | null;
  subtitle: string | null;
  avatarUrl: string | null;
  /** Primary color of the club the player is identified with (most seasons); tints the initials avatar. */
  color: string | null;
};

/** Sticky gray band that names a section of the list and stays in view while it scrolls (design H3). */
/** A player already in the comparison: the row reads as selected (ink-tinted fill, full-contrast name) and ends in an ink check. */
function TakenCheck() {
  return (
    <span className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#0F171F]" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </span>
  );
}

function SectionBand({ children, context, first = false }: { children: React.ReactNode; /** One line of context under the title, Barlow 12px at 50%. */ context?: string; first?: boolean }) {
  return (
    <li className={cx('sticky top-0 z-[1] bg-[#F4F4F4] px-[14px] text-[15px] tracking-[0.3px] text-[#0F171F] shadow-[inset_0_-1px_0_rgba(15,23,31,0.06)]', context ? 'py-[10px]' : 'py-[9px]', !first && 'border-t border-[rgba(15,23,31,0.06)]')} aria-hidden>
      {children}
      {context ? <span className="mt-[2px] block font-barlow text-[12px] tracking-normal text-[rgba(15,23,31,0.5)]">{context}</span> : null}
    </li>
  );
}

/**
 * The name with the nickname in quotes after the first name, the way the fans say it: Ángel “Cachorro” Santiago.
 * The nickname keeps the regular weight so it reads apart from the semibold name; nothing else marks it.
 */
export function NameWithNickname({ name, nickname }: { name: string; nickname: string | null }) {
  const nick = nickname?.trim();
  if (!nick || name.toLowerCase().includes(nick.toLowerCase())) return <>{name}</>;
  const [given, surname] = splitForNickname(name);
  if (!surname) return <>{name} “{nick}”</>;
  return (
    <>
      {given} “{nick}” {surname}
    </>
  );
}

// Lista fija mostrada cuando el buscador está vacío. `key` es el providerId (synergy_player_id) real del
// jugador — el comparador lo usa para buscar sus estadísticas vía GraphQL.
const FEATURED_PLAYERS: Row[] = [
  { key: 'ee18f61d-ca01-11f0-b7ec-a99038a1fbbd', name: 'Alejandro Carmona', nickname: 'Bimbo', subtitle: null, avatarUrl: null, color: "#F5E0BF" },
  { key: 'fb389a5a-ca01-11f0-8b4d-f7854434301d', name: 'Ángel L. Figueroa', nickname: 'Buster', subtitle: null, avatarUrl: null, color: "#FFB900" },
  { key: '094709e4-ca02-11f0-8e57-2947a4531972', name: 'Ángel Santiago', nickname: 'Cachorro', subtitle: null, avatarUrl: null, color: "#7A6440" },
  { key: '1584fdd8-ca02-11f0-a8a7-0156807f34ad', name: 'Carlos Escalera', nickname: null, subtitle: null, avatarUrl: null, color: "#1d7a3a" },
  { key: 'ee5090d1-ca01-11f0-8d23-a99038a1fbbd', name: 'Christian Dalmau', nickname: null, subtitle: null, avatarUrl: null, color: "#F75400" },
  { key: '2101dcad-ca02-11f0-b3e2-6f0b73cc7b14', name: 'Danny Vassallo', nickname: null, subtitle: null, avatarUrl: null, color: "#FFB900" },
  { key: 'fae38fa0-ca01-11f0-a2c0-f7854434301d', name: 'Eddie Casiano', nickname: null, subtitle: null, avatarUrl: null, color: "#F75400" },
  { key: '221c056b-ca02-11f0-9ba3-6f0b73cc7b14', name: 'Edgar León', nickname: null, subtitle: null, avatarUrl: null, color: "#C2542B" },
  { key: '22b70005-ca02-11f0-ac2f-6f0b73cc7b14', name: 'Edwin Pellot', nickname: null, subtitle: null, avatarUrl: null, color: "#3E7A4E" },
  { key: '966cbbac-ca02-11f0-a0dc-3d891f4e2262', name: 'Elías Ayuso', nickname: 'Larry', subtitle: null, avatarUrl: null, color: "#F75400" },
  { key: '2da3fbb3-ca02-11f0-8d97-650b8c4fa4ab', name: 'Federico López', nickname: 'Fico', subtitle: null, avatarUrl: null, color: "#245AA3" },
  { key: '2e1e326d-ca02-11f0-a5b9-650b8c4fa4ab', name: 'Ferdinand Morales-Martínez', nickname: null, subtitle: null, avatarUrl: null, color: "#FFB900" },
  { key: '3020d449-ca02-11f0-9932-650b8c4fa4ab', name: 'George Torres', nickname: 'Georgie', subtitle: null, avatarUrl: null, color: "#C2542B" },
  { key: '318b97e5-ca02-11f0-89fd-650b8c4fa4ab', name: 'Héctor Olivencia', nickname: null, subtitle: null, avatarUrl: null, color: "#DDB7E7" },
  { key: 'e0bdb52a-0e6d-472d-a189-093ab0772996', name: 'James Carter Gaudino', nickname: 'El Presidente', subtitle: null, avatarUrl: null, color: "#5B4E8C" },
  { key: '3d1d177a-ca02-11f0-a341-3df4b613eaf5', name: 'Javier Antonio Colón', nickname: 'Toñito', subtitle: null, avatarUrl: null, color: "#B82027" },
  { key: 'ef2a4aba-ca01-11f0-aa76-a99038a1fbbd', name: 'Javier Mojica', nickname: null, subtitle: null, avatarUrl: 'https://images.dc.connect.sportradar.com/b12pt/c0a6dcfbdf9049159898b354f470db98', color: "#468AD9" },
  { key: '3d7baed3-ca02-11f0-a9cf-3df4b613eaf5', name: 'Jerome Alfred Mincy', nickname: null, subtitle: null, avatarUrl: null, color: "#468AD9" },
  { key: '47ef5694-ca02-11f0-8c80-2510103012e8', name: 'José Quiñonez', nickname: 'Willie', subtitle: null, avatarUrl: null, color: "#DDB7E7" },
  { key: '4a7ab576-ca02-11f0-929b-2510103012e8', name: 'José Rafael Ortiz', nickname: 'Piculín', subtitle: null, avatarUrl: null, color: "#F75400" },
  { key: '48286087-ca02-11f0-87b1-2510103012e8', name: 'José Sosa', nickname: 'El Galgo', subtitle: null, avatarUrl: null, color: "#245AA3" },
  { key: '543c2288-ca02-11f0-86e0-8d3aaf62361d', name: 'Juan Trinidad', nickname: null, subtitle: null, avatarUrl: null, color: "#468AD9" },
  { key: '62272e4f-ca02-11f0-bf87-6f0b73cc7b14', name: 'Mario Alberto Butler', nickname: null, subtitle: null, avatarUrl: null, color: "#4A5A6A" },
  { key: '200c54cd-3863-479e-9d4c-6d13cf4b63c2', name: 'Mario Morales Micheo', nickname: 'Quijote', subtitle: null, avatarUrl: null, color: "#245AA3" },
  { key: '63fe15e7-ca02-11f0-8b44-6f0b73cc7b14', name: 'Neftali Rivera', nickname: null, subtitle: null, avatarUrl: null, color: "#F9170C" },
  { key: '6e118128-ca02-11f0-9f90-2787a1800dda', name: 'Orlando Santiago', nickname: 'Guayacán', subtitle: null, avatarUrl: null, color: "#FA4515" },
  { key: '6e0ad816-ca02-11f0-85c9-2787a1800dda', name: 'Orlando Vega', nickname: null, subtitle: null, avatarUrl: null, color: "#F9170C" },
  { key: '8bd648fc-86eb-4ce1-a952-f1461f9e454a', name: 'Pablo Alicea Rodríguez', nickname: 'Pablito', subtitle: null, avatarUrl: null, color: "#1d7a3a" },
  { key: 'efb4581a-ca01-11f0-a8b8-a99038a1fbbd', name: 'Peter John Ramos', nickname: null, subtitle: null, avatarUrl: null, color: "#DDB7E7" },
  { key: '7155b13b-ca02-11f0-b374-2787a1800dda', name: 'Raymond Dalmau', nickname: null, subtitle: null, avatarUrl: null, color: "#F9170C" },
  { key: '86bb53f4-5ee5-4f49-b0b7-2500cce981ba', name: 'Raymond Dalmau Santana', nickname: 'Richie', subtitle: null, avatarUrl: null, color: "#F9170C" },
  { key: '7a8ba2a1-ca02-11f0-891e-71bd8dec4466', name: 'Ricardo Dalmau', nickname: null, subtitle: null, avatarUrl: null, color: "#F9170C" },
  { key: '7be98cc0-ca02-11f0-8f35-71bd8dec4466', name: 'Roberto José Hatton', nickname: 'Bobby Joe', subtitle: null, avatarUrl: null, color: "#B82027" },
  { key: '7bf28e41-ca02-11f0-aaee-71bd8dec4466', name: 'Roberto Ríos', nickname: 'Bobby', subtitle: null, avatarUrl: null, color: "#B82027" },
  { key: '7c32b641-ca02-11f0-b842-71bd8dec4466', name: 'Rolando Frazer', nickname: null, subtitle: null, avatarUrl: null, color: "#7A6440" },
  { key: '7ca87a74-ca02-11f0-a540-71bd8dec4466', name: 'Rubén Rodríguez', nickname: null, subtitle: null, avatarUrl: null, color: "#468AD9" },
  { key: '87d15c8c-ca02-11f0-ac10-09a696a15fdb', name: 'Teofilo Cruz', nickname: 'Teo', subtitle: null, avatarUrl: null, color: "#FA4515" },
  { key: '8934c428-ca02-11f0-b9f5-09a696a15fdb', name: 'Wesley Correa', nickname: 'Wes', subtitle: null, avatarUrl: null, color: "#4A5A6A" },
  { key: '895b79a1-ca02-11f0-8d8d-09a696a15fdb', name: 'Wilfredo Meléndez', nickname: 'Willito', subtitle: null, avatarUrl: null, color: "#DDB7E7" },
  { key: 'ef8529a9-ca01-11f0-b1a5-a99038a1fbbd', name: 'Wilfredo Pagán', nickname: null, subtitle: null, avatarUrl: null, color: "#4A5A6A" },
];

/**
 * Picker of the player comparison: first 50 players when it opens, server search results once the user types
 * (debounced). Same dialog chrome as CompareTeamPickerDialog. Picking adds and closes.
 */
export default function PlayerPickerDialog({ open, onClose, selectedKeys, onPick }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = selectedKeys.length >= MAX_COMPARE_PLAYERS;
  const typing = query.trim().length > 0;
  const { data: players, loading } = usePlayerSuggestions(debouncedQuery, RESULTS_LIMIT);
  const pending = query.trim() !== debouncedQuery;
  const busy = typing && (pending || loading);

  // Under the featured list, every player of the API from A to Z, a page at a time as the fan scrolls.
  const all = useAllPlayers(!open || typing);
  const featuredKeys = new Set(FEATURED_PLAYERS.map((r) => r.key));
  const everyone: Row[] = all.players.filter((p) => !featuredKeys.has(p.providerId)).map((p) => ({ key: p.providerId, name: p.name, nickname: p.nickname, subtitle: positionLabel(p.playingPosition), avatarUrl: p.avatarUrl, color: null }));
  const shown: Row[] = typing ? players.map((p) => ({ key: p.providerId, name: p.name, nickname: p.nickname, subtitle: positionLabel(p.playingPosition), avatarUrl: p.avatarUrl, color: null })) : FEATURED_PLAYERS;
  const sentinelRef = useRef<HTMLLIElement>(null);
  const { hasMore, loadMore } = all;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typing || !hasMore) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [typing, hasMore, loadMore, everyone.length]);

  const close = () => {
    setQuery('');
    onClose();
  };
  const pick = (key: string) => {
    if (selectedKeys.includes(key) || isFull) return;
    onPick(key);
    close();
  };

  return (
    <Dialog open={open} onClose={close} initialFocus={inputRef} className="relative z-[999]">
      <div className="fixed inset-0 bg-[rgba(15,23,31,0.6)] transition-opacity duration-150" aria-hidden />
      {/* On phones the picker is a full-height sheet anchored to the top: the search sits at the top of the screen,
          above the keyboard, and only the list scrolls. On larger screens it's the centered dialog. */}
      <div className="fixed inset-0 flex items-stretch justify-center md:items-center md:p-4">
        <DialogPanel className="flex h-[100dvh] w-full max-w-[560px] flex-col bg-white px-[14px] pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] md:h-auto md:max-h-[80vh] md:rounded-[16px] md:border md:border-[#E2E2E2] md:p-[24px] md:shadow-[0px_2px_14px_rgba(14,20,32,0.08)]">
          <div className="mb-[12px] flex items-center justify-between gap-4 md:mb-[14px] md:items-start">
            <div>
              <DialogTitle className="text-[20px] text-[#0F171F] md:text-[24px]">Escoge un jugador</DialogTitle>
            </div>
            <button type="button" onClick={close} aria-label="Cerrar" className="relative flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EAEAEA] transition-colors before:absolute before:-inset-[4px] before:content-[''] hover:border-[rgba(47,47,47,1)] md:h-[32px] md:w-[32px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="#0F171F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,.45)" strokeWidth="1.8" strokeLinecap="round" aria-hidden className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre o apodo"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="search"
              enterKeyHint="search"
              aria-label="Buscar jugador"
              className="h-[46px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] pl-[42px] pr-[14px] font-barlow text-[16px] text-[#0F171F] md:text-[15px] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(15,23,31,0.4)] focus:border-[#0F171F] focus:bg-white [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          <ul role="listbox" aria-busy={busy} aria-label={typing ? 'Resultados' : 'Jugadores'} className="mt-[12px] min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[10px] border border-[rgba(15,23,31,0.08)] md:h-[500px]">
            {!busy && shown.length ? (
              <SectionBand first context={typing ? undefined : 'Por puntos, rebotes y asistencias'}>
                {typing ? 'Resultados' : 'Top 40 histórico'}
              </SectionBand>
            ) : null}
            {busy ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Buscando…</li>
            ) : !shown.length ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">{typing ? `Sin resultados para “${query.trim()}”. Prueba sin acentos o con el apellido.` : 'Sin jugadores por ahora.'}</li>
            ) : (
              shown.map((r, i) => {
                const taken = selectedKeys.includes(r.key);
                return (
                  <li key={r.key} role="option" aria-selected={taken} className={i ? 'border-t border-[rgba(15,23,31,0.05)]' : ''}>
                    <button type="button" disabled={taken || isFull} onClick={() => pick(r.key)} className={cx(`flex min-h-[52px] w-full items-center gap-[12px] px-[14px] py-[8px] text-left transition-colors duration-150 ${cls.focus} focus-visible:outline-offset-[-2px]`, taken ? 'cursor-default bg-[#F9F9F9]' : isFull ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-[#F5F5F5] active:bg-[#EDEDED] motion-reduce:transition-none')}>
                      {r.avatarUrl ? <img src={`${r.avatarUrl}?size=200`} alt="" width={36} height={36} loading="lazy" className="h-[36px] w-[36px] shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] object-cover" /> : <PlayerAvatar name={r.name} color={r.color} sizePx={36} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">
                          <NameWithNickname name={r.name} nickname={r.nickname} />
                        </span>
                        {r.subtitle ? <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{r.subtitle}</span> : null}
                      </span>
                      {taken ? <TakenCheck /> : null}
                    </button>
                  </li>
                );
              })
            )}
            {!typing && !busy ? (
              <>
                {/* Same two-line height as the Top 40 band: sticky bands stack at the top, and a shorter one would let the
                    other's context line peek out beneath it. */}
                <SectionBand context="Activos e históricos, de la A a la Z">Todos los jugadores · A-Z</SectionBand>
                {everyone.map((r) => {
                  const taken = selectedKeys.includes(r.key);
                  return (
                    <li key={r.key} role="option" aria-selected={taken} className={everyone[0]?.key === r.key ? '' : 'border-t border-[rgba(15,23,31,0.05)]'}>
                      <button type="button" disabled={taken || isFull} onClick={() => pick(r.key)} className={cx(`flex min-h-[52px] w-full items-center gap-[12px] px-[14px] py-[8px] text-left transition-colors duration-150 ${cls.focus} focus-visible:outline-offset-[-2px]`, taken ? 'cursor-default bg-[#F9F9F9]' : isFull ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-[#F5F5F5] active:bg-[#EDEDED] motion-reduce:transition-none')}>
                        {r.avatarUrl ? <img src={`${r.avatarUrl}?size=200`} alt="" width={36} height={36} loading="lazy" className="h-[36px] w-[36px] shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] object-cover" /> : <PlayerAvatar name={r.name} color={r.color} sizePx={36} />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">
                            <NameWithNickname name={r.name} nickname={r.nickname} />
                          </span>
                          {r.subtitle ? <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{r.subtitle}</span> : null}
                        </span>
                        {taken ? <TakenCheck /> : null}
                      </button>
                    </li>
                  );
                })}
                {hasMore || all.loading ? (
                  <li ref={sentinelRef} aria-hidden className="px-[16px] py-[14px] font-barlow text-[12px] text-[rgba(15,23,31,0.45)]">
                    Cargando más jugadores…
                  </li>
                ) : null}
              </>
            ) : null}
          </ul>

          <div className="mt-[14px] flex items-center justify-between gap-4">
            <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] md:text-[12px]">
              {selectedKeys.length} de {MAX_COMPARE_PLAYERS} seleccionados
            </span>
            <button type="button" onClick={close} className="relative cursor-pointer rounded-[100px] bg-[#0F171F] px-[20px] py-[10px] text-[15px] text-white transition-opacity before:absolute before:inset-x-0 before:-inset-y-[4px] before:content-[''] active:scale-[0.98] motion-reduce:active:scale-100 md:px-[18px] md:py-[7px]">
              {selectedKeys.length >= MIN_COMPARE_PLAYERS ? 'Ver comparación' : 'Cerrar'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
