interface Props {
  /** Renders nothing when false, so the badge disappears without leaving a gap once the data is real. */
  show: boolean;
  className?: string;
  /** Kept for callers that describe the block; the badge itself only says FPO. */
  label?: string;
}

/** Marks placeholder (FPO) blocks: dashed amber, discreet but unmistakable. It never colors the data itself. */
export default function FpoBadge({ show, className = '', label }: Props) {
  if (!show) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[5px] border border-dashed border-[#D9A62E] px-[7px] py-[2px] font-barlow text-[9px] font-bold leading-[1.2] tracking-[1px] text-[#9A7712] ${className}`}
      title={`${label ? `${label}: ` : ''}data de relleno (FPO), no es real.`}
    >
      FPO
    </span>
  );
}
