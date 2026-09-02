import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import Scrollable from '@/archivo/components/Scrollable';
import { NotRecorded, PaperCard } from '@/archivo/components/ui';
import { getFranchiseMap, getRecordsByDecade } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { SeasonRecordKey } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Lo mejor de cada década · Archivo BSN', description: 'El mejor registro de temporada regular por década en puntos, rebotes, asistencias, robos y bloqueos.' };

const LABELS: Record<SeasonRecordKey, string> = { ppg: 'PPJ', rpg: 'RPJ', apg: 'APJ', spg: 'ROB', bpg: 'BLQ', pts: 'PTS totales' };
const TITLES: Record<SeasonRecordKey, string> = { ppg: 'Puntos por juego', rpg: 'Rebotes por juego', apg: 'Asistencias por juego', spg: 'Robos por juego', bpg: 'Bloqueos por juego', pts: 'Puntos totales' };

export default function RecordsPorDecadaPage() {
  const data = getRecordsByDecade();
  const franchises = getFranchiseMap();
  const firstDecade = data.decades[0]?.decade;
  const lastDecade = data.decades[data.decades.length - 1]?.decade;
  const stickyL = 'sticky left-0 z-10 bg-white shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] lg:static lg:shadow-none';
  return (
    <InsightPage
      title="Lo mejor de cada década"
      context="Cada era tuvo su número imposible."
      heroNumber={data.decades.length}
      heroNumberLabel={`décadas, de los ${String(firstDecade).slice(2)} a los ${lastDecade}`}
      source={`Serie Regular, mínimo ${data.minGames} juegos. "No registrado" significa que la liga no llevaba esa estadística en esa era; robos y bloqueos empiezan en 2000 y 2001.`}
    >
      <PaperCard className="px-[16px] py-[16px] md:px-[26px] md:py-[22px]">
        <p className="mb-[12px] font-barlow text-[12px] font-bold uppercase tracking-[1px] text-[#0F171F]">Lo mejor de cada década</p>
        <Scrollable>
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.1)]">
                <th scope="col" className={`w-[76px] min-w-[76px] pb-[8px] pr-[10px] text-left ${cls.label} ${stickyL}`}>
                  Década
                </th>
                {data.categories.map((c) => (
                  <th key={c} scope="col" title={TITLES[c]} className={`pb-[8px] pl-[10px] text-left ${cls.label}`}>
                    {LABELS[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.decades.map((d) => (
                <tr key={d.decade} className="border-b border-[rgba(0,0,0,0.06)] align-top last:border-b-0">
                  <th scope="row" className={`pr-[10px] pt-[18px] pb-[16px] text-left text-[26px] font-normal leading-[1] text-[#0F171F] ${cls.tabular} ${stickyL}`}>
                    {d.decade}s
                  </th>
                  {data.categories.map((c) => {
                    const r = d.records[c];
                    if (r.value === null || !r.slug) {
                      return (
                        <td key={c} className="pl-[10px] pt-[20px] pb-[16px]">
                          <NotRecorded />
                        </td>
                      );
                    }
                    const f = r.franchiseSlug ? franchises.get(r.franchiseSlug) ?? null : null;
                    return (
                      <td key={c} className="pl-[10px] pt-[16px] pb-[16px]">
                        <span className={`block text-[22px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{c === 'pts' ? fmtInt(r.value) : fmt(r.value)}</span>
                        <Link href={`/archivo/jugadores/${r.slug}`} className={`mt-[6px] block max-w-[150px] font-barlow text-[13px] font-semibold leading-[1.25] text-[#0F171F] rounded-[4px] ${cls.focus}`}>
                          {r.name}
                        </Link>
                        <span className={`mt-[5px] flex items-center gap-[5px] font-barlow text-[11.5px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>
                          <FranchiseLogo franchise={f} fallbackName={r.franchiseSlug ?? ''} sizePx={14} />
                          <Link href={`/archivo/temporadas/${r.year}`} className={`hover:text-[#0F171F] rounded-[4px] ${cls.focus}`}>
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
        </Scrollable>
        <p className={`mt-[12px] ${cls.note} !text-[12px] !text-[rgba(0,0,0,0.45)] lg:hidden`}>La columna de década queda fija; desliza para ver el resto.</p>
      </PaperCard>
    </InsightPage>
  );
}
