import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import { PaperCard } from '@/archivo/components/ui';
import { getCoaches, getFranchiseMap } from '@/archivo/lib/data';
import { hrefs, type Hrefs } from '@/archivo/lib/hrefs';
import { cls } from '@/archivo/lib/tokens';
import type { CoachInsight, Franchise } from '@/archivo/lib/types';

const SHOWN = 8;

function CoachRow({ c, i, max, franchises, h }: { c: CoachInsight; i: number; max: number; franchises: Map<string, Franchise>; h: Hrefs }) {
  return (
    <li className="grid grid-cols-[24px_1fr_40px] items-start gap-x-[10px] border-b border-[rgba(0,0,0,0.05)] py-[14px] last:border-b-0 md:grid-cols-[28px_190px_1fr_44px] md:gap-x-[14px] md:py-[15px]">
      <span className="pt-[2px] font-barlow-condensed text-[15px] text-[rgba(0,0,0,0.45)]">{i + 1}</span>
      <div className="md:contents">
        <span className="block pt-[1px] font-barlow text-[15px] font-semibold text-[#0F171F]">{c.name}</span>
        <div className="mt-[8px] md:mt-0">
          <div className="h-[16px] rounded-[3px] bg-[#0F171F]" style={{ width: `${Math.max(3, (c.titles / max) * 100)}%` }} />
          <div className="mt-[9px] flex flex-wrap gap-[5px]">
            {c.championships.map((ch) => (
              <Link
                key={`${ch.year}-${ch.franchiseSlug}`}
                href={h.season(ch.year)}
                title={`${ch.franchiseName}${ch.coCoach ? ` (con ${ch.coCoach})` : ''}`}
                className={`inline-flex h-[24px] items-center gap-[5px] rounded-[7px] border border-[rgba(0,0,0,0.1)] py-[2px] pl-[3px] pr-[8px] font-barlow text-[12px] font-medium text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(0,0,0,0.3)] hover:text-[#0F171F] ${cls.tabular} ${cls.focus}`}
              >
                <FranchiseLogo franchise={ch.franchiseSlug ? franchises.get(ch.franchiseSlug) ?? null : null} fallbackName={ch.franchiseName} sizePx={16} />
                {ch.year}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <span className={`text-right text-[24px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{c.titles}</span>
    </li>
  );
}

/** Los dirigentes que ganaron: the coaches with most titles, each title a link to its season. */
export default function DirigentesContent({ site = false }: { site?: boolean }) {
  const h = hrefs(site);
  const coaches = getCoaches().slice(0, 15);
  const franchises = getFranchiseMap();
  const max = coaches[0]?.titles ?? 1;
  const first = coaches.slice(0, SHOWN);
  const rest = coaches.slice(SHOWN);
  return (
    <InsightPage
      site={site}
      title="Los dirigentes que ganaron"
      context="Julio Toro ganó doce campeonatos en cuatro décadas. Nadie está cerca."
      heroNumber={coaches[0]?.titles}
      heroNumberLabel={`títulos de ${coaches[0]?.name}`}
      source="Los títulos con dos dirigentes cuentan para ambos. Fuente: registro de campeonatos de la liga, 1930 a 2025."
    >
      <PaperCard className="px-[16px] py-[4px] md:px-[26px] md:py-[8px]">
        <ol>
          {first.map((c, i) => (
            <CoachRow key={c.name} c={c} i={i} max={max} franchises={franchises} h={h} />
          ))}
        </ol>
        {rest.length ? (
          <details className="group">
            <summary className={`cursor-pointer list-none border-t border-[rgba(0,0,0,0.05)] py-[13px] text-center font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)] transition-colors duration-150 hover:text-[#0F171F] ${cls.focus} [&::-webkit-details-marker]:hidden`}>
              <span className="group-open:hidden">Ver los {coaches.length}</span>
              <span className="hidden group-open:inline">Ver menos</span>
            </summary>
            <ol className="border-t border-[rgba(0,0,0,0.05)]">
              {rest.map((c, i) => (
                <CoachRow key={c.name} c={c} i={i + SHOWN} max={max} franchises={franchises} h={h} />
              ))}
            </ol>
          </details>
        ) : null}
      </PaperCard>
    </InsightPage>
  );
}
