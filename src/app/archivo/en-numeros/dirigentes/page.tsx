import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import { getCoaches, getFranchiseMap } from '@/archivo/lib/data';

export const metadata: Metadata = { title: 'Los dirigentes que ganaron · Archivo BSN', description: 'Los dirigentes con más campeonatos en la historia del BSN.' };

export default function DirigentesPage() {
  const coaches = getCoaches().slice(0, 15);
  const franchises = getFranchiseMap();
  const max = coaches[0]?.titles ?? 1;
  return (
    <InsightPage title="Los dirigentes que ganaron" context="Julio Toro ganó doce campeonatos en cuatro décadas. Nadie está cerca." heroNumber={coaches[0]?.titles} heroNumberLabel={`títulos de ${coaches[0]?.name}`}>
      <ol className="flex flex-col gap-[14px]">
        {coaches.map((c, i) => (
          <li key={c.name} className="grid grid-cols-[28px_1fr] items-start gap-3 md:grid-cols-[32px_220px_1fr]">
            <span className="pt-[6px] font-barlow-condensed text-[15px] text-[rgba(0,0,0,0.6)]">{i + 1}</span>
            <div className="md:contents">
              <span className="block pt-[3px] text-[18px] leading-[1.2] text-[rgba(15,23,31,0.9)]">{c.name}</span>
              <div className="mt-[6px] md:mt-0">
                <div className="flex items-center gap-[10px]">
                  <span className="h-[26px] rounded-[4px] bg-[#0F171F]" style={{ width: `${Math.max(3, (c.titles / max) * 100)}%` }} />
                  <span className="text-[22px] leading-[1] text-black [font-variant-numeric:tabular-nums]">{c.titles}</span>
                </div>
                <div className="mt-[6px] flex flex-wrap gap-[4px]">
                  {c.championships.map((ch) => (
                    <Link
                      key={`${ch.year}-${ch.franchiseSlug}`}
                      href={`/archivo/temporadas/${ch.year}`}
                      title={`${ch.franchiseName}${ch.coCoach ? ` (con ${ch.coCoach})` : ''}`}
                      className="inline-flex h-[28px] items-center gap-[5px] rounded-[6px] border border-[#EAEAEA] bg-white px-[7px] font-barlow text-[13px] font-medium text-[rgba(15,23,31,0.8)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]"
                    >
                      <FranchiseLogo franchise={ch.franchiseSlug ? franchises.get(ch.franchiseSlug) ?? null : null} fallbackName={ch.franchiseName} sizePx={16} />
                      {ch.year}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">Los títulos con dos dirigentes (por ejemplo, Del Harris y Tom Nissalke en 1975) cuentan para ambos.</p>
    </InsightPage>
  );
}
