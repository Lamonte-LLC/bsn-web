interface Props {
  /** Renders nothing when false, so the badge disappears without a trace once data is real. */
  show: boolean;
  className?: string;
  label?: string;
}

/** Marks placeholder (FPO) data blocks. Discreet but unmistakable. */
export default function FpoBadge({ show, className = '', label = 'Data de relleno' }: Props) {
  if (!show) return null;
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-[4px] border border-dashed border-[#F59E0B] bg-[rgba(245,158,11,0.10)] px-[7px] py-[2px] font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.7)] ${className}`}
      title="Esta data es un relleno temporero (FPO). No es real."
    >
      <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-[#F59E0B]" />
      FPO · {label}
    </span>
  );
}
