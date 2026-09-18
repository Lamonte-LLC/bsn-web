import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchiseMap } from '@/archivo/lib/data';
import FranchiseContextRibbon from '@/historia/components/FranchiseContextRibbon';
import FranchiseHistory from '@/historia/components/FranchiseHistory';
import { extinctFranchises } from '@/historia/lib/data';

export const dynamic = 'force-static';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return extinctFranchises().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = getFranchiseMap().get((await params).slug);
  if (!f) return { title: 'Franquicia histórica · BSN' };
  return { title: `${f.fullName} · Franquicia histórica · BSN`, description: `${f.fullName}${f.firstYear && f.lastYear ? `, ${f.firstYear} a ${f.lastYear}` : ''}: títulos, MVPs, líderes históricos y todos sus jugadores en el BSN.` };
}

/** Page of an extinct franchise: same structure as the Historia tab of an active team, with its own header. */
export default async function FranquiciaHistoricaPage({ params }: Params) {
  const { slug } = await params;
  const f = getFranchiseMap().get(slug);
  if (!f || f.status !== 'extinct') notFound();
  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[80px] pt-[24px] lg:pb-[112px] lg:pt-[28px]">
          <div className="flex flex-col gap-[18px] md:flex-row md:items-center md:gap-[28px]">
            <FranchiseLogo franchise={f} sizePx={96} className="md:!h-[120px] md:!w-[120px]" />
            <div className="min-w-0">
              <HeroEyebrow>
                Franquicia extinta{f.firstYear && f.lastYear ? ` · ${f.firstYear} a ${f.lastYear}` : ''}
                {f.city ? ` · ${f.city}` : ''}
              </HeroEyebrow>
              <HeroTitle>{f.fullName}</HeroTitle>
              <FranchiseContextRibbon slug={f.slug} season={f.lastYear ?? undefined} onDark className="mt-[10px]" />
              {f.logo === null ? <p className="mt-[8px] font-barlow text-[12.5px] text-white/45">Logo original pendiente de la liga{f.colorSource === 'prototype' ? '; color provisional' : ''}.</p> : null}
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-[#FDFDFD] pb-[24px] lg:pb-[32px]">
        <FranchiseHistory slug={f.slug} band={false} />
      </div>
    </FullWidthLayout>
  );
}
