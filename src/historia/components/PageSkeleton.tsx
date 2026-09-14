import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';

type Props = {
  /** Height of the ink band placeholder. */
  band?: 'hero' | 'compare';
  /** Blocks to draw in the white area, top to bottom. */
  blocks?: Array<'card' | 'table' | 'tabs'>;
  /** Pull the first card over the band, as the comparison does. */
  overlap?: boolean;
};

function Block({ kind }: { kind: 'card' | 'table' | 'tabs' }) {
  if (kind === 'tabs') {
    return (
      <div className="flex gap-[8px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[35px] w-[110px] animate-pulse rounded-[100px] bg-gray-200 md:w-[150px]" />
        ))}
      </div>
    );
  }
  const rows = kind === 'table' ? 8 : 4;
  return (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-[18px] py-[18px] md:px-[28px] md:py-[22px]">
      <div className="space-y-[14px]">
        {Array.from({ length: rows }, (_, i) => (
          <ShimmerLine key={i} height={i === 0 ? '22px' : '16px'} />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading state of the history pages, drawn with the same bones as the page it stands in for (ink band,
 * then cards), so nothing jumps when the data arrives. Same ShimmerLine as the rest of the site.
 */
export default function PageSkeleton({ band = 'hero', blocks = ['card', 'table'], overlap = false }: Props) {
  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container">
          {band === 'compare' ? (
            <div className="pb-[76px] pt-[10px] text-center lg:pb-[110px] lg:pt-[26px]">
              <div className="mx-auto h-[30px] w-[240px] animate-pulse rounded-[8px] bg-white/10 lg:h-[42px] lg:w-[360px]" />
              <div className="mx-auto mt-[30px] flex max-w-[980px] items-center justify-center gap-[48px]">
                <div className="h-[62px] w-[62px] animate-pulse rounded-full bg-white/10 lg:h-[96px] lg:w-[96px]" />
                <div className="h-[20px] w-[30px] animate-pulse rounded-[6px] bg-white/10" />
                <div className="h-[62px] w-[62px] animate-pulse rounded-full bg-white/10 lg:h-[96px] lg:w-[96px]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-[16px] pb-[36px] pt-[25px] md:pb-[48px] md:pt-[50px]">
              <div className="h-[125px] w-[125px] shrink-0 animate-pulse rounded-full bg-white/10 md:h-[190px] md:w-[190px]" />
              <div className="flex-1 space-y-[12px]">
                <div className="h-[12px] w-[140px] animate-pulse rounded-[6px] bg-white/10" />
                <div className="h-[28px] w-[60%] animate-pulse rounded-[8px] bg-white/10 md:h-[36px]" />
                <div className="h-[16px] w-[40%] animate-pulse rounded-[6px] bg-white/10" />
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className={`container space-y-[24px] pb-[48px] lg:space-y-[32px] lg:pb-[64px] ${overlap ? '-mt-[62px] lg:-mt-[86px]' : 'pt-[24px] lg:pt-[32px]'}`}>
          <div className={overlap ? 'mx-auto max-w-[900px]' : ''}>
            {blocks.map((b, i) => (
              <div key={i} className={i ? 'mt-[24px] lg:mt-[32px]' : ''}>
                <Block kind={b} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
}
