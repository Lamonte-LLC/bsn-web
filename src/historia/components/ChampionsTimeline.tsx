import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { getChampions, getFranchiseMap } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

const SHOWN = 12;

/**
 * Backlog 12: the last champions as one horizontal strip under the bracket, newest first, each tile linking to its
 * season. Back-to-back titles read as a quiet "Repite" line. The full list lives in /estadisticas/campeones.
 */
export default function ChampionsTimeline({ className = '' }: { className?: string }) {
  const champions = getChampions().filter((c) => c.franchiseSlug).sort((a, b) => b.year - a.year);
  const franchises = getFranchiseMap();
  const shown = champions.slice(0, SHOWN);
  if (!shown.length) return null;
  const counts = new Map<string, number>();
  for (const c of champions) counts.set(c.franchiseSlug!, (counts.get(c.franchiseSlug!) ?? 0) + 1);

  return (
    <section className={`container ${className}`}>
      <div className="mb-[20px] flex flex-row items-center justify-between md:mb-[32px]">
        <h2 className="text-[22px] text-[#0F171F] md:text-[32px]">Campeones anteriores</h2>
        <Link href="/estadisticas/campeones" className={cls.textLink}>
          Los {champions.length} campeones →
        </Link>
      </div>
      <ol className="-mx-4 flex gap-[10px] overflow-x-auto px-4 pb-[6px] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
        {shown.map((c, i) => {
          const f = franchises.get(c.franchiseSlug!) ?? null;
          const repeat = i + 1 < champions.length && champions[i + 1].franchiseSlug === c.franchiseSlug;
          return (
            <li key={c.year} className="w-[164px] shrink-0 md:w-auto">
              <Link href={`/temporadas/${c.year}`} className={`${cls.cardTap} flex h-full flex-col gap-[12px] px-[16px] py-[14px] ${cls.focus} active:scale-[0.99] motion-reduce:active:scale-100`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[26px] leading-none text-[#0F171F] ${cls.tabular}`}>{c.year}</span>
                  <FranchiseLogo franchise={f} sizePx={32} fallbackName={c.fullName} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[17px] leading-[1.15] text-[#0F171F]">{f?.nickname ?? c.name}</p>
                  <p className={`mt-[3px] truncate ${cls.meta} ${cls.tabular}`}>
                    {c.series ? `Final ${c.series}` : 'Final'}
                    {repeat ? ' · Repite' : ''}
                    {f ? ` · Título ${counts.get(c.franchiseSlug!)! - champions.slice(0, i).filter((x) => x.franchiseSlug === c.franchiseSlug).length}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
