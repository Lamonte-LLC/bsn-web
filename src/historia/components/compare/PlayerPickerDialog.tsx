'use client';

import { useRef, useState } from 'react';
import cx from 'classnames';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { cls } from '@/archivo/lib/tokens';
import { useDebouncedValue } from '@/historia/hooks/useDebouncedValue';
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
  subtitle: string | null;
  avatarUrl: string | null;
};

// Lista fija mostrada cuando el buscador está vacío. `key` es el providerId (synergy_player_id) real del
// jugador — el comparador lo usa para buscar sus estadísticas vía GraphQL.
const FEATURED_PLAYERS: Row[] = [
  { key: 'ee18f61d-ca01-11f0-b7ec-a99038a1fbbd', name: 'Alejandro Carmona', subtitle: 'apodo: Bimbo', avatarUrl: null },
  { key: 'fb389a5a-ca01-11f0-8b4d-f7854434301d', name: 'Ángel L. Figueroa', subtitle: 'apodo: Buster', avatarUrl: null },
  { key: '094709e4-ca02-11f0-8e57-2947a4531972', name: 'Ángel Santiago', subtitle: 'apodo: Cachorro', avatarUrl: null },
  { key: '1584fdd8-ca02-11f0-a8a7-0156807f34ad', name: 'Carlos Escalera', subtitle: null, avatarUrl: null },
  { key: 'ee5090d1-ca01-11f0-8d23-a99038a1fbbd', name: 'Christian Dalmau', subtitle: null, avatarUrl: null },
  { key: '2101dcad-ca02-11f0-b3e2-6f0b73cc7b14', name: 'Danny Vassallo', subtitle: null, avatarUrl: null },
  { key: 'fae38fa0-ca01-11f0-a2c0-f7854434301d', name: 'Eddie Casiano', subtitle: null, avatarUrl: null },
  { key: '221c056b-ca02-11f0-9ba3-6f0b73cc7b14', name: 'Edgar León', subtitle: null, avatarUrl: null },
  { key: '22b70005-ca02-11f0-ac2f-6f0b73cc7b14', name: 'Edwin Pellot', subtitle: null, avatarUrl: null },
  { key: '966cbbac-ca02-11f0-a0dc-3d891f4e2262', name: 'Elías Ayuso', subtitle: 'apodo: Larry', avatarUrl: null },
  { key: '2da3fbb3-ca02-11f0-8d97-650b8c4fa4ab', name: 'Federico López', subtitle: 'apodo: Fico', avatarUrl: null },
  { key: '2e1e326d-ca02-11f0-a5b9-650b8c4fa4ab', name: 'Ferdinand Morales-Martínez', subtitle: null, avatarUrl: null },
  { key: '3020d449-ca02-11f0-9932-650b8c4fa4ab', name: 'George Torres', subtitle: 'apodo: Georgie', avatarUrl: null },
  { key: '318b97e5-ca02-11f0-89fd-650b8c4fa4ab', name: 'Héctor Olivencia', subtitle: null, avatarUrl: null },
  { key: 'e0bdb52a-0e6d-472d-a189-093ab0772996', name: 'James Carter Gaudino', subtitle: 'apodo: El Presidente', avatarUrl: null },
  { key: '3d1d177a-ca02-11f0-a341-3df4b613eaf5', name: 'Javier Antonio Colón', subtitle: 'apodo: Toñito', avatarUrl: null },
  { key: 'ef2a4aba-ca01-11f0-aa76-a99038a1fbbd', name: 'Javier Mojica', subtitle: null, avatarUrl: 'https://images.dc.connect.sportradar.com/b12pt/c0a6dcfbdf9049159898b354f470db98' },
  { key: '3d7baed3-ca02-11f0-a9cf-3df4b613eaf5', name: 'Jerome Alfred Mincy', subtitle: null, avatarUrl: null },
  { key: '47ef5694-ca02-11f0-8c80-2510103012e8', name: 'José Quiñonez', subtitle: 'apodo: Willie', avatarUrl: null },
  { key: '4a7ab576-ca02-11f0-929b-2510103012e8', name: 'José Rafael Ortiz', subtitle: 'apodo: Piculín', avatarUrl: null },
  { key: '48286087-ca02-11f0-87b1-2510103012e8', name: 'José Sosa', subtitle: 'apodo: El Galgo', avatarUrl: null },
  { key: '543c2288-ca02-11f0-86e0-8d3aaf62361d', name: 'Juan Trinidad', subtitle: null, avatarUrl: null },
  { key: '62272e4f-ca02-11f0-bf87-6f0b73cc7b14', name: 'Mario Alberto Butler', subtitle: null, avatarUrl: null },
  { key: '200c54cd-3863-479e-9d4c-6d13cf4b63c2', name: 'Mario Morales Micheo', subtitle: 'apodo: Quijote', avatarUrl: null },
  { key: '63fe15e7-ca02-11f0-8b44-6f0b73cc7b14', name: 'Neftali Rivera', subtitle: null, avatarUrl: null },
  { key: '6e118128-ca02-11f0-9f90-2787a1800dda', name: 'Orlando Santiago', subtitle: 'apodo: Guayacán', avatarUrl: null },
  { key: '6e0ad816-ca02-11f0-85c9-2787a1800dda', name: 'Orlando Vega', subtitle: null, avatarUrl: null },
  { key: '8bd648fc-86eb-4ce1-a952-f1461f9e454a', name: 'Pablo Alicea Rodríguez', subtitle: 'apodo: Pablito', avatarUrl: null },
  { key: 'efb4581a-ca01-11f0-a8b8-a99038a1fbbd', name: 'Peter John Ramos', subtitle: null, avatarUrl: null },
  { key: '7155b13b-ca02-11f0-b374-2787a1800dda', name: 'Raymond Dalmau', subtitle: null, avatarUrl: null },
  { key: '86bb53f4-5ee5-4f49-b0b7-2500cce981ba', name: 'Raymond Dalmau Santana', subtitle: 'apodo: Richie', avatarUrl: null },
  { key: '7a8ba2a1-ca02-11f0-891e-71bd8dec4466', name: 'Ricardo Dalmau', subtitle: null, avatarUrl: null },
  { key: '7be98cc0-ca02-11f0-8f35-71bd8dec4466', name: 'Roberto José Hatton', subtitle: 'apodo: Bobby Joe', avatarUrl: null },
  { key: '7bf28e41-ca02-11f0-aaee-71bd8dec4466', name: 'Roberto Ríos', subtitle: 'apodo: Bobby', avatarUrl: null },
  { key: '7c32b641-ca02-11f0-b842-71bd8dec4466', name: 'Rolando Frazer', subtitle: null, avatarUrl: null },
  { key: '7ca87a74-ca02-11f0-a540-71bd8dec4466', name: 'Rubén Rodríguez', subtitle: null, avatarUrl: null },
  { key: '87d15c8c-ca02-11f0-ac10-09a696a15fdb', name: 'Teofilo Cruz', subtitle: 'apodo: Teo', avatarUrl: null },
  { key: '8934c428-ca02-11f0-b9f5-09a696a15fdb', name: 'Wesley Correa', subtitle: 'apodo: Wes', avatarUrl: null },
  { key: '895b79a1-ca02-11f0-8d8d-09a696a15fdb', name: 'Wilfredo Meléndez', subtitle: 'apodo: Willito', avatarUrl: null },
  { key: 'ef8529a9-ca01-11f0-b1a5-a99038a1fbbd', name: 'Wilfredo Pagán', subtitle: null, avatarUrl: null },
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

  const shown: Row[] = typing
    ? players.map((p) => ({ key: p.providerId, name: p.name, subtitle: p.nickname ? `apodo: ${p.nickname}` : positionLabel(p.playingPosition), avatarUrl: p.avatarUrl }))
    : FEATURED_PLAYERS;

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
      <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-0 md:items-center md:p-4">
        <DialogPanel className="flex max-h-[92vh] w-full max-w-[560px] flex-col rounded-t-[16px] border border-[#E2E2E2] bg-white p-[18px] shadow-[0px_2px_14px_rgba(14,20,32,0.08)] md:max-h-[80vh] md:rounded-[16px] md:p-[24px]">
          <div className="mb-[14px] flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[20px] text-[#0F171F] md:text-[24px]">Escoge un jugador</DialogTitle>
              <p className="mt-[4px] font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] md:text-[13px]">
                De {MIN_COMPARE_PLAYERS} a {MAX_COMPARE_PLAYERS} jugadores, activos o históricos, de cualquier época.
              </p>
            </div>
            <button type="button" onClick={close} aria-label="Cerrar" className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EAEAEA] transition-colors hover:border-[rgba(47,47,47,1)]">
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
              aria-label="Buscar jugador"
              className="h-[46px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] pl-[42px] pr-[14px] font-barlow text-[15px] text-[#0F171F] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(15,23,31,0.4)] focus:border-[#0F171F] focus:bg-white [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          <div className="mt-[10px] flex items-center justify-between font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] text-[rgba(15,23,31,0.4)]">
            <span>{typing ? 'Resultados' : 'Jugadores'}</span>
            <span className="tabular-nums">{busy ? '' : `${shown.length}`}</span>
          </div>

          <ul role="listbox" aria-busy={busy} aria-label={typing ? 'Resultados' : 'Jugadores'} className="mt-[6px] h-[500px] flex-1 overflow-y-auto rounded-[10px] border border-[rgba(15,23,31,0.08)]">
            {busy ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Buscando…</li>
            ) : !shown.length ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">{typing ? `Sin resultados para “${query.trim()}”. Prueba sin acentos o con el apellido.` : 'Sin jugadores por ahora.'}</li>
            ) : (
              shown.map((r, i) => {
                const taken = selectedKeys.includes(r.key);
                return (
                  <li key={r.key} role="option" aria-selected={taken} className={i ? 'border-t border-[rgba(15,23,31,0.05)]' : ''}>
                    <button type="button" disabled={taken || isFull} onClick={() => pick(r.key)} className={cx(`flex min-h-[52px] w-full items-center gap-[12px] px-[14px] py-[8px] text-left transition-colors duration-150 ${cls.focus} focus-visible:outline-offset-[-2px]`, taken || isFull ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-[#F5F5F5] active:bg-[#EDEDED] motion-reduce:transition-none')}>
                      {r.avatarUrl ? <img src={`${r.avatarUrl}?size=200`} alt="" width={36} height={36} loading="lazy" className="h-[36px] w-[36px] shrink-0 rounded-full border border-[#E5E5E5] object-cover" /> : <PlayerAvatar name={r.name} sizePx={36} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{r.name}</span>
                        <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">
                          {r.subtitle}
                          {taken ? <span className="ml-[6px]">· ya está en la comparación</span> : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="mt-[14px] flex items-center justify-between gap-4">
            <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] md:text-[12px]">
              {selectedKeys.length} de {MAX_COMPARE_PLAYERS} seleccionados
            </span>
            <button type="button" onClick={close} className="cursor-pointer rounded-[100px] bg-[#0F171F] px-[18px] py-[7px] text-[15px] text-white transition-opacity">
              {selectedKeys.length >= MIN_COMPARE_PLAYERS ? 'Ver comparación' : 'Cerrar'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
