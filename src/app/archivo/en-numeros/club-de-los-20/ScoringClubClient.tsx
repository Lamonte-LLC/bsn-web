'use client';

import { useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { PaperCard } from '@/archivo/components/ui';
import { fmt } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { hrefs } from '@/archivo/lib/hrefs';
import { cls } from '@/archivo/lib/tokens';
import type { ScoringClubFile } from '@/archivo/lib/types';

const PAGE = 40;

/** `site` points the links at the public site (/jugadores, /temporadas, /equipos) instead of /archivo. */
export default function ScoringClubClient({ data, franchises, site = false }: { data: ScoringClubFile; franchises: Record<string, FranchiseView>; site?: boolean }) {
  const h = hrefs(site);
  const [threshold, setThreshold] = useState('20');
  const [visible, setVisible] = useState(PAGE);
  const list = data.byThreshold[threshold] ?? [];
  const max = Math.max(1, ...data.byDecade.map((d) => d.counts[threshold] ?? 0));

  return (
    <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <PaperCard className="px-[16px] py-[16px] md:px-[24px] md:py-[22px]">
        <p className="font-barlow text-[12px] font-bold uppercase tracking-[1px] text-[#0F171F]">El club de los 20 · Por década</p>
        <div role="radiogroup" aria-label="Umbral de puntos por juego" className="mt-[12px] flex flex-wrap gap-[8px]">
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
              className={`${TAB_PILL} !px-[13px] !py-[5px] !text-[13px]`}
            >
              {t}+ PPJ
            </button>
          ))}
        </div>
        <ol className="mt-[18px] flex flex-col gap-[10px]">
          {data.byDecade.map((d) => {
            const n = d.counts[threshold] ?? 0;
            return (
              <li key={d.decade} className="grid grid-cols-[52px_1fr_40px] items-center gap-x-[10px]">
                <span className={`font-barlow text-[13px] font-medium text-[rgba(0,0,0,0.6)] ${cls.tabular}`}>{d.decade}s</span>
                <span className="h-[14px] rounded-[3px] bg-[#0F171F]" style={{ width: `${Math.max(n ? 1.5 : 0, (n / max) * 100)}%` }} />
                <span className={`text-right text-[17px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{n}</span>
              </li>
            );
          })}
        </ol>
        <p className={`mt-[16px] ${cls.note} !text-[12px] !text-[rgba(0,0,0,0.45)]`}>
          Temporadas con {threshold}+ PPJ, mínimo {data.minGames} juegos. {list.length} en total.
        </p>
      </PaperCard>

      <PaperCard className="overflow-hidden">
        <div className="grid grid-cols-[1fr_56px_44px] gap-x-[10px] bg-[#F7F7F7] px-[16px] py-[10px] md:grid-cols-[28px_1fr_130px_56px_44px] md:px-[24px]">
          <span className={`hidden md:block ${cls.label}`}>#</span>
          <span className={cls.label}>Jugador · año</span>
          <span className={`hidden md:block ${cls.label}`}>Equipo</span>
          <span className={`text-right ${cls.label}`}>PPJ</span>
          <span className={`text-right ${cls.label}`}>J</span>
        </div>
        <ol>
          {list.slice(0, visible).map((s, i) => {
            const f = s.franchiseSlug ? franchises[s.franchiseSlug] : null;
            return (
              <li key={`${s.playerId}-${s.year}`} className="grid min-h-[46px] grid-cols-[1fr_56px_44px] items-center gap-x-[10px] border-t border-[rgba(0,0,0,0.05)] px-[16px] py-[5px] md:grid-cols-[28px_1fr_130px_56px_44px] md:px-[24px]">
                <span className="hidden font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)] md:block">{i + 1}</span>
                <span className="flex min-w-0 items-baseline gap-[8px]">
                  <Link href={h.player(s.slug)} className={`min-w-0 truncate font-barlow text-[14px] font-semibold text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                    {s.name}
                  </Link>
                  <Link href={h.season(s.year)} className={`shrink-0 font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)] hover:text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
                    {s.year}
                  </Link>
                </span>
                <span className="hidden min-w-0 items-center gap-[6px] md:flex">
                  <FranchiseLogo franchise={f} fallbackName={s.franchiseSlug ?? ''} sizePx={18} />
                  {f ? (
                    <Link href={h.franchise(f)} className={`truncate font-barlow text-[13px] text-[rgba(0,0,0,0.65)] hover:text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                      {f.nickname}
                    </Link>
                  ) : null}
                </span>
                <span className={`text-right text-[17px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmt(s.ppg)}</span>
                <span className={`text-right font-barlow text-[13px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>{s.g}</span>
              </li>
            );
          })}
        </ol>
        {visible < list.length ? (
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className={`w-full border-t border-[rgba(0,0,0,0.05)] py-[13px] text-center font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)] transition-colors duration-150 hover:text-[#0F171F] ${cls.focus} focus-visible:outline-offset-[-2px]`}>
            Ver más ({list.length - visible} restantes)
          </button>
        ) : null}
      </PaperCard>
    </div>
  );
}
