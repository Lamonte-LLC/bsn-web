import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { textOn } from '@/archivo/lib/color';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import { franchiseFileWithColors } from '../lib/data';

type Props = {
  slug: string;
  /** Live team code, for the link to the Historia tab. */
  code: string;
};

const shortCoach = (c: string | null) => (c ? c.split(/\s+y\s+/).map((n) => n.trim().split(' ').slice(-1)[0]).join(', ') : null);

/**
 * Sidebar card of the team's Resumen tab: counters, the latest titles as tiles, the legends of the franchise
 * and a button to the Historia tab. Teams with few or no titles lean on the legends and the counters.
 */
export default function TeamHistoryCard({ slug, code }: Props) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titles = [...f.titles].sort((a, b) => b.year - a.year);
  const last = titles[0] ?? null;
  const primary = f.colors.primary ?? '#0F171F';
  const onPrimary = textOn(primary);
  const mvp = [...f.mvps].sort((a, b) => b.year - a.year)[0] ?? null;
  const scorer = f.leaders.pts[0] ?? null;
  const rebounder = f.leaders.reb[0] ?? null;
  const assister = f.leaders.ast[0] ?? null;

  type Legend = { key: string; slug: string | null; name: string; sub: string };
  const legends: Legend[] = [];
  const push = (l: Legend | null) => {
    if (l && !legends.some((x) => x.slug === l.slug && x.name === l.name) && legends.length < 4) legends.push(l);
  };
  push(scorer ? { key: 'pts', slug: scorer.slug, name: scorer.name, sub: `Máximo anotador · ${fmtInt(scorer.value)} pts · ${scorer.seasons} temporada${scorer.seasons === 1 ? '' : 's'}` } : null);
  push(mvp ? { key: 'mvp', slug: mvp.slug, name: mvp.name, sub: `Jugador más valioso · ${mvp.year}` } : null);
  push(rebounder ? { key: 'reb', slug: rebounder.slug, name: rebounder.name, sub: `Máximo reboteador · ${fmtInt(rebounder.value)} reb` } : null);
  push(assister ? { key: 'ast', slug: assister.slug, name: assister.name, sub: `Máximo asistente · ${fmtInt(assister.value)} ast` } : null);
  const legendsShown = legends.slice(0, titles.length ? 3 : 4);

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

        {titles.length ? (
          <div className="mt-[16px]">
            <div className="flex flex-wrap gap-[6px]">
              {titles.slice(0, 3).map((t) => (
                <Link key={t.year} href={`/temporadas/${t.year}`} className={`flex h-[60px] w-[80px] flex-col justify-between rounded-[9px] px-[10px] py-[8px] transition-opacity hover:opacity-90 ${cls.focus}`} style={{ background: primary, color: onPrimary }}>
                  <span className={`text-[24px] leading-[1] ${cls.tabular}`}>{t.year}</span>
                  <span className="truncate font-barlow text-[10.5px] font-medium opacity-85">{[shortCoach(t.coach), t.series].filter(Boolean).join(' · ') || 'Título'}</span>
                </Link>
              ))}
              {titles.length > 3 ? (
                <Link href={`/equipos/${code}?tab=historia`} className={`flex h-[60px] w-[62px] flex-col justify-between rounded-[9px] border border-[rgba(0,0,0,0.1)] px-[10px] py-[8px] text-[#0F171F] transition-colors hover:border-[rgba(0,0,0,0.3)] ${cls.focus}`}>
                  <span className={`text-[24px] leading-[1] ${cls.tabular}`}>+{titles.length - 3}</span>
                  <span className="font-barlow text-[10.5px] font-medium text-[rgba(0,0,0,0.5)]">más</span>
                </Link>
              ) : null}
            </div>
            {last ? <p className={`mt-[10px] font-barlow text-[13px] text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>Último título {last.year}{last.series ? ` · Final ${last.series}` : ''}{last.coach ? ` · ${last.coach}` : ''}</p> : null}
          </div>
        ) : (
          <p className="mt-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.6)]">Sin campeonatos en su historia{f.firstYear ? ` · en la liga desde ${f.firstYear}` : ''}.</p>
        )}

        {legendsShown.length ? (
          <div className="mt-[18px]">
            <p className={cls.label}>Leyendas</p>
            <ul className="mt-[6px] divide-y divide-[rgba(0,0,0,0.07)]">
              {legendsShown.map((l) => {
                const inner = (
                  <>
                    <PlayerAvatar name={l.name} color={primary} sizePx={34} />
                    <span className="min-w-0">
                      <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{l.name}</span>
                      <span className={`block truncate font-barlow text-[12px] text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>{l.sub}</span>
                    </span>
                  </>
                );
                return (
                  <li key={l.key}>
                    {l.slug ? (
                      <Link href={`/jugadores/${l.slug}`} className={`flex items-center gap-[12px] py-[9px] rounded-[4px] transition-colors hover:bg-[#FAFAFA] ${cls.focus}`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-[12px] py-[9px]">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <Link href={`/equipos/${code}?tab=historia`} className={`mt-[18px] inline-flex h-[38px] w-full items-center justify-center rounded-[100px] bg-[#0F171F] px-[18px] text-[15px] text-white transition-opacity hover:opacity-90 ${cls.focus}`}>
          Ver la historia completa
        </Link>
      </div>
    </div>
  );
}
