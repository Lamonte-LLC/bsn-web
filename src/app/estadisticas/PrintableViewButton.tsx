'use client';

import { useState } from 'react';
import type { EstadisticasTab } from './useEstadisticasTab';

/** El scope sale del tab de nuestra banda, no del widget de Sportradar. */
export type EstadisticasScope = EstadisticasTab;

export interface PrintableViewRequest {
  scope: EstadisticasScope; // tab activo de la banda
  tab: string; // pill activo del widget: 'promedio' | 'totales' | 'resumen'
  phase: string; // valor del select de fases
}

function onRequestPrintableView(
  req: PrintableViewRequest
): void | Promise<void> {
  // TODO: ticket aparte — genera/abre el PDF imprimible.
  void req;
}

export default function PrintableViewButton({
  scope,
}: {
  scope: EstadisticasScope;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleClick() {
    setIsGenerating(true);
    try {
      // TODO: el widget de Sportradar no expone su pill activo ni el select de
      // fases por una API pública, y no scrapeamos su DOM. Defaults hasta que
      // resolvamos cómo leerlos de forma soportada.
      await onRequestPrintableView({ scope, tab: 'promedio', phase: 'todas' });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isGenerating}
      aria-busy={isGenerating}
      aria-label="Descargar la versión imprimible en PDF de la vista actual"
      className="inline-flex cursor-pointer items-center gap-[7px] rounded-full border border-white/40 bg-white/6 px-[13px] py-[6px] font-barlow text-[11.5px] font-semibold whitespace-nowrap text-white transition-colors duration-150 hover:border-white/22 hover:bg-transparent hover:text-white/85 active:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:pointer-events-none disabled:opacity-50"
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
      <span>{isGenerating ? 'Generando…' : 'Imprimir / PDF'}</span>
    </button>
  );
}
