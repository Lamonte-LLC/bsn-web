import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getCoaches, getLongevity, getLoyalty, getMultiMvps, getMvpChampionOverlap, getRecordsByDecade, getScoringClub } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';

export const metadata: Metadata = { title: 'El BSN en números · Archivo BSN', description: 'Siete historias del BSN contadas con data: dirigentes, MVPs, longevidad, lealtad y récords.' };

export default function EnNumerosPage() {
  const coaches = getCoaches();
  const overlap = getMvpChampionOverlap();
  const multi = getMultiMvps();
  const longevity = getLongevity();
  const loyalty = getLoyalty();
  const club = getScoringClub();
  const decades = getRecordsByDecade();
  const seasons30 = club.byThreshold['30']?.length ?? 0;

  const views = [
    { href: '/archivo/en-numeros/dirigentes', title: 'Los dirigentes que ganaron', number: coaches[0]?.titles ?? 0, label: `títulos de ${coaches[0]?.name ?? ''}` },
    { href: '/archivo/en-numeros/mvp-y-campeon', title: '¿El MVP levanta el trofeo?', number: `${overlap.overlapPct}%`, label: `${overlap.overlapYears} de ${overlap.totalYears} veces` },
    { href: '/archivo/en-numeros/multi-mvp', title: 'Los que repitieron', number: multi.filter((m) => m.count === 4).length, label: 'jugadores con cuatro MVPs' },
    { href: '/archivo/en-numeros/longevidad', title: 'Los que duraron', number: longevity.bySeasons[0]?.seasons ?? 0, label: `temporadas de ${longevity.bySeasons[0]?.name ?? ''}` },
    { href: '/archivo/en-numeros/lealtad', title: 'Un solo uniforme', number: loyalty.oneClub.length, label: 'jugadores de un solo club' },
    { href: '/archivo/en-numeros/club-de-los-20', title: 'El club de los 20', number: fmtInt(seasons30), label: 'temporadas de 30 o más puntos' },
    { href: '/archivo/en-numeros/records-por-decada', title: 'Lo mejor de cada década', number: decades.decades.length, label: 'décadas con récords' },
    { href: '/archivo/en-numeros/dinastias', title: 'Dinastías', number: 95, label: 'títulos, año por año' },
  ];

  return (
    <ArchivoShell
      hero={
        <div className="max-w-[720px]">
          <HeroEyebrow>Historias con data</HeroEyebrow>
          <HeroTitle>El BSN en números</HeroTitle>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {views.map((v) => (
          <Link key={v.href} href={v.href} className="flex min-h-[170px] flex-col justify-between rounded-[12px] border border-[#EAEAEA] bg-white p-[18px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F171F]">
            <span className="text-[20px] leading-[1.1] text-[rgba(15,23,31,0.9)]">{v.title}</span>
            <span>
              <span className="block text-[44px] leading-[1] text-black [font-variant-numeric:tabular-nums]">{v.number}</span>
              <span className="mt-[4px] block font-barlow text-[13px] text-[rgba(15,23,31,0.6)]">{v.label}</span>
            </span>
          </Link>
        ))}
      </div>
    </ArchivoShell>
  );
}
