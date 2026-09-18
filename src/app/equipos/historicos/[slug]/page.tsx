import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchiseMap } from '@/archivo/lib/data';
import ExtinctFranchiseDossier from '@/historia/components/ExtinctFranchiseDossier';
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

/** Page of an extinct franchise as a dossier (design option 3B): identity column plus one card per module. */
export default async function FranquiciaHistoricaPage({ params }: Params) {
  const { slug } = await params;
  const f = getFranchiseMap().get(slug);
  if (!f || f.status !== 'extinct') notFound();
  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[28px] pt-[24px] lg:pb-[32px] lg:pt-[28px]">
          <HeroEyebrow>
            Franquicia extinta{f.firstYear && f.lastYear ? ` · ${f.firstYear} a ${f.lastYear}` : ''}
          </HeroEyebrow>
          <HeroTitle>{f.fullName}</HeroTitle>
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <ExtinctFranchiseDossier slug={f.slug} />
      </div>
    </FullWidthLayout>
  );
}
