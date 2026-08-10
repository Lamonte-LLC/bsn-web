import Link from 'next/link';
import type { EstadisticasTab } from './useEstadisticasTab';

/** El scope sale del tab de nuestra banda, no del widget de Sportradar. */
export type EstadisticasScope = EstadisticasTab;

const EXPORT_HREF: Record<EstadisticasScope, string> = {
  jugadores: '/estadisticas/jugadores/exportar/pdf',
  equipos: '/estadisticas/equipos/exportar/pdf',
};

export default function PrintableViewButton({
  scope,
}: {
  scope: EstadisticasScope;
}) {
  return (
    <Link
      href={EXPORT_HREF[scope]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Descargar la versión imprimible en PDF de la vista actual"
      className="inline-flex cursor-pointer items-center gap-[7px] rounded-full border border-white/40 bg-white/6 px-[13px] py-[6px] font-barlow text-[11.5px] font-semibold whitespace-nowrap text-white transition-colors duration-150 hover:border-white/22 hover:bg-transparent hover:text-white/85 active:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M4.5 6V2.5h7V6" />
        <rect x="2.5" y="6" width="11" height="5" />
        <path d="M4.5 9.5h7v4h-7z" />
      </svg>
      <span>Imprimir / PDF</span>
    </Link>
  );
}
