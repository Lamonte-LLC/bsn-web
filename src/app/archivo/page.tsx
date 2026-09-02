import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Eyebrow, HeroEyebrow, HeroTitle, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap, getMvps, getPlayerIndex } from '@/archivo/lib/data';

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
  { href: '/archivo/en-numeros', title: 'El BSN en números', text: 'Siete historias contadas con data.' },
  { href: '/archivo/comparar', title: 'Cara a cara', text: 'Compara dos leyendas, número por número.' },
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

  return (
    <ArchivoShell
      hero={
        <div className="max-w-[720px]">
          <HeroEyebrow>El museo digital del BSN</HeroEyebrow>
          <HeroTitle>Noventa y seis años de baloncesto, en un solo lugar.</HeroTitle>
          <p className="mt-[14px] font-barlow text-[15px] font-medium leading-[1.4] text-white/75 lg:text-[16px]">
            Campeones desde 1930, MVPs desde 1951 y las estadísticas de {playersCount.toLocaleString('es-PR')} jugadores. Cada año es un enlace, cada nombre es una historia.
          </p>
        </div>
      }
    >
      <section className="mb-10 lg:mb-14">
        <SectionTitle>Este año en la historia</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {anniversaries.map(({ n, year, champion, mvp }) => (
            <PaperCard key={n} className="p-[16px] md:p-[20px]">
              <Eyebrow>Hace {n} años</Eyebrow>
              <Link href={`/archivo/temporadas/${year}`} className="mt-[4px] block text-[38px] leading-[1] text-black">
                {year}
              </Link>
              <div className="mt-[14px] flex flex-col gap-[12px]">
                {champion ? (
                  <Link href={champion.franchiseSlug ? `/archivo/franquicias/${champion.franchiseSlug}` : `/archivo/temporadas/${year}`} className="flex items-center gap-[10px]">
                    <FranchiseLogo franchise={champion.franchiseSlug ? franchises.get(champion.franchiseSlug) ?? null : null} fallbackName={champion.fullName} size="avatar" />
                    <span className="min-w-0">
                      <span className="block font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.5)]">Campeón</span>
                      <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{champion.fullName}</span>
                    </span>
                  </Link>
                ) : null}
                {mvp ? (
                  <Link href={mvp.slug ? `/archivo/jugadores/${mvp.slug}` : `/archivo/mvps`} className="flex items-center gap-[10px]">
                    <PlayerAvatar name={mvp.name} color={mvp.franchiseSlugs[0] ? franchises.get(mvp.franchiseSlugs[0])?.colors.primary : null} size="avatar" />
                    <span className="min-w-0">
                      <span className="block font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.5)]">MVP</span>
                      <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{mvp.name}</span>
                    </span>
                  </Link>
                ) : null}
              </div>
            </PaperCard>
          ))}
        </div>
      </section>

      <section className="mb-10 lg:mb-14">
        <SectionTitle>Explora el archivo</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group rounded-[12px] border border-[#EAEAEA] bg-white p-[16px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)] md:p-[20px]">
              <span className="block text-[22px] text-black">{s.title}</span>
              <span className="mt-[4px] block font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">{s.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Lo más reciente</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <PaperCard className="flex items-center gap-[14px] p-[16px] md:p-[20px]">
            <FranchiseLogo franchise={latestChampion.franchiseSlug ? franchises.get(latestChampion.franchiseSlug) ?? null : null} fallbackName={latestChampion.fullName} sizePx={72} />
            <div className="min-w-0">
              <Eyebrow>Campeón {latestChampion.year}</Eyebrow>
              <Link href={`/archivo/temporadas/${latestChampion.year}`} className="block text-[24px] leading-[1.1] text-black">
                {latestChampion.fullName}
              </Link>
              <p className="mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">
                {latestChampion.coach ? `Dirigente: ${latestChampion.coach}` : ''}
                {latestChampion.series ? ` · Serie final ${latestChampion.series}` : ''}
              </p>
            </div>
          </PaperCard>
          <PaperCard className="flex items-center gap-[14px] p-[16px] md:p-[20px]">
            <PlayerAvatar name={latestMvp.name} color={latestMvp.franchiseSlugs[0] ? franchises.get(latestMvp.franchiseSlugs[0])?.colors.primary : null} sizePx={72} />
            <div className="min-w-0">
              <Eyebrow>MVP {latestMvp.year}</Eyebrow>
              <Link href={latestMvp.slug ? `/archivo/jugadores/${latestMvp.slug}` : '/archivo/mvps'} className="block text-[24px] leading-[1.1] text-black">
                {latestMvp.name}
              </Link>
              <p className="mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">{latestMvp.teamName}</p>
            </div>
          </PaperCard>
        </div>
      </section>
    </ArchivoShell>
  );
}
