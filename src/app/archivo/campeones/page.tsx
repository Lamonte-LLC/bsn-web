import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { Chip, HeroEyebrow, HeroTitle, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

export const metadata: Metadata = { title: 'Campeones · Archivo BSN', description: 'Todos los campeones del BSN desde 1930, con dirigente y serie final.' };

export default function CampeonesPage() {
  const champions = getChampions();
  const franchises = getFranchiseMap();
  const counts = new Map<string, number>();
  for (const c of champions) if (c.franchiseSlug) counts.set(c.franchiseSlug, (counts.get(c.franchiseSlug) ?? 0) + 1);
  const summary = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const decades = [...new Set(champions.map((c) => Math.floor(c.year / 10) * 10))].sort((a, b) => b - a);

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>{champions.length} títulos desde {champions[champions.length - 1]?.year}</HeroEyebrow>
          <HeroTitle>Campeones</HeroTitle>
        </div>
      }
    >
      <section className="mb-[36px] lg:mb-[44px]">
        <SectionTitle>Títulos por franquicia</SectionTitle>
        <div className="flex flex-wrap gap-[8px]">
          {summary.map(([slug, n]) => {
            const f = franchises.get(slug)!;
            return (
              <Chip key={slug} href={`/archivo/franquicias/${slug}`}>
                <FranchiseLogo franchise={f} sizePx={20} />
                {f.nickname}
                <span className={`ml-[2px] text-[15px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{n}</span>
              </Chip>
            );
          })}
        </div>
      </section>

      {decades.map((d) => {
        const list = champions.filter((c) => Math.floor(c.year / 10) * 10 === d);
        return (
          <section key={d} className="mb-[28px] lg:mb-[36px]">
            <SectionTitle>Década de {d}</SectionTitle>
            <PaperCard className="overflow-hidden">
              <div className="hidden grid-cols-[72px_44px_1fr_220px_90px] gap-x-[12px] border-b border-[rgba(0,0,0,0.12)] px-[20px] pb-[9px] pt-[12px] md:grid">
                <span className={cls.label}>Año</span>
                <span />
                <span className={cls.label}>Campeón</span>
                <span className={cls.label}>Dirigente</span>
                <span className={`text-right ${cls.label}`}>Serie final</span>
              </div>
              <ol>
                {list.map((c, i) => {
                  const f = c.franchiseSlug ? franchises.get(c.franchiseSlug) ?? null : null;
                  const prevSame = i > 0 && list[i - 1].franchiseSlug === c.franchiseSlug && c.franchiseSlug;
                  return (
                    <li key={c.year} className={`grid min-h-[56px] grid-cols-[56px_1fr] items-center gap-x-[10px] px-[14px] py-[8px] md:grid-cols-[72px_44px_1fr_220px_90px] md:gap-x-[12px] md:px-[20px] ${i ? 'border-t border-[rgba(0,0,0,0.06)]' : ''}`}>
                      <Link href={`/archivo/temporadas/${c.year}`} className={`text-[22px] leading-[1] text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
                        {c.year}
                      </Link>
                      <span className="hidden md:block">
                        <FranchiseLogo franchise={f} fallbackName={c.fullName} sizePx={36} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-[8px]">
                          <span className="md:hidden">
                            <FranchiseLogo franchise={f} fallbackName={c.fullName} sizePx={20} />
                          </span>
                          {f ? (
                            <Link href={`/archivo/franquicias/${f.slug}`} className={`truncate font-barlow text-[14.5px] font-semibold text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                              {c.fullName}
                            </Link>
                          ) : (
                            <span className="truncate font-barlow text-[14.5px] font-semibold text-[#0F171F]">{c.fullName}</span>
                          )}
                          {prevSame ? <span className={`hidden shrink-0 ${cls.label} !text-[9.5px] md:inline`}>Repite</span> : null}
                        </span>
                        <span className={`block truncate ${cls.meta} !text-[12px] md:hidden`}>
                          {c.coach ?? ''}
                          {c.series ? `${c.coach ? ' · ' : ''}Final ${c.series}` : ''}
                        </span>
                      </span>
                      <span className="hidden truncate font-barlow text-[13.5px] text-[rgba(0,0,0,0.65)] md:block">{c.coach ?? '–'}</span>
                      <span className={`hidden text-right font-barlow text-[13.5px] text-[rgba(0,0,0,0.65)] md:block ${cls.tabular}`}>{c.series ?? '–'}</span>
                    </li>
                  );
                })}
              </ol>
            </PaperCard>
          </section>
        );
      })}
    </ArchivoShell>
  );
}
