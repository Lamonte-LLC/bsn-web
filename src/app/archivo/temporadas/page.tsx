import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { HeroEyebrow, HeroTitle, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap, getMvps, getSeasonYears } from '@/archivo/lib/data';

export const metadata: Metadata = { title: 'Temporadas · Archivo BSN', description: 'Todas las temporadas del BSN desde 1930, con campeón y MVP de cada año.' };

export default function TemporadasPage() {
  const years = getSeasonYears();
  const franchises = getFranchiseMap();
  const championByYear = new Map(getChampions().map((c) => [c.year, c]));
  const mvpByYear = new Map(getMvps().map((m) => [m.year, m]));
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => b - a);

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>{years[0]} a {years[years.length - 1]}</HeroEyebrow>
          <HeroTitle>Temporadas</HeroTitle>
        </div>
      }
    >
      <nav aria-label="Décadas" className="no-scrollbar -mx-4 mb-8 overflow-x-auto px-4">
        <div className="flex min-w-max gap-[6px]">
          {decades.map((d) => (
            <a key={d} href={`#d${d}`} className="rounded-[100px] border border-[#D5D5D5] bg-white px-[14px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]">
              {d}s
            </a>
          ))}
        </div>
      </nav>
      {decades.map((d) => (
        <section key={d} id={`d${d}`} className="mb-10 scroll-mt-6">
          <SectionTitle>Década de {d}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {years
              .filter((y) => Math.floor(y / 10) * 10 === d)
              .sort((a, b) => b - a)
              .map((y) => {
                const c = championByYear.get(y);
                const m = mvpByYear.get(y);
                const f = c?.franchiseSlug ? franchises.get(c.franchiseSlug) ?? null : null;
                return (
                  <Link key={y} href={`/archivo/temporadas/${y}`} className="rounded-[12px] border border-[#EAEAEA] bg-white p-[14px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[30px] leading-[1] text-black">{y}</span>
                      {c ? <FranchiseLogo franchise={f} fallbackName={c.fullName} size="avatar" /> : null}
                    </div>
                    <p className="mt-[10px] truncate font-barlow text-[12px] font-semibold uppercase tracking-[0.5px] text-[rgba(15,23,31,0.55)]">{c ? 'Campeón' : 'Sin campeón registrado'}</p>
                    <p className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{c?.fullName ?? '–'}</p>
                    {m ? (
                      <>
                        <p className="mt-[6px] truncate font-barlow text-[12px] font-semibold uppercase tracking-[0.5px] text-[rgba(15,23,31,0.55)]">MVP</p>
                        <p className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{m.name}</p>
                      </>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </ArchivoShell>
  );
}
