import ArchivoShell from '@/archivo/components/ArchivoShell';
import { CardLink, HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getChampions, getCoaches, getLongevity, getLoyalty, getMultiMvps, getMvpChampionOverlap, getRecordsByDecade, getScoringClub } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
import { hrefs } from '@/archivo/lib/hrefs';
import { cls } from '@/archivo/lib/tokens';

/** Hub of "El BSN en números": one card per story with its hero number. */
export default function EnNumerosContent({ site = false }: { site?: boolean }) {
  const h = hrefs(site);
  const coaches = getCoaches();
  const overlap = getMvpChampionOverlap();
  const multi = getMultiMvps();
  const longevity = getLongevity();
  const loyalty = getLoyalty();
  const club = getScoringClub();
  const decades = getRecordsByDecade();
  const seasons30 = club.byThreshold['30']?.length ?? 0;
  const titles = getChampions().length;

  const views = [
    { href: h.enNumeros('dirigentes'), title: 'Los dirigentes que ganaron', number: coaches[0]?.titles ?? 0, label: `títulos de ${coaches[0]?.name ?? ''}` },
    { href: h.enNumeros('mvp-y-campeon'), title: '¿El MVP levanta el trofeo?', number: `${overlap.overlapPct}%`, label: `${overlap.overlapYears} de ${overlap.totalYears} veces` },
    { href: h.enNumeros('multi-mvp'), title: 'Los que repitieron', number: multi.filter((m) => m.count === 4).length, label: 'jugadores con cuatro MVPs' },
    { href: h.enNumeros('longevidad'), title: 'Los que duraron', number: longevity.bySeasons[0]?.seasons ?? 0, label: `temporadas de ${longevity.bySeasons[0]?.name ?? ''}` },
    { href: h.enNumeros('lealtad'), title: 'Un solo uniforme', number: loyalty.oneClub.length, label: 'jugadores de un solo club' },
    { href: h.enNumeros('club-de-los-20'), title: 'El club de los 20', number: fmtInt(seasons30), label: 'temporadas de 30 o más puntos' },
    { href: h.enNumeros('records-por-decada'), title: 'Lo mejor de cada década', number: decades.decades.length, label: 'décadas con récords' },
    { href: h.enNumeros('dinastias'), title: 'Dinastías', number: titles, label: 'títulos, año por año' },
  ];

  return (
    <ArchivoShell
      site={site ? { title: 'El BSN en números', meta: 'Ocho historias contadas con data', nav: 'en-numeros' } : undefined}
      hero={
        <div className="max-w-[720px]">
          <HeroEyebrow>Historias con data</HeroEyebrow>
          <HeroTitle>El BSN en números</HeroTitle>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-[12px] md:gap-[16px] lg:grid-cols-4">
        {views.map((v) => (
          <CardLink key={v.href} href={v.href} className="flex flex-col justify-between gap-[18px] p-[18px] md:gap-[26px] md:px-[24px] md:pb-[24px] md:pt-[22px]">
            <span className="block font-barlow text-[13.5px] font-bold leading-[1.35] text-[#0F171F] md:text-[15px] md:leading-[1.3]">{v.title}</span>
            <span>
              <span className={`block text-[34px] leading-[1] text-[#0F171F] md:text-[44px] ${cls.tabular}`}>{v.number}</span>
              <span className="mt-[5px] block font-barlow text-[12px] text-[rgba(0,0,0,0.5)] md:mt-[6px] md:text-[13px]">{v.label}</span>
            </span>
          </CardLink>
        ))}
      </div>
    </ArchivoShell>
  );
}
