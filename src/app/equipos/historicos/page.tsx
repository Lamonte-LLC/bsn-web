import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { CardLink, HeroEyebrow, HeroTitle, Note, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseFile } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';
import { PRE_FRANCHISE_NOTE } from '@/historia/lib/copy';
import { extinctFranchises, preFranchiseChampions } from '@/historia/lib/data';

export const metadata: Metadata = { title: 'Franquicias históricas · Equipos · BSN', description: 'Las 16 franquicias que ya no compiten en el BSN y los clubes campeones anteriores al sistema de franquicias.' };

/** The 16 extinct franchises, each with its own page, plus the pre-1946 champion clubs without a modern franchise. */
export default function EquiposHistoricosPage() {
  const extinct = extinctFranchises();
  const titles = new Map<string, number>();
  for (const c of getChampions()) if (c.franchiseSlug) titles.set(c.franchiseSlug, (titles.get(c.franchiseSlug) ?? 0) + 1);
  const sorted = [...extinct].sort((a, b) => (titles.get(b.slug) ?? 0) - (titles.get(a.slug) ?? 0) || (a.firstYear ?? 0) - (b.firstYear ?? 0));
  const preFranchise = preFranchiseChampions();

  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[28px] pt-[24px] lg:pb-[32px] lg:pt-[28px]">
          <HeroEyebrow>Equipos</HeroEyebrow>
          <HeroTitle>Franquicias históricas</HeroTitle>
          <p className="mt-[12px] max-w-[62ch] font-barlow text-[15px] leading-[1.5] text-white/75">
            {extinct.length} franquicias que ya no compiten, con sus títulos, sus MVPs y todos los que vistieron la camiseta.
          </p>
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          <section className="mb-[36px] lg:mb-[44px]">
            <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:grid-cols-4">
              {sorted.map((f) => {
                const n = titles.get(f.slug) ?? 0;
                const players = getFranchiseFile(f.slug)?.players.length ?? 0;
                return (
                  <CardLink key={f.slug} href={`/equipos/historicos/${f.slug}`} className="flex items-center gap-[14px] px-[16px] py-[14px]">
                    <FranchiseLogo franchise={f} sizePx={48} />
                    <span className="min-w-0">
                      <span className="block truncate font-barlow text-[15px] font-semibold text-[#0F171F]">{f.fullName}</span>
                      <span className={`block truncate ${cls.meta} !text-[12px] ${cls.tabular}`}>
                        {f.firstYear && f.lastYear ? `${f.firstYear} a ${f.lastYear}` : 'Años por confirmar'}
                        {n ? ` · ${n} título${n === 1 ? '' : 's'}` : ''}
                      </span>
                      <span className={`block ${cls.meta} !text-[12px] ${cls.tabular}`}>{players ? `${players} jugadores` : f.city ?? 'Ciudad por confirmar'}</span>
                    </span>
                  </CardLink>
                );
              })}
            </div>
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
