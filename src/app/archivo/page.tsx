import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { CardLink, HeroEyebrow, HeroTitle, Label, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap, getMvps, getPlayerIndex } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

export const metadata: Metadata = {
  title: 'Archivo BSN · Historia del Baloncesto Superior Nacional',
  description: 'Campeones desde 1930, MVPs desde 1951 y las estadísticas de más de 3,000 jugadores del BSN.',
};

const SECTIONS = [
  { href: '/archivo/temporadas', title: 'Temporadas', text: 'De 1930 a hoy, año por año.' },
  { href: '/archivo/campeones', title: 'Campeones', text: '95 títulos, dinastías y dirigentes.' },
  { href: '/archivo/jugadores', title: 'Jugadores', text: 'Más de 3,000 carreras completas.' },
  { href: '/archivo/mvps', title: 'Salón de MVPs', text: 'Los mejores de cada año desde 1951.' },
  { href: '/archivo/records', title: 'Récords', text: 'Las marcas de temporada y de carrera.' },
  { href: '/archivo/franquicias', title: 'Franquicias', text: '28 franquicias, activas y extintas.' },
  { href: '/archivo/en-numeros', title: 'El BSN en números', text: 'Ocho historias contadas con data.' },
  { href: '/archivo/comparar', title: 'Head to head', text: 'Compara dos leyendas, número por número.' },
];

export default function ArchivoHome() {
  const champions = getChampions();
  const mvps = getMvps();
  const franchises = getFranchiseMap();
  const championByYear = new Map(champions.map((c) => [c.year, c]));
  const mvpByYear = new Map(mvps.map((m) => [m.year, m]));
  const currentYear = new Date().getFullYear();
  const anniversaries = [25, 50, 75].map((n) => ({ n, year: currentYear - n, champion: championByYear.get(currentYear - n) ?? null, mvp: mvpByYear.get(currentYear - n) ?? null }));
  const latestChampion = champions[0];
  const latestMvp = mvps[0];
  const playersCount = getPlayerIndex().length;
  const latestChampionF = latestChampion.franchiseSlug ? franchises.get(latestChampion.franchiseSlug) ?? null : null;
  const latestMvpF = latestMvp.franchiseSlugs[0] ? franchises.get(latestMvp.franchiseSlugs[0]) ?? null : null;

  return (
    <ArchivoShell
      hero={
        <div className="max-w-[720px]">
          <HeroEyebrow>El museo digital del BSN</HeroEyebrow>
          <HeroTitle>Noventa y seis años de baloncesto, en un solo lugar.</HeroTitle>
          <p className="mt-[14px] max-w-[62ch] font-barlow text-[15px] leading-[1.5] text-white/75 lg:text-[16px]">
            Campeones desde 1930, MVPs desde 1951 y las estadísticas de {playersCount.toLocaleString('es-PR')} jugadores. Cada año es un enlace, cada nombre es una historia.
          </p>
        </div>
      }
    >
      <section className="mb-[36px] lg:mb-[44px]">
        <SectionTitle>Este año en la historia</SectionTitle>
        <div className="grid grid-cols-1 gap-[12px] md:grid-cols-3 md:gap-[16px]">
          {anniversaries.map(({ n, year, champion, mvp }) => (
            <PaperCard key={n} className="px-[18px] py-[18px] md:px-[22px] md:py-[20px]">
              <Label>Hace {n} años</Label>
              <Link href={`/archivo/temporadas/${year}`} className={`mt-[6px] inline-block text-[40px] leading-[1] text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
                {year}
              </Link>
              <div className="mt-[16px] flex flex-col gap-[12px] border-t border-[rgba(0,0,0,0.06)] pt-[14px]">
                {champion ? (
                  <Link href={champion.franchiseSlug ? `/archivo/franquicias/${champion.franchiseSlug}` : `/archivo/temporadas/${year}`} className={`flex items-center gap-[10px] rounded-[4px] ${cls.focus}`}>
                    <FranchiseLogo franchise={champion.franchiseSlug ? franchises.get(champion.franchiseSlug) ?? null : null} fallbackName={champion.fullName} size="avatar" />
                    <span className="min-w-0">
                      <span className={`block ${cls.label} !text-[10px]`}>Campeón</span>
                      <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{champion.fullName}</span>
                    </span>
                  </Link>
                ) : null}
                {mvp ? (
                  <Link href={mvp.slug ? `/archivo/jugadores/${mvp.slug}` : `/archivo/mvps`} className={`flex items-center gap-[10px] rounded-[4px] ${cls.focus}`}>
                    <PlayerAvatar name={mvp.name} color={mvp.franchiseSlugs[0] ? franchises.get(mvp.franchiseSlugs[0])?.colors.primary : null} size="avatar" />
                    <span className="min-w-0">
                      <span className={`block ${cls.label} !text-[10px]`}>MVP</span>
                      <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{mvp.name}</span>
                    </span>
                  </Link>
                ) : null}
              </div>
            </PaperCard>
          ))}
        </div>
      </section>

      <section className="mb-[36px] lg:mb-[44px]">
        <SectionTitle>Explora el archivo</SectionTitle>
        <div className="grid grid-cols-2 gap-[12px] md:gap-[16px] lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <CardLink key={s.href} href={s.href} className="px-[18px] py-[18px] md:px-[22px] md:py-[20px]">
              <span className="block text-[20px] leading-[1.1] text-[#0F171F] md:text-[22px]">{s.title}</span>
              <span className={`mt-[6px] block ${cls.meta}`}>{s.text}</span>
            </CardLink>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Lo más reciente</SectionTitle>
        <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px]">
          <CardLink href={`/archivo/temporadas/${latestChampion.year}`} className="flex items-center gap-[16px] px-[18px] py-[18px] md:px-[22px] md:py-[20px]">
            <FranchiseLogo franchise={latestChampionF} fallbackName={latestChampion.fullName} sizePx={64} />
            <span className="min-w-0">
              <Label>Campeón {latestChampion.year}</Label>
              <span className="mt-[4px] block text-[24px] leading-[1.1] text-[#0F171F]">{latestChampion.fullName}</span>
              <span className={`mt-[4px] block ${cls.meta}`}>
                {latestChampion.coach ? `Dirigente: ${latestChampion.coach}` : ''}
                {latestChampion.series ? ` · Serie final ${latestChampion.series}` : ''}
              </span>
            </span>
          </CardLink>
          <CardLink href={latestMvp.slug ? `/archivo/jugadores/${latestMvp.slug}` : '/archivo/mvps'} className="flex items-center gap-[16px] px-[18px] py-[18px] md:px-[22px] md:py-[20px]">
            <PlayerAvatar name={latestMvp.name} color={latestMvpF?.colors.primary} sizePx={64} />
            <span className="min-w-0">
              <Label>MVP {latestMvp.year}</Label>
              <span className="mt-[4px] block text-[24px] leading-[1.1] text-[#0F171F]">{latestMvp.name}</span>
              <span className={`mt-[4px] block ${cls.meta}`}>{latestMvpF?.nickname ?? latestMvp.teamName}</span>
            </span>
          </CardLink>
        </div>
      </section>
    </ArchivoShell>
  );
}
