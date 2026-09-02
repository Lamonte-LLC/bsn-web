import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { CardLink, HeroEyebrow, HeroTitle, SectionTitle, YearChip } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap, getMvps, getSeasonYears } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

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
          <HeroEyebrow>
            {years[0]} a {years[years.length - 1]}
          </HeroEyebrow>
          <HeroTitle>Temporadas</HeroTitle>
        </div>
      }
    >
      <nav aria-label="Décadas" className="no-scrollbar -mx-4 mb-[28px] overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex min-w-max gap-[6px] md:flex-wrap">
          {decades.map((d) => (
            <YearChip key={d} href={`#d${d}`}>
              {d}s
            </YearChip>
          ))}
        </div>
      </nav>
      {decades.map((d) => (
        <section key={d} id={`d${d}`} className="mb-[32px] scroll-mt-6 lg:mb-[40px]">
          <SectionTitle>Década de {d}</SectionTitle>
          <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:gap-[16px] lg:grid-cols-5">
            {years
              .filter((y) => Math.floor(y / 10) * 10 === d)
              .sort((a, b) => b - a)
              .map((y) => {
                const c = championByYear.get(y);
                const m = mvpByYear.get(y);
                const f = c?.franchiseSlug ? franchises.get(c.franchiseSlug) ?? null : null;
                return (
                  <CardLink key={y} href={`/archivo/temporadas/${y}`} className="px-[16px] pb-[14px] pt-[16px]">
                    <span className="flex items-start justify-between gap-[8px]">
                      <span className={`text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{y}</span>
                      {c ? <FranchiseLogo franchise={f} fallbackName={c.fullName} sizePx={40} /> : null}
                    </span>
                    <span className={`mt-[12px] block ${cls.label} !text-[9.5px]`}>{c ? 'Campeón' : 'Sin campeón registrado'}</span>
                    <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{c?.fullName ?? '–'}</span>
                    {m ? (
                      <>
                        <span className={`mt-[8px] block ${cls.label} !text-[9.5px]`}>MVP</span>
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{m.name}</span>
                      </>
                    ) : null}
                  </CardLink>
                );
              })}
          </div>
        </section>
      ))}
    </ArchivoShell>
  );
}
