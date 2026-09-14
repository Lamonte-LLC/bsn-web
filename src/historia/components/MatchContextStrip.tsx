import FranchiseContextRibbon from './FranchiseContextRibbon';

interface Props {
  homeCode: string;
  visitorCode: string;
  homeName: string;
  visitorName: string;
}

/**
 * Strip on the ink band above the Sportradar match widget (live and finished games), one context ribbon per
 * team. The widget's own header is not React, so this is the only mount point there.
 */
export default function MatchContextStrip({ homeCode, visitorCode, homeName, visitorName }: Props) {
  return (
    <div className="bg-[#0F171F]">
      <div className="container">
        <div className="grid grid-cols-2 gap-[16px] py-[12px] md:py-[14px]">
          <div className="min-w-0">
            <p className="truncate font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] text-white/45">{visitorName}</p>
            <FranchiseContextRibbon code={visitorCode} onDark />
          </div>
          <div className="min-w-0 text-right">
            <p className="truncate font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] text-white/45">{homeName}</p>
            <FranchiseContextRibbon code={homeCode} onDark align="right" />
          </div>
        </div>
      </div>
    </div>
  );
}
