import Link from 'next/link';
import { getChampions, getCoaches, getFranchiseMap, getMultiMvps, getMvps, getPlayer, getPlayerIndex, getPlayerIndexById, getRecords } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';
import { CURRENT_SEASON } from '@/historia/lib/data';
import {
  anniversaryYears,
  casualName,
  championLine,
  legendPool,
  legendReason,
  numberFacts,
  pickFacts,
  pickLegend,
  ptsRank,
  teamNickname,
  titlesByFranchise,
} from '@/historia/lib/home';
import AnniversariesCard, { type AnniversaryRow } from './AnniversariesCard';
import LegendCard from './LegendCard';
import NumberTiles from './NumberTiles';

/**
 * "Historia BSN" on the home page: the legend of the day (A), the seasons 50 and 25 years back (B) and one
 * rotating number of the league (C). Everything is read from the archive on the server; the rotation is by
 * civil day in Puerto Rico. When the archive has nothing to show, the section renders nothing.
 */
export default function HistoriaSection() {
  const now = new Date();
  const franchises = getFranchiseMap();
  const index = getPlayerIndex();

  // A · legend of the day
  const legendEntry = pickLegend(legendPool(index), now);
  const legend = legendEntry ? getPlayer(legendEntry.id) : null;
  const lastFranchise = legend ? franchises.get(legend.franchiseSlugs[legend.franchiseSlugs.length - 1] ?? '') : null;
  // The plate already prints the points rank, so the reason line only leads with it for the all-time top scorer.
  const legendRank = legend ? ptsRank(index, legend.id) : null;
  const legendReasonLine = legend
    ? legendReason({ ptsRank: legendRank === 1 || !legend.mvpYears.length ? legendRank : null, mvpYears: legend.mvpYears, seasons: legend.seasons, fy: legend.fy, ly: legend.ly })
    : '';

  // B · anniversaries
  const champions = getChampions();
  const mvpByYear = new Map(getMvps().map((m) => [m.year, m]));
  const championByYear = new Map(champions.map((c) => [c.year, c]));
  const rows: AnniversaryRow[] = anniversaryYears(CURRENT_SEASON, champions.map((c) => c.year)).flatMap((a) => {
    const c = championByYear.get(a.year);
    if (!c) return [];
    const mvp = mvpByYear.get(a.year) ?? null;
    return [{ ago: a.ago, year: a.year, champion: c.fullName, championLine: championLine(c), mvpName: mvp?.name ?? null, mvpTeam: mvp ? teamNickname(mvp.teamName) : null }];
  });

  // C · one number of the league
  const coach = getCoaches()[0] ?? null;
  const scorer = getRecords().career.pts[0] ?? null;
  const multi = getMultiMvps();
  const maxMvps = multi.reduce((m, e) => Math.max(m, e.count), 0);
  const tiedMvps = multi.filter((e) => e.count === maxMvps);
  const topFranchise = titlesByFranchise(champions)[0] ?? null;
  const facts = pickFacts(
    numberFacts({
      topCoach: coach ? { name: coach.name, titles: coach.titles } : null,
      topScorer: scorer ? { name: casualName(scorer.name, getPlayerIndexById(scorer.playerId)?.aliases), pts: scorer.value } : null,
      topMvps: maxMvps ? { names: tiedMvps.map((e) => casualName(e.name, (e.playerId && getPlayerIndexById(e.playerId)?.aliases) || [])), count: maxMvps } : null,
      topFranchise: topFranchise ? { name: franchises.get(topFranchise.slug)?.fullName ?? topFranchise.slug, titles: topFranchise.titles } : null,
    }),
    now,
    3,
  );

  if (!legend && !rows.length && !facts.length) return null;

  return (
    <section className="container mb-[60px] lg:mb-[100px]">
      <div className="flex flex-row items-center justify-between mb-[20px] md:mb-[32px]">
        <h2 className="text-[22px] text-[#0F171F] md:text-[32px]">Historia BSN</h2>
        <Link href="/estadisticas?vista=historico" className={`shrink-0 ${cls.textLink} ${cls.focus}`}>
          Explorar el archivo →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {legend ? (
          <div className="lg:col-span-7">
            <LegendCard player={legend} color={lastFranchise?.colors.primary ?? null} ptsRank={legendRank} reason={legendReasonLine} />
          </div>
        ) : null}
        {rows.length ? (
          <div className={legend ? 'lg:col-span-5' : 'lg:col-span-12'}>
            <AnniversariesCard rows={rows} />
          </div>
        ) : null}
        {facts.length ? (
          <div className="lg:col-span-12">
            <NumberTiles facts={facts} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
