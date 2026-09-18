import Link from 'next/link';
import { getPlayerIndex } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
import { shortName } from '@/archivo/lib/names';
import { cls } from '@/archivo/lib/tokens';
import { CURRENT_SEASON } from '@/historia/lib/data';
import { recordsWatch, TOP_N, type StatWatch } from '@/historia/lib/records-watch';

const UNIT: Record<StatWatch['stat'], { label: string; unit: string }> = {
  pts: { label: 'histórico en puntos', unit: 'puntos' },
  g: { label: 'histórico en juegos', unit: 'juegos' },
};

type Props = {
  /** Archive id of an active player; the card reads only the archive index, never the live totals. */
  playerId: string;
};

function Row({ watch }: { watch: StatWatch }) {
  const { label, unit } = UNIT[watch.stat];
  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] py-[14px] md:gap-x-[18px]">
      <span className={`w-[64px] shrink-0 text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmtInt(watch.rank)}</span>
      <div className="min-w-0 flex-1">
        <p className={`font-barlow text-[15px] font-semibold leading-[1.3] text-[#0F171F] ${cls.tabular}`}>
          Puesto {fmtInt(watch.rank)} {label}
        </p>
        <p className={`mt-[2px] ${cls.meta} ${cls.tabular}`}>
          {fmtInt(watch.value)} {unit} en el archivo
        </p>
      </div>
      {watch.above ? (
        <p className={`w-full pl-[78px] font-barlow text-[14px] font-medium leading-[1.35] text-[rgba(0,0,0,0.65)] md:w-auto md:pl-0 md:text-right ${cls.tabular}`}>
          A {fmtInt(watch.above.diff)} de{' '}
          <Link href={`/jugadores/${watch.above.slug}`} className={`text-[#0F171F] ${cls.dataLink} ${cls.focus} rounded-[3px]`} title={watch.above.name}>
            {shortName(watch.above.name)}
          </Link>{' '}
          (#{fmtInt(watch.above.rank)})
        </p>
      ) : (
        <p className="w-full pl-[78px] font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.65)] md:w-auto md:pl-0">Líder histórico</p>
      )}
    </div>
  );
}

/**
 * Where an active player sits in the all-time lists of the archive: rank in points, the player right above
 * and, from outside the top 50, the distance to it. Games follow the same shape when the index has them.
 */
export default function RecordsWatch({ playerId }: Props) {
  const watch = recordsWatch(getPlayerIndex(), playerId);
  if (!watch) return null;
  const gap = watch.pts.toTopN;

  return (
    <section className="mb-[32px] md:mb-[40px]" aria-labelledby="records-a-la-vista">
      <div className="mb-[16px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
        <h2 id="records-a-la-vista" className="text-[22px] leading-[1.1] text-[#0F171F]">
          Récords a la vista
        </h2>
        <span className={cls.meta}>Serie regular · histórico del BSN</span>
      </div>
      <div className={`${cls.card} divide-y divide-[rgba(0,0,0,0.06)] px-[16px] md:px-[20px]`}>
        <Row watch={watch.pts} />
        {gap !== null ? (
          <div className="flex items-center gap-[14px] py-[14px] md:gap-[18px]">
            <span className={`w-[64px] shrink-0 text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmtInt(gap)}</span>
            <p className={`min-w-0 flex-1 font-barlow text-[15px] font-semibold leading-[1.3] text-[#0F171F] ${cls.tabular}`}>
              A {fmtInt(gap)} puntos del top {TOP_N}
            </p>
          </div>
        ) : null}
        {watch.g ? <Row watch={watch.g} /> : null}
      </div>
      <p className={`mt-[10px] max-w-[68ch] ${cls.note}`}>Puntos de serie regular según el archivo; la temporada {CURRENT_SEASON} se suma al cerrar.</p>
    </section>
  );
}
