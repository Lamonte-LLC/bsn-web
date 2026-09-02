'use client';

import { useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { fmt } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import type { ScoringClubFile } from '@/archivo/lib/types';

const PAGE = 40;

export default function ScoringClubClient({ data, franchises }: { data: ScoringClubFile; franchises: Record<string, FranchiseView> }) {
  const [threshold, setThreshold] = useState('20');
  const [visible, setVisible] = useState(PAGE);
  const list = data.byThreshold[threshold] ?? [];
  const max = Math.max(1, ...data.byDecade.map((d) => d.counts[threshold] ?? 0));

  return (
    <div>
      <div role="radiogroup" aria-label="Umbral de puntos por juego" className="mb-6 flex flex-wrap gap-[8px]">
        {data.thresholds.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={threshold === String(t)}
            data-selected={threshold === String(t) ? '' : undefined}
            onClick={() => {
              setThreshold(String(t));
              setVisible(PAGE);
            }}
            className={TAB_PILL}
          >
            {t}+ PPJ
          </button>
        ))}
      </div>

      <div className="mb-8 rounded-[12px] border border-[#EAEAEA] bg-white p-[16px]">
        <p className="mb-[12px] font-barlow text-[12px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.6)]">Temporadas de {threshold}+ PPJ por década</p>
        <ol className="flex flex-col gap-[8px]">
          {data.byDecade.map((d) => {
            const n = d.counts[threshold] ?? 0;
            return (
              <li key={d.decade} className="grid grid-cols-[52px_1fr_44px] items-center gap-3">
                <span className="font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.8)]">{d.decade}s</span>
                <span className="h-[22px] rounded-[4px] bg-[#0F171F]" style={{ width: `${Math.max(n ? 2 : 0, (n / max) * 100)}%` }} />
                <span className="text-right text-[18px] text-black [font-variant-numeric:tabular-nums]">{n}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-[12px] border border-[#EAEAEA] bg-white">
        <div className="grid grid-cols-[1fr_64px_64px] gap-2 border-b border-[rgba(0,0,0,0.07)] px-[12px] py-[8px] font-barlow text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)] md:grid-cols-[1fr_120px_64px_64px]">
          <span>Jugador · año</span>
          <span className="hidden md:block">Equipo</span>
          <span className="text-right">PPJ</span>
          <span className="text-right">J</span>
        </div>
        <ol>
          {list.slice(0, visible).map((s, i) => {
            const f = s.franchiseSlug ? franchises[s.franchiseSlug] : null;
            return (
              <li key={`${s.playerId}-${s.year}`} className={`grid min-h-[48px] grid-cols-[1fr_64px_64px] items-center gap-2 px-[12px] py-[5px] md:grid-cols-[1fr_120px_64px_64px] ${i ? 'border-t border-[rgba(0,0,0,0.05)]' : ''}`}>
                <span className="flex min-w-0 items-center gap-[8px]">
                  <span className="w-[24px] shrink-0 font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 1}</span>
                  <Link href={`/archivo/jugadores/${s.slug}`} className="min-w-0 truncate text-[16px] text-[rgba(15,23,31,0.9)] hover:underline">
                    {s.name}
                  </Link>
                  <Link href={`/archivo/temporadas/${s.year}`} className="shrink-0 font-barlow text-[13px] text-[rgba(15,23,31,0.55)] hover:underline">
                    {s.year}
                  </Link>
                </span>
                <span className="hidden items-center gap-[6px] md:flex">
                  <FranchiseLogo franchise={f} fallbackName={s.franchiseSlug ?? ''} sizePx={18} />
                  {f ? (
                    <Link href={`/archivo/franquicias/${f.slug}`} className="truncate font-barlow text-[13px] text-[rgba(15,23,31,0.7)] hover:underline">
                      {f.nickname}
                    </Link>
                  ) : null}
                </span>
                <span className="text-right text-[18px] text-black [font-variant-numeric:tabular-nums]">{fmt(s.ppg)}</span>
                <span className="text-right font-barlow text-[14px] text-[rgba(15,23,31,0.7)] [font-variant-numeric:tabular-nums]">{s.g}</span>
              </li>
            );
          })}
        </ol>
        {visible < list.length ? (
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="w-full border-t border-[rgba(0,0,0,0.07)] px-4 py-[12px] text-[16px] text-black transition-colors duration-150 hover:bg-[#FAFAFA]">
            Ver más ({list.length - visible} restantes)
          </button>
        ) : null}
      </div>
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">Serie Regular, mínimo {data.minGames} juegos. {list.length} temporadas cumplen el umbral de {threshold} puntos por juego.</p>
    </div>
  );
}
