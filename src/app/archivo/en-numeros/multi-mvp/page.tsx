import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import { Badge } from '@/archivo/components/ui';
import { getFranchiseMap, getMultiMvps, getMvps } from '@/archivo/lib/data';

export const metadata: Metadata = { title: 'Los que repitieron · Archivo BSN', description: 'Los jugadores que ganaron el MVP del BSN más de una vez.' };

export default function MultiMvpPage() {
  const players = getMultiMvps();
  const franchises = getFranchiseMap();
  const years = getMvps().map((m) => m.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const span = maxYear - minYear;
  const ticks = [];
  for (let y = Math.ceil(minYear / 10) * 10; y <= maxYear; y += 10) ticks.push(y);
  const four = players.filter((p) => p.count === 4);

  return (
    <InsightPage title="Los que repitieron" context={`${four.length === 3 ? 'Tres' : four.length} jugadores ganaron cuatro veces. Ninguno en la misma década.`} heroNumber={players.length} heroNumberLabel="jugadores con dos o más MVPs">
      {/* Desktop: horizontal timeline */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[260px_1fr] gap-x-4">
          <span />
          <div className="relative h-[20px] border-b border-[rgba(0,0,0,0.12)]">
            {ticks.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 font-barlow text-[12px] text-[rgba(15,23,31,0.5)]" style={{ left: `${((t - minYear) / span) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <ol>
          {players.map((p) => (
            <li key={p.playerId ?? p.name} className="grid min-h-[48px] grid-cols-[260px_1fr] items-center gap-x-4 border-b border-[rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-[8px]">
                {p.slug ? (
                  <Link href={`/archivo/jugadores/${p.slug}`} className="truncate text-[16px] text-[rgba(15,23,31,0.9)] hover:underline">
                    {p.name}
                  </Link>
                ) : (
                  <span className="truncate text-[16px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
                )}
                <span className="shrink-0 text-[16px] text-black">{p.count}</span>
                {p.wonWithMultipleTeams ? <Badge tone="ink" className="shrink-0">2 equipos</Badge> : null}
              </div>
              <div className="relative h-[28px]">
                <span className="absolute inset-y-1/2 left-0 right-0 border-t border-dashed border-[rgba(0,0,0,0.08)]" />
                {p.mvps.map((m) => {
                  const f = m.franchiseSlug ? franchises.get(m.franchiseSlug) ?? null : null;
                  return (
                    <Link
                      key={m.year}
                      href={`/archivo/temporadas/${m.year}`}
                      title={`${m.year} · ${f?.fullName ?? ''}`}
                      className="absolute top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-transform duration-150 hover:scale-125"
                      style={{ left: `${((m.year - minYear) / span) * 100}%`, background: f?.colors.primary ?? '#0F171F' }}
                    >
                      <span className="sr-only">{m.year}</span>
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile: vertical list */}
      <ol className="flex flex-col gap-2 md:hidden">
        {players.map((p) => (
          <li key={p.playerId ?? p.name} className="rounded-[12px] border border-[#EAEAEA] bg-white p-[14px]">
            <div className="flex items-center justify-between gap-2">
              {p.slug ? (
                <Link href={`/archivo/jugadores/${p.slug}`} className="min-w-0 truncate text-[17px] text-[rgba(15,23,31,0.9)]">
                  {p.name}
                </Link>
              ) : (
                <span className="min-w-0 truncate text-[17px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
              )}
              <span className="text-[24px] text-black">{p.count}</span>
            </div>
            <div className="mt-[8px] flex flex-wrap gap-[6px]">
              {p.mvps.map((m) => {
                const f = m.franchiseSlug ? franchises.get(m.franchiseSlug) ?? null : null;
                return (
                  <Link key={m.year} href={`/archivo/temporadas/${m.year}`} className="inline-flex h-[32px] items-center gap-[6px] rounded-[6px] border border-[#EAEAEA] px-[8px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.85)]">
                    <FranchiseLogo franchise={f} fallbackName={m.franchiseSlug ?? ''} sizePx={16} />
                    {m.year}
                  </Link>
                );
              })}
              {p.wonWithMultipleTeams ? <Badge tone="ink">2 equipos</Badge> : null}
            </div>
          </li>
        ))}
      </ol>
    </InsightPage>
  );
}
