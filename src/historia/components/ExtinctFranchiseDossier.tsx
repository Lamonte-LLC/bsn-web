import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { alpha } from '@/archivo/lib/color';
import { fmtInt } from '@/archivo/lib/format';
import { cls, INK } from '@/archivo/lib/tokens';
import { franchiseFileWithColors } from '../lib/data';
import { lifeTicks, lifeYears, pauses, pausesLabel } from '../lib/franchise-life';
import { franchiseCareerRows } from '../lib/franchise-table';
import EraNotes from './EraNotes';
import FranchiseFullTable from './FranchiseFullTable';

const CARD = 'rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_#14181F0A]';
const TITLE = 'font-barlow text-[15px] font-bold tracking-[0.2px] text-[#0F171F]';

function ModuleHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[4px]">
      <h2 className={TITLE}>{title}</h2>
      {right ? <span className="font-barlow text-[12px] text-[rgba(0,0,0,0.5)]">{right}</span> : null}
    </div>
  );
}

/**
 * Option 3B, "Expediente": an extinct franchise as a dossier. A sticky identity column (mark, facts, aliases)
 * and one card per module: life year by year with the pauses visible, honours, seasons and everyone who wore
 * the jersey. The franchise color tints marks, bars and pills only.
 */
export default function ExtinctFranchiseDossier({ slug }: { slug: string }) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const color = f.colors.primary ?? INK;
  const first = f.firstYear ?? f.activeYears[0];
  const last = f.lastYear ?? f.activeYears[f.activeYears.length - 1];
  const life = lifeYears(f.activeYears, first, last);
  const gaps = pauses(life);
  const ticks = lifeTicks(first, last);
  const titles = [...f.titles].sort((a, b) => a.year - b.year);
  const rows = franchiseCareerRows(slug);
  const facts: Array<[string, string]> = [
    ['Ciudad', f.city ?? 'Por confirmar'],
    ['Estado', 'Extinta'],
    ['Debut', String(first)],
    ['Última temporada', String(last)],
    ['Temporadas jugadas', String(f.activeYears.length)],
  ];
  const aliases = [...new Set([f.nickname, f.fullName, ...f.aliases])];
  const pill = (year: number, title?: string, size: 'sm' | 'md' = 'sm') => (
    <Link
      key={year}
      href={`/temporadas/${year}`}
      title={title ?? `Temporada ${year}`}
      className={`inline-flex items-center rounded-[8px] border text-[#0F171F] transition-[transform] duration-150 active:scale-[0.97] motion-reduce:transition-none ${size === 'md' ? 'h-[40px] px-[12px] text-[17px]' : 'h-[34px] px-[11px] text-[15px]'} ${cls.tabular} ${cls.focus}`}
      style={{ backgroundColor: alpha(color, 0.045), borderColor: alpha(color, 0.2) }}
    >
      {year}
    </Link>
  );

  return (
    <div className="container pb-[24px] pt-[24px] lg:pb-[40px] lg:pt-[40px]">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-[14px] lg:sticky lg:top-[24px]">
          <div className={`${CARD} px-[24px] py-[26px] text-center`}>
            <FranchiseLogo franchise={f} sizePx={110} className="mx-auto" />
            <h2 className="mt-[14px] text-[26px] leading-[1.1] text-[#0F171F]">{f.fullName}</h2>
            {f.logo === null ? (
              <p className="mt-[10px]">
                <span className="inline-flex items-center rounded-[99px] border border-dashed border-[rgba(0,0,0,0.2)] px-[11px] py-[3px] font-barlow text-[11px] font-medium text-[rgba(0,0,0,0.5)]">logo pendiente de archivo</span>
              </p>
            ) : null}
            <dl className="mt-[16px] text-left">
              {facts.map(([k, v], i) => (
                <div key={k} className={`flex justify-between gap-[12px] py-[9px] ${i < facts.length - 1 ? 'border-b border-[rgba(0,0,0,0.05)]' : ''}`}>
                  <dt className="font-barlow text-[12px] font-medium text-[rgba(0,0,0,0.5)]">{k}</dt>
                  <dd className={`text-right font-barlow text-[13px] font-semibold text-[#0F171F] ${cls.tabular}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={`${CARD} px-[22px] py-[18px]`}>
            <h2 className="font-barlow text-[13px] font-bold text-[#0F171F]">Alias en el archivo</h2>
            <ul className="mt-[10px] flex flex-wrap gap-[6px]">
              {aliases.map((a) => (
                <li key={a} className="rounded-[99px] border border-[rgba(0,0,0,0.12)] px-[12px] py-[4px] font-barlow text-[12px] font-medium text-[rgba(0,0,0,0.65)]">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-[14px]">
          <section className={`${CARD} px-[20px] pb-[16px] pt-[20px] md:px-[26px] md:pt-[22px]`}>
            <ModuleHead title={`Vida de la franquicia · ${first} a ${last}`} right={gaps.length ? `huecos = pausas (${pausesLabel(gaps)})` : 'sin pausas'} />
            <div className="mt-[16px] flex items-end gap-[3px]" role="img" aria-label={`${f.activeYears.length} temporadas jugadas entre ${first} y ${last}`}>
              {life.map((y) => (
                <span key={y.year} title={y.active ? `${y.year} · jugó` : `${y.year} · no compitió`} className="block min-w-0 flex-1 rounded-[3px]" style={y.active ? { height: 30, backgroundColor: color, opacity: 0.8 } : { height: 7, backgroundColor: 'rgba(0,0,0,0.07)' }} />
              ))}
            </div>
            <div className="relative mt-[6px] h-[16px]">
              {ticks.map((t) => (
                <span key={t} className={`absolute -translate-x-1/2 font-barlow text-[10.5px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`} style={{ left: `${((t - first) / Math.max(1, last - first)) * 100}%` }}>
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className={`${CARD} px-[20px] py-[20px] md:px-[26px]`}>
            <ModuleHead title="Palmarés" right={titles.length ? `${titles.length} ${titles.length === 1 ? 'campeonato' : 'campeonatos'}` : undefined} />
            {titles.length ? (
              <ul className="mt-[12px] flex flex-wrap gap-[8px]">
                {titles.map((t) => (
                  <li key={t.year}>{pill(t.year, [t.coach, t.series ? `Final ${t.series}` : null].filter(Boolean).join(' · ') || undefined, 'md')}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-[12px] flex flex-col gap-[12px] rounded-[10px] bg-[#FAFAFA] px-[20px] py-[18px] md:flex-row md:items-center md:justify-between md:gap-[16px]">
                <div>
                  <p className="font-barlow text-[14px] font-semibold text-[rgba(0,0,0,0.6)]">Sin campeonatos en sus {f.activeYears.length} temporadas.</p>
                  <p className="mt-[2px] font-barlow text-[12.5px] text-[rgba(0,0,0,0.5)]">Su mejor resultado vive en las temporadas que jugó.</p>
                </div>
                <Link href="/estadisticas/campeones" className={`shrink-0 ${cls.textLink} ${cls.focus} rounded-[3px]`}>
                  Campeones {first}–{last} →
                </Link>
              </div>
            )}
          </section>

          <section className={`${CARD} px-[20px] py-[20px] md:px-[26px]`}>
            <ModuleHead
              title={`Sus temporadas · ${f.activeYears.length}`}
              right={
                <Link href={`/temporadas/${last}`} className={`${cls.textLink} ${cls.focus} rounded-[3px]`}>
                  Ver la última →
                </Link>
              }
            />
            <ul className="mt-[12px] flex flex-wrap gap-[7px]">
              {f.activeYears.map((y) => (
                <li key={y}>{pill(y)}</li>
              ))}
            </ul>
          </section>

          <section className={`${CARD} px-[20px] py-[20px] md:px-[26px]`}>
            <ModuleHead title="Jugadores de la franquicia" right={`${fmtInt(rows.length)} jugadores · serie regular con la franquicia`} />
            <div className="mt-[12px]">
              <FranchiseFullTable rows={rows} nickname={f.nickname} />
            </div>
            <EraNotes debutYears={[first]} className="mt-[12px]" />
          </section>

          <p className={`text-center ${cls.meta}`}>
            <Link href="/equipos/historicos" className={cls.textLink}>
              Ver todas las franquicias
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
