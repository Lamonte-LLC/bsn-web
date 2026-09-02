import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { HeroEyebrow, HeroTitle, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchises } from '@/archivo/lib/data';

export const metadata: Metadata = { title: 'Franquicias · Archivo BSN', description: 'Las 28 franquicias en la historia del BSN, activas y extintas.' };

export default function FranquiciasPage() {
  const franchises = getFranchises();
  const titles = new Map<string, number>();
  for (const c of getChampions()) if (c.franchiseSlug) titles.set(c.franchiseSlug, (titles.get(c.franchiseSlug) ?? 0) + 1);
  const sorted = [...franchises].sort((a, b) => (titles.get(b.slug) ?? 0) - (titles.get(a.slug) ?? 0) || a.fullName.localeCompare(b.fullName, 'es'));
  const groups = [
    { label: 'Activas', list: sorted.filter((f) => f.status === 'active') },
    { label: 'Extintas', list: sorted.filter((f) => f.status === 'extinct') },
  ];
  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>{franchises.length} franquicias</HeroEyebrow>
          <HeroTitle>Franquicias</HeroTitle>
        </div>
      }
    >
      {groups.map((g) => (
        <section key={g.label} className="mb-10">
          <SectionTitle right={`${g.list.length}`}>{g.label}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.list.map((f) => (
              <Link key={f.slug} href={`/archivo/franquicias/${f.slug}`} className="flex items-center gap-[12px] rounded-[12px] border border-[#EAEAEA] bg-white p-[14px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]">
                <FranchiseLogo franchise={f} sizePx={48} />
                <span className="min-w-0">
                  <span className="block truncate text-[18px] leading-[1.1] text-[rgba(15,23,31,0.9)]">{f.nickname}</span>
                  <span className="block truncate font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">{f.city ?? 'Ciudad por confirmar'}</span>
                  <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">
                    {f.firstYear && f.lastYear ? `${f.firstYear} a ${f.lastYear}` : ''}
                    {titles.get(f.slug) ? ` · ${titles.get(f.slug)} título${titles.get(f.slug) === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </ArchivoShell>
  );
}
