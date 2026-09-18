import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { alpha } from '@/archivo/lib/color';
import { fmtInt, initials } from '@/archivo/lib/format';
import { cls, INK } from '@/archivo/lib/tokens';
import type { FranchiseLeaderEntry } from '@/archivo/lib/types';
import { CURRENT_SEASON, franchiseFileWithColors } from '../lib/data';
import { franchiseCareerRows } from '../lib/franchise-table';
import Callout from './Callout';
import EraNotes from './EraNotes';
import FranchiseFullTable from './FranchiseFullTable';

const CARD = 'rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_#14181F0A]';
const TOP = 10;

function SectionHead({ id, title, right }: { id?: string; title: string; right?: React.ReactNode }) {
  return (
    <div id={id} className="mb-[12px] mt-[24px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[4px] scroll-mt-[24px] md:mt-[28px]">
      <h2 className="text-[20px] leading-[1.1] text-[#0F171F] md:text-[22px]">{title}</h2>
      {right ? <span className={cls.meta}>{right}</span> : null}
    </div>
  );
}

/** One category of the podium: the leader as hero, then the rest of the top 10. */
function LeaderCard({ label, list, color }: { label: string; list: FranchiseLeaderEntry[]; color: string }) {
  const [first, ...rest] = list.slice(0, TOP);
  if (!first) return null;
  return (
    <article className={`${CARD} px-[20px] pb-[16px] pt-[18px] md:px-[22px] md:pt-[20px]`}>
      <h3 className="text-[17px] leading-[1] tracking-[0.3px] text-[#0F171F]">{label}</h3>
      <Link href={`/jugadores/${first.slug}`} className={`mt-[14px] flex items-center gap-[14px] rounded-[8px] ${cls.focus}`}>
        <span aria-hidden className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full font-barlow text-[17px] font-bold" style={{ backgroundColor: alpha(color, 0.09), color }}>
          {initials(first.name)}
        </span>
        <span className="min-w-0">
          <span className={`block text-[34px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmtInt(first.value)}</span>
          <span className="mt-[3px] block truncate font-barlow text-[13px] font-semibold text-[#0F171F]">{first.name}</span>
          <span className={`block font-barlow text-[11.5px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>
            {first.seasons} temporadas · {fmtInt(first.g)} juegos
          </span>
        </span>
      </Link>
      {rest.length ? (
        <ol className="mt-[14px] flex flex-col gap-[7px] border-t border-[rgba(0,0,0,0.06)] pt-[12px]" start={2}>
          {rest.map((l, i) => (
            <li key={l.playerId} className="flex items-baseline justify-between gap-[10px] font-barlow text-[12.5px] text-[rgba(0,0,0,0.6)]">
              <Link href={`/jugadores/${l.slug}`} className={`min-w-0 truncate rounded-[3px] ${cls.focus} hover:text-[#0F171F]`}>
                <span className={`mr-[4px] ${cls.tabular}`}>{i + 2}.</span>
                {l.name}
              </Link>
              <span className={`shrink-0 font-semibold text-[#0F171F] ${cls.tabular}`}>{fmtInt(l.value)}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

/**
 * History of one franchise as a podium: header card with the mark and three counters, the championships as
 * a showcase of tinted year pills, the all-time leaders as three cards with a hero number and the top 10, and
 * the complete career table of everyone who wore the jersey. The team color tints marks and pills, never text.
 */
export default function FranchiseHistory({ slug }: { slug: string }) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const color = f.colors.primary ?? INK;
  const titles = [...f.titles].sort((a, b) => a.year - b.year);
  const first = f.firstYear ?? f.activeYears[0];
  const last = f.status === 'active' ? 'hoy' : (f.lastYear ?? f.activeYears[f.activeYears.length - 1]);
  const rows = franchiseCareerRows(slug);
  const leaders: Array<[string, FranchiseLeaderEntry[]]> = [
    ['Puntos', f.leaders.pts],
    ['Rebotes', f.leaders.reb],
    ['Asistencias', f.leaders.ast],
  ];
  const counters: Array<[string, string]> = [
    [String(f.titles.length), 'Campeonatos'],
    [String(f.mvps.length), 'MVPs'],
    [String(f.activeYears.length), 'Temporadas'],
  ];

  return (
    <div className="container pb-[24px] pt-[24px] lg:pb-[40px] lg:pt-[40px]">
      <header className={`${CARD} flex flex-col gap-[18px] px-[20px] py-[20px] md:flex-row md:items-center md:gap-[24px] md:px-[28px] md:py-[24px]`}>
        <div className="flex items-center gap-[16px] md:flex-1 md:gap-[24px]">
          <span className="inline-flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white" style={{ boxShadow: `inset 0 0 0 4px ${color}` }}>
            <FranchiseLogo franchise={f} sizePx={38} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[26px] leading-[1] text-[#0F171F] md:text-[30px]">{f.fullName}</h2>
            <p className={`mt-[5px] font-barlow text-[13px] text-[rgba(0,0,0,0.55)] ${cls.tabular}`}>
              {f.city ? `${f.city} · ` : ''}
              {f.status === 'active' ? 'activa' : 'extinta'} · {first} a {last}
            </p>
          </div>
        </div>
        <dl className="flex gap-[28px] text-center md:gap-[36px]">
          {counters.map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="mt-[5px] font-barlow text-[10px] font-semibold uppercase tracking-[1.1px] text-[rgba(0,0,0,0.45)]">{l}</dt>
              <dd className={`text-[36px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {f.notes ? (
        <Callout icon="info" title="Sobre esta franquicia" className="mt-[20px]">
          {f.notes}
        </Callout>
      ) : null}

      <SectionHead title={`Vitrina · ${f.titles.length} ${f.titles.length === 1 ? 'campeonato' : 'campeonatos'}`} right={titles.length ? 'Toca un año para ver su temporada' : undefined} />
      {titles.length ? (
        <ul className={`${CARD} flex flex-wrap gap-[8px] px-[18px] py-[16px] md:px-[22px] md:py-[18px]`}>
          {titles.map((t) => (
            <li key={t.year}>
              <Link
                href={`/temporadas/${t.year}`}
                title={[t.coach, t.series ? `Final ${t.series}` : null].filter(Boolean).join(' · ') || `Temporada ${t.year}`}
                className={`inline-flex h-[40px] items-center rounded-[8px] border px-[12px] text-[17px] text-[#0F171F] transition-[transform,background-color] duration-150 active:scale-[0.97] motion-reduce:transition-none ${cls.tabular} ${cls.focus}`}
                style={{ backgroundColor: alpha(color, 0.045), borderColor: alpha(color, 0.18) }}
              >
                {t.year}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${CARD} px-[18px] py-[16px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.6)]`}>Sin campeonatos en su historia. En la liga desde {first}.</p>
      )}

      <SectionHead
        title="Líderes históricos"
        right={
          <a href="#tablas" className={`${cls.textLink} ${cls.focus} rounded-[3px]`}>
            Tablas completas →
          </a>
        }
      />
      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
        {leaders.map(([label, list]) => (
          <LeaderCard key={label} label={label} list={list} color={color} />
        ))}
      </div>
      <EraNotes debutYears={[first]} className="mt-[12px]" />

      <SectionHead id="tablas" title="Tablas completas" right={`${fmtInt(rows.length)} jugadores · serie regular con la franquicia`} />
      <FranchiseFullTable rows={rows} nickname={f.nickname} />

      <p className={`mt-[20px] text-center ${cls.meta}`}>
        {f.status === 'active' && f.activeYears.includes(CURRENT_SEASON) ? 'La temporada 2026 se suma al cerrar. ' : ''}
        <Link href="/equipos/historicos" className={cls.textLink}>
          Ver todas las franquicias
        </Link>
      </p>
    </div>
  );
}
