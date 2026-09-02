import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { Chip, HeroEyebrow, HeroTitle, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchiseMap } from '@/archivo/lib/data';

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
          <HeroEyebrow>{champions.length} títulos desde 1930</HeroEyebrow>
          <HeroTitle>Campeones</HeroTitle>
        </div>
      }
    >
      <section className="mb-10">
        <SectionTitle>Títulos por franquicia</SectionTitle>
        <div className="flex flex-wrap gap-[8px]">
          {summary.map(([slug, n]) => {
            const f = franchises.get(slug)!;
            return (
              <Chip key={slug} href={`/archivo/franquicias/${slug}`}>
                <FranchiseLogo franchise={f} size="chip" />
                {f.nickname}
                <span className="text-[15px] text-black">{n}</span>
              </Chip>
            );
          })}
        </div>
      </section>

      {decades.map((d) => {
        const list = champions.filter((c) => Math.floor(c.year / 10) * 10 === d);
        return (
          <section key={d} className="mb-8">
            <SectionTitle>Década de {d}</SectionTitle>
            <ol className="rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
              {list.map((c, i) => {
                const f = c.franchiseSlug ? franchises.get(c.franchiseSlug) ?? null : null;
                const prevSame = i > 0 && list[i - 1].franchiseSlug === c.franchiseSlug && c.franchiseSlug;
                return (
                  <li key={c.year} className={`grid grid-cols-[64px_1fr] items-center gap-3 px-[14px] py-[10px] md:grid-cols-[72px_44px_1fr_220px_80px] ${i ? 'border-t border-[rgba(0,0,0,0.07)]' : ''} ${prevSame ? 'bg-[#FAFAFA]' : ''}`}>
                    <Link href={`/archivo/temporadas/${c.year}`} className="text-[24px] text-black hover:underline">
                      {c.year}
                    </Link>
                    <span className="hidden md:block">
                      <FranchiseLogo franchise={f} fallbackName={c.fullName} sizePx={36} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-[8px]">
                        <span className="md:hidden">
                          <FranchiseLogo franchise={f} fallbackName={c.fullName} size="chip" />
                        </span>
                        {f ? (
                          <Link href={`/archivo/franquicias/${f.slug}`} className="truncate text-[18px] text-[rgba(15,23,31,0.9)] hover:underline">
                            {c.fullName}
                          </Link>
                        ) : (
                          <span className="truncate text-[18px] text-[rgba(15,23,31,0.9)]">{c.fullName}</span>
                        )}
                        {prevSame ? <span className="hidden font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-[#E51F1F] md:inline">Repite</span> : null}
                      </span>
                      <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)] md:hidden">
                        {c.coach ?? ''}
                        {c.series ? ` · ${c.series}` : ''}
                      </span>
                    </span>
                    <span className="hidden truncate font-barlow text-[13px] text-[rgba(15,23,31,0.7)] md:block">{c.coach ?? '–'}</span>
                    <span className="hidden text-right font-barlow text-[13px] text-[rgba(15,23,31,0.7)] md:block">{c.series ?? '–'}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </ArchivoShell>
  );
}
