import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import { Badge, PaperCard } from '@/archivo/components/ui';
import { getFranchiseMap, getMultiMvps, getMvps } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

export const metadata: Metadata = { title: 'Los que repitieron · Archivo BSN', description: 'Los jugadores que ganaron el MVP del BSN más de una vez.' };

export default function MultiMvpPage() {
  const players = getMultiMvps();
  const franchises = getFranchiseMap();
  const years = getMvps().map((m) => m.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const span = maxYear - minYear;
  const ticks: number[] = [];
  for (let y = Math.ceil(minYear / 10) * 10; y <= maxYear; y += 10) ticks.push(y);
  const four = players.filter((p) => p.count === 4);
  const pos = (y: number) => `${((y - minYear) / span) * 100}%`;
  const multiTeam = players.filter((p) => p.wonWithMultipleTeams).map((p) => p.name);

  return (
    <InsightPage
      title="Los que repitieron"
      context={`${four.length === 3 ? 'Tres' : four.length} jugadores ganaron cuatro veces. Ninguno en la misma década.`}
      heroNumber={four.length}
      heroNumberLabel="jugadores con cuatro MVPs"
      source={`Puntos coloreados por la franquicia con la que ganó cada MVP. Desde ${minYear}.${multiTeam.length ? ` ${multiTeam.join(' y ')} ganaron con dos equipos distintos.` : ''}`}
    >
      {/* Desktop: horizontal timeline */}
      <PaperCard className="hidden px-[26px] pb-[16px] pt-[18px] md:block">
        <div className="grid grid-cols-[270px_1fr] gap-x-[16px]">
          <span />
          <div className="relative h-[18px]">
            {ticks.map((t) => (
              <span key={t} className={`absolute -translate-x-1/2 font-barlow text-[10.5px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`} style={{ left: pos(t) }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <ol>
          {players.map((p) => (
            <li key={p.playerId ?? p.name} className="grid h-[47px] grid-cols-[270px_1fr] items-center gap-x-[16px] border-b border-[rgba(0,0,0,0.05)] last:border-b-0">
              <div className="flex min-w-0 items-center gap-[8px]">
                {p.slug ? (
                  <Link href={`/archivo/jugadores/${p.slug}`} className={`truncate font-barlow text-[14px] font-semibold text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                    {p.name}
                  </Link>
                ) : (
                  <span className="truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{p.name}</span>
                )}
                <span className={`shrink-0 text-[17px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{p.count}</span>
                {p.wonWithMultipleTeams ? (
                  <Badge tone="ink" className="shrink-0 !px-[8px] !py-[1px] !text-[10.5px]">
                    2 equipos
                  </Badge>
                ) : null}
              </div>
              <div className="relative h-[24px]">
                <span aria-hidden className="absolute inset-x-0 top-1/2 border-t border-[rgba(0,0,0,0.08)]" />
                {ticks.map((t) => (
                  <span key={t} aria-hidden className="absolute top-[6px] h-[12px] w-px bg-[rgba(0,0,0,0.08)]" style={{ left: pos(t) }} />
                ))}
                {p.mvps.map((m) => {
                  const f = m.franchiseSlug ? franchises.get(m.franchiseSlug) ?? null : null;
                  return (
                    <Link
                      key={m.year}
                      href={`/archivo/temporadas/${m.year}`}
                      title={`${m.year} · ${f?.fullName ?? ''}`}
                      className={`absolute top-1/2 flex h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${cls.focus}`}
                      style={{ left: pos(m.year) }}
                    >
                      <span aria-hidden className="block h-[10px] w-[10px] rounded-full" style={{ background: f?.colors.primary ?? '#0F171F' }} />
                      <span className="sr-only">{m.year}</span>
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </PaperCard>

      {/* Mobile: cards with the years as chips */}
      <ol className="flex flex-col gap-[10px] md:hidden">
        {players.map((p) => (
          <PaperCard key={p.playerId ?? p.name} className="px-[16px] py-[14px]">
            <li>
              <div className="flex items-center justify-between gap-[10px]">
                {p.slug ? (
                  <Link href={`/archivo/jugadores/${p.slug}`} className={`min-w-0 truncate font-barlow text-[15px] font-semibold text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                    {p.name}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate font-barlow text-[15px] font-semibold text-[#0F171F]">{p.name}</span>
                )}
                <span className={`text-[24px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{p.count}</span>
              </div>
              <div className="mt-[10px] flex flex-wrap items-center gap-[6px]">
                {p.mvps.map((m) => {
                  const f = m.franchiseSlug ? franchises.get(m.franchiseSlug) ?? null : null;
                  return (
                    <Link key={m.year} href={`/archivo/temporadas/${m.year}`} className={`inline-flex h-[30px] items-center gap-[6px] rounded-[7px] border border-[rgba(0,0,0,0.1)] pl-[4px] pr-[9px] font-barlow text-[13px] font-medium text-[rgba(0,0,0,0.7)] ${cls.tabular} ${cls.focus}`}>
                      <FranchiseLogo franchise={f} fallbackName={m.franchiseSlug ?? ''} sizePx={18} />
                      {m.year}
                    </Link>
                  );
                })}
                {p.wonWithMultipleTeams ? <Badge tone="ink">2 equipos</Badge> : null}
              </div>
            </li>
          </PaperCard>
        ))}
      </ol>
    </InsightPage>
  );
}
