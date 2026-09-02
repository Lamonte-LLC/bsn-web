import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import { getFranchiseMap, getRecordsByDecade } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import type { SeasonRecordKey } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Lo mejor de cada década · Archivo BSN', description: 'El mejor registro de temporada regular por década en puntos, rebotes, asistencias, robos y bloqueos.' };

const LABELS: Record<SeasonRecordKey, string> = { ppg: 'Puntos por juego', rpg: 'Rebotes por juego', apg: 'Asistencias por juego', spg: 'Robos por juego', bpg: 'Bloqueos por juego', pts: 'Puntos totales' };

export default function RecordsPorDecadaPage() {
  const data = getRecordsByDecade();
  const franchises = getFranchiseMap();
  return (
    <InsightPage title="Lo mejor de cada década" context="Cada era tuvo su número imposible." heroNumber={data.decades.length} heroNumberLabel="décadas, de los 50 a los 2020">
      <div className="relative">
        <div className="overflow-x-auto rounded-[12px] border border-[#EAEAEA] bg-white">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-[#F3F3F3]">
                <th scope="col" className="sticky left-0 z-10 bg-[#F3F3F3] px-[12px] py-[10px] text-left font-barlow text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)] shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)]">
                  Década
                </th>
                {data.categories.map((c) => (
                  <th key={c} scope="col" className="px-[12px] py-[10px] text-left font-barlow text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)]">
                    {LABELS[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.decades.map((d) => (
                <tr key={d.decade} className="border-t border-[rgba(0,0,0,0.07)] align-top odd:bg-white even:bg-[#FCFCFC]">
                  <th scope="row" className="sticky left-0 z-10 bg-inherit px-[12px] py-[12px] text-left text-[24px] font-normal text-black shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)]">
                    {d.decade}s
                  </th>
                  {data.categories.map((c) => {
                    const r = d.records[c];
                    if (r.value === null) {
                      return (
                        <td key={c} className="px-[12px] py-[12px] font-barlow text-[13px] text-[rgba(15,23,31,0.45)]">
                          no registrado
                        </td>
                      );
                    }
                    const f = r.franchiseSlug ? franchises.get(r.franchiseSlug) ?? null : null;
                    return (
                      <td key={c} className="px-[12px] py-[12px]">
                        <span className="block text-[24px] leading-[1] text-black [font-variant-numeric:tabular-nums]">{c === 'pts' ? fmtInt(r.value) : fmt(r.value)}</span>
                        <Link href={`/archivo/jugadores/${r.slug}`} className="mt-[4px] block truncate text-[15px] text-[rgba(15,23,31,0.9)] hover:underline">
                          {r.name}
                        </Link>
                        <span className="mt-[2px] flex items-center gap-[5px] font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">
                          <FranchiseLogo franchise={f} fallbackName={r.franchiseSlug ?? ''} sizePx={14} />
                          <Link href={`/archivo/temporadas/${r.year}`} className="hover:underline">
                            {r.year}
                          </Link>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[28px] rounded-r-[12px] bg-gradient-to-l from-white to-transparent lg:hidden" />
      </div>
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">Serie Regular, mínimo {data.minGames} juegos. "No registrado" significa que la liga no llevaba esa estadística en esa era; robos y bloqueos empiezan en 2000 y 2001.</p>
    </InsightPage>
  );
}
