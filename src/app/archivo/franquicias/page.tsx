import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { CardLink, HeroEyebrow, HeroTitle, SectionTitle } from '@/archivo/components/ui';
import { getChampions, getFranchises } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

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
        <section key={g.label} className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{g.list.length}</span>}>{g.label}</SectionTitle>
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:grid-cols-4">
            {g.list.map((f) => {
              const n = titles.get(f.slug) ?? 0;
              return (
                <CardLink key={f.slug} href={`/archivo/franquicias/${f.slug}`} className="flex items-center gap-[14px] px-[16px] py-[14px]">
                  <FranchiseLogo franchise={f} sizePx={48} />
                  <span className="min-w-0">
                    <span className="block truncate font-barlow text-[15px] font-semibold text-[#0F171F]">{f.nickname}</span>
                    <span className={`block truncate ${cls.meta} !text-[12px]`}>{f.city ?? 'Ciudad por confirmar'}</span>
                    <span className={`block ${cls.meta} !text-[12px] ${cls.tabular}`}>
                      {f.firstYear && f.lastYear ? `${f.firstYear} a ${f.lastYear}` : ''}
                      {n ? `${f.firstYear ? ' · ' : ''}${n} título${n === 1 ? '' : 's'}` : ''}
                    </span>
                  </span>
                </CardLink>
              );
            })}
          </div>
        </section>
      ))}
    </ArchivoShell>
  );
}
