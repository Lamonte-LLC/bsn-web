import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { HeroEyebrow, HeroTitle, Note, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchises } from '@/archivo/lib/data';
import { toFranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import FranchisesGrid, { type FranchiseCard } from '@/historia/components/FranchisesGrid';
import { PRE_FRANCHISE_NOTE } from '@/historia/lib/copy';
import { CURRENT_SEASON, preFranchiseChampions } from '@/historia/lib/data';

export const metadata: Metadata = { title: 'Franquicias · Equipos · BSN', description: 'Las 28 franquicias del BSN, las que siguen y las que ya no compiten, con sus títulos, sus MVPs y todos los que vistieron la camiseta.' };

/** Every franchise of the league (active and extinct) as one grid, plus the pre-1946 champion clubs without a modern franchise. */
export default function FranquiciasPage() {
  const all = getFranchises();
  const titles = new Map<string, number>();
  for (const c of getChampions()) if (c.franchiseSlug) titles.set(c.franchiseSlug, (titles.get(c.franchiseSlug) ?? 0) + 1);
  const cards: FranchiseCard[] = all
    .map((f) => ({ ...toFranchiseView(f), city: f.city, firstYear: f.firstYear, lastYear: f.lastYear, titles: titles.get(f.slug) ?? 0 }))
    .sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active') || b.titles - a.titles || (a.firstYear ?? 0) - (b.firstYear ?? 0));
  const active = cards.filter((c) => c.status === 'active').length;
  const firstYear = Math.min(...all.map((f) => f.firstYear ?? 9999));
  const years = CURRENT_SEASON - firstYear + 1;
  const preFranchise = preFranchiseChampions();
  const counters: Array<[number, string]> = [
    [cards.length, 'Franquicias'],
    [active, 'Activas'],
    [cards.length - active, 'Extintas'],
  ];

  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[28px] pt-[24px] lg:pb-[32px] lg:pt-[28px]">
          <HeroEyebrow>Equipos</HeroEyebrow>
          <HeroTitle>Franquicias</HeroTitle>
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          <section className={`${cls.card} mb-[20px] flex flex-col gap-[20px] px-[22px] py-[22px] md:mb-[28px] md:flex-row md:items-center md:justify-between md:px-[36px] md:py-[30px]`}>
            <div>
              <h2 className="text-[26px] leading-[1] text-[#0F171F] md:text-[32px]">{years} años de clubes</h2>
              <p className="mt-[8px] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">Los que siguen y los que ya no están</p>
            </div>
            <dl className="flex gap-[28px] md:gap-[44px]">
              {counters.map(([v, l]) => (
                <div key={l} className="flex flex-col-reverse text-center">
                  <dt className={`mt-[6px] ${cls.label}`}>{l}</dt>
                  <dd className={`text-[36px] leading-[1] text-[#0F171F] md:text-[44px] ${cls.tabular}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="mb-[36px] lg:mb-[44px]">
            <FranchisesGrid franchises={cards} />
          </section>

          {preFranchise.length ? (
            <section>
              <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{preFranchise.length} títulos</span>}>Campeones sin franquicia moderna</SectionTitle>
              <PaperCard className="overflow-hidden">
                <ol>
                  {preFranchise.map((c, i) => (
                    <li key={c.year} className={`grid min-h-[52px] grid-cols-[64px_1fr] items-center gap-x-[10px] px-[14px] py-[8px] md:grid-cols-[80px_1fr_220px] md:px-[20px] ${i ? 'border-t border-[rgba(0,0,0,0.06)]' : ''}`}>
                      <a href={`/temporadas/${c.year}`} className={`text-[22px] leading-[1] text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
                        {c.year}
                      </a>
                      <span className="min-w-0">
                        <span className="block truncate font-barlow text-[14.5px] font-semibold text-[#0F171F]">{c.fullName}</span>
                        <span className={`block ${cls.meta} !text-[12px] md:hidden`}>{c.coach ?? ''}</span>
                      </span>
                      <span className="hidden truncate font-barlow text-[13.5px] text-[rgba(0,0,0,0.65)] md:block">{c.coach ?? '–'}</span>
                    </li>
                  ))}
                </ol>
              </PaperCard>
              <Note className="mt-[10px]">{PRE_FRANCHISE_NOTE}</Note>
            </section>
          ) : null}
        </div>
      </div>
    </FullWidthLayout>
  );
}
