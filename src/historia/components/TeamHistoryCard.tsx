import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import { franchiseFileWithColors } from '../lib/data';

type Props = {
  slug: string;
  /** Live team code, for the link to the Historia tab. */
  code: string;
};

/**
 * Sidebar card of the team's Resumen tab, "ficha de club": six facts every franchise has in a lined grid,
 * the standout players with the franchise color on their avatars, and a button to the Historia tab. Teams
 * without titles read "Ninguno", never an empty block.
 */
export default function TeamHistoryCard({ slug, code }: Props) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titles = [...f.titles].sort((a, b) => b.year - a.year);
  const last = titles[0] ?? null;
  const primary = f.colors.primary ?? '#0F171F';
  const mvp = [...f.mvps].sort((a, b) => b.year - a.year)[0] ?? null;
  const scorer = f.leaders.pts[0] ?? null;
  const rebounder = f.leaders.reb[0] ?? null;
  const most = [...f.players].sort((a, b) => b.seasons - a.seasons || a.name.localeCompare(b.name))[0] ?? null;
  const best = f.seasonRecords
    .filter((r) => !r.fpo && r.won + r.lost > 0)
    .sort((a, b) => b.won / (b.won + b.lost) - a.won / (a.won + a.lost) || b.year - a.year)[0] ?? null;

  const facts: Array<[string, string]> = [
    ['Fundación', f.firstYear ? String(f.firstYear) : '–'],
    ['Temporadas', String(f.activeYears.length)],
    ['Campeonatos', titles.length ? `${titles.length} · último ${last!.year}` : 'Ninguno'],
    ['MVPs', f.mvps.length ? String(f.mvps.length) : 'Ninguno'],
    ['Mejor temporada', best ? `${best.year} · ${best.won}-${best.lost}` : '–'],
    ['Jugadores', `${fmtInt(f.players.length)} en su historia`],
  ];

  type Person = { key: string; slug: string | null; name: string; sub: string };
  const people: Person[] = [];
  const push = (x: Person | null) => {
    if (x && !people.some((y) => y.name === x.name) && people.length < 3) people.push(x);
  };
  push(scorer ? { key: 'pts', slug: scorer.slug, name: scorer.name, sub: `Máximo anotador · ${fmtInt(scorer.value)} pts` } : null);
  push(mvp ? { key: 'mvp', slug: mvp.slug, name: mvp.name, sub: `Jugador más valioso · ${mvp.year}` } : null);
  push(rebounder ? { key: 'reb', slug: rebounder.slug, name: rebounder.name, sub: `Máximo reboteador · ${fmtInt(rebounder.value)} reb` } : null);
  push(most ? { key: 'most', slug: most.slug, name: most.name, sub: `Más temporadas · ${most.seasons}` } : null);

  return (
    <div className="flex-1 rounded-[12px] md:border md:border-[#EAEAEA] md:bg-white md:shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="flex flex-row items-center justify-between pt-[24px] md:px-[30px]">
        <h3 className="text-[22px] text-black md:text-[24px]">Historia</h3>
        <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">{f.firstYear ? `Desde ${f.firstYear}` : ''}</p>
      </div>
      <div className="pb-[24px] pt-[16px] md:px-[30px] md:pb-[30px]">
        <div className="grid grid-cols-2 border-l border-t border-[rgba(0,0,0,0.1)]">
          {facts.map(([l, v]) => (
            <div key={l} className="border-b border-r border-[rgba(0,0,0,0.1)] px-[12px] py-[9px]">
              <p className="font-barlow-condensed text-[13px] text-[rgba(15,23,31,0.55)]">{l}</p>
              <p className={`mt-[2px] font-barlow text-[14px] font-semibold text-[#0F171F] ${cls.tabular}`}>{v}</p>
            </div>
          ))}
        </div>

        {people.length ? (
          <div className="mt-[18px]">
            <p className={cls.label}>Jugadores destacados</p>
            <ul className="mt-[4px]">
              {people.map((l, i) => {
                const inner = (
                  <>
                    <PlayerAvatar name={l.name} color={primary} sizePx={34} />
                    <span className="min-w-0">
                      <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{l.name}</span>
                      <span className={`block truncate font-barlow text-[12px] text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>{l.sub}</span>
                    </span>
                  </>
                );
                const row = `flex items-center gap-[12px] py-[9px] ${i ? 'border-t border-[rgba(0,0,0,0.07)]' : ''}`;
                return (
                  <li key={l.key}>
                    {l.slug ? (
                      <Link href={`/jugadores/${l.slug}`} className={`${row} rounded-[4px] transition-colors hover:bg-[#FAFAFA] ${cls.focus}`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={row}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <Link href={`/equipos/${code}?tab=historia`} className={`mt-[18px] inline-flex h-[38px] w-full items-center justify-center rounded-[100px] bg-[#0F171F] px-[18px] text-[15px] text-white transition-[opacity,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:opacity-90 ${cls.focus}`}>
          Ver la historia completa
        </Link>
      </div>
    </div>
  );
}
