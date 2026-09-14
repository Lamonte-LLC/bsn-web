import Link from 'next/link';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import { franchiseFileWithColors } from '../lib/data';

type Props = {
  slug: string;
  /** Live team code, for the link to the Historia tab. */
  code: string;
};

function longestRun(years: number[]): [number, number] | null {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  let best: [number, number] | null = null;
  let start = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] !== sorted[i - 1] + 1) {
      const end = sorted[i - 1];
      if (end > start && (!best || end - start > best[1] - best[0])) best = [start, end];
      start = sorted[i];
    }
  }
  return best;
}

/**
 * Sidebar card of the team's Resumen tab: what the franchise has won and who marked it, in the same card as
 * "Líderes del equipo", with a button to the Historia tab. Replaces the one-line ribbon under the record.
 */
export default function TeamHistoryCard({ slug, code }: Props) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titles = [...f.titles].sort((a, b) => b.year - a.year);
  const last = titles[0] ?? null;
  const first = titles[titles.length - 1] ?? null;
  const run = longestRun(titles.map((t) => t.year));
  const mvp = [...f.mvps].sort((a, b) => b.year - a.year)[0] ?? null;
  const scorer = f.leaders.pts[0] ?? null;
  const primary = f.colors.primary ?? '#0F171F';
  const rows: Array<{ label: string; value: React.ReactNode }> = [];
  if (last) rows.push({ label: 'Último título', value: `${last.year}${last.series ? ` · Final ${last.series}` : ''}${last.coach ? ` · ${last.coach}` : ''}` });
  if (first && first.year !== last?.year) rows.push({ label: 'Primer título', value: String(first.year) });
  if (run) rows.push({ label: 'Mejor racha', value: `${run[1] - run[0] + 1} seguidos · ${run[0]} a ${run[1]}` });
  if (mvp)
    rows.push({
      label: 'Último MVP',
      value: mvp.slug ? (
        <Link href={`/jugadores/${mvp.slug}`} className={`${cls.dataLink} rounded-[4px] ${cls.focus}`}>
          {mvp.name} · {mvp.year}
        </Link>
      ) : (
        `${mvp.name} · ${mvp.year}`
      ),
    });
  if (scorer)
    rows.push({
      label: 'Máximo anotador',
      value: (
        <Link href={`/jugadores/${scorer.slug}`} className={`${cls.dataLink} rounded-[4px] ${cls.focus}`}>
          {scorer.name} · {fmtInt(scorer.value)} pts
        </Link>
      ),
    });
  if (f.firstYear) rows.push({ label: 'En la liga desde', value: `${f.firstYear} · ${f.activeYears.length} temporadas` });

  return (
    <div className="flex-1 rounded-[12px] md:border md:border-[#EAEAEA] md:bg-white md:shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="flex flex-row items-center justify-between pt-[24px] md:px-[30px]">
        <h3 className="text-[22px] text-black md:text-[24px]">Historia</h3>
        <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">{f.firstYear ? `Desde ${f.firstYear}` : ''}</p>
      </div>
      <div className="pb-[24px] pt-[16px] md:px-[30px] md:pb-[30px]">
        <div className="grid grid-cols-3 gap-[10px]">
          <div>
            <p className={`text-[30px] leading-[1] ${cls.tabular}`} style={{ color: titles.length ? primary : '#0F171F' }}>
              {titles.length}
            </p>
            <p className={`mt-[5px] ${cls.label}`}>Campeonatos</p>
          </div>
          <div>
            <p className={`text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{f.mvps.length}</p>
            <p className={`mt-[5px] ${cls.label}`}>MVPs</p>
          </div>
          <div>
            <p className={`text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{f.activeYears.length}</p>
            <p className={`mt-[5px] ${cls.label}`}>Temporadas</p>
          </div>
        </div>
        {rows.length ? (
          <ul className="mt-[16px] divide-y divide-[rgba(0,0,0,0.07)] border-t border-[rgba(0,0,0,0.07)]">
            {rows.map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-[12px] py-[9px]">
                <span className="shrink-0 font-barlow text-[13px] text-[rgba(15,23,31,0.6)]">{r.label}</span>
                <span className={`text-right font-barlow text-[14px] font-semibold text-[#0F171F] ${cls.tabular}`}>{r.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-[16px] font-barlow text-[14px] text-[rgba(15,23,31,0.7)]">Sin campeonatos en su historia.</p>
        )}
        <Link href={`/equipos/${code}?tab=historia`} className={`mt-[18px] inline-flex h-[38px] w-full items-center justify-center rounded-[100px] bg-[#0F171F] px-[18px] text-[15px] text-white transition-opacity hover:opacity-90 ${cls.focus}`}>
          Ver la historia completa
        </Link>
      </div>
    </div>
  );
}
