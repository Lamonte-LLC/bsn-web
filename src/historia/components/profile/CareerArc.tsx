import CareerArcChart from '@/archivo/components/CareerArcChart';
import { getCareerArc, getFranchises } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { cls, INK } from '@/archivo/lib/tokens';
import { CURRENT_SEASON } from '@/historia/lib/data';

const MIN_SEASONS = 3;

type Props = {
  playerId: string;
  name: string;
  /** Primary color of the main franchise; ink when unknown. Goes to the line, never to text. */
  color: string | null;
  isActive: boolean;
};

/**
 * Season-by-season averages of the regular season as one line (CareerArcChart, the archive's only chart).
 * The chart carries its own stat pills and calendar toggle; its inner container title is hidden because the
 * section title already names it. Careers under three seasons render nothing, as the chart itself would.
 */
export default function CareerArc({ playerId, name, color, isActive }: Props) {
  const arc = getCareerArc(playerId);
  if (!arc || arc.arc.length < MIN_SEASONS) return null;
  const franchises = franchiseViewMap(getFranchises());
  const missingCurrent = isActive && !arc.arc.some((p) => p.year === CURRENT_SEASON);

  return (
    <section className="mb-[32px] md:mb-[40px]" aria-labelledby="arco-de-carrera">
      <div className="mb-[4px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
        <h2 id="arco-de-carrera" className="text-[22px] leading-[1.1] text-[#0F171F]">
          Arco de carrera
        </h2>
        <span className={cls.meta}>Promedio por temporada · serie regular</span>
      </div>
      <CareerArcChart players={[{ id: playerId, name, color: color ?? INK, arc: arc.arc, peakSeason: arc.peakSeason }]} franchises={franchises} className="[&>h3]:hidden" />
      {missingCurrent ? <p className={`mt-[6px] max-w-[68ch] ${cls.note}`}>La temporada {CURRENT_SEASON} se añade al cerrar la serie regular.</p> : null}
    </section>
  );
}
