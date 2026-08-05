'use client';

import { useState } from 'react';

export interface TeamComparisonPrintRequest {
  /** Selector de temporada. Hoy llega el providerId, no el nombre visible. */
  season: string;
  /** 2 a 4 equipos, en el orden en que se muestran. */
  teamIds: string[];
  /** Tab activo del panel. */
  tab: 'todos' | 'promedio' | 'tiros' | 'totales' | 'resumen';
}

function onRequestComparisonPdf(
  req: TeamComparisonPrintRequest
): void | Promise<void> {
  // TODO: ticket aparte — genera/abre el PDF imprimible.
  void req;
}

/**
 * Pie del card de comparación: acción secundaria para exportar a PDF.
 * Solo desktop; en móvil no aporta ni margen ni padding, así que el card
 * cierra igual que sin él.
 */
export default function CompareExportPdfFooter({
  season,
  teamIds,
  tab,
}: TeamComparisonPrintRequest) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleClick() {
    setIsGenerating(true);
    try {
      await onRequestComparisonPdf({ season, teamIds, tab });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mt-[25px] hidden justify-center border-t border-[rgba(15,23,31,0.07)] pb-[16px] pt-[14px] lg:flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        aria-busy={isGenerating}
        aria-label="Descargar esta comparación de equipos en PDF"
        className="inline-flex cursor-pointer items-center gap-[7px] border-b border-[rgba(15,23,31,0.22)] pb-px font-barlow text-[13px] font-semibold text-[rgba(15,23,31,0.65)] transition-colors duration-150 hover:border-[rgba(15,23,31,0.45)] hover:text-[#0F171F] active:opacity-45 focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[rgba(15,23,31,0.35)] disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          width="14"
          height="14"
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
        <span>
          {isGenerating ? 'Generando…' : 'Descargar esta comparación en PDF'}
        </span>
      </button>
    </div>
  );
}
