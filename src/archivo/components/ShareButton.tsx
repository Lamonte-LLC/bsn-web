'use client';

import { useEffect, useState } from 'react';

/** Copies the current URL. Falls back to the Web Share sheet on devices that have one and no clipboard. */
export default function ShareButton({ label = 'Compartir', className = '' }: { label?: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const onClick = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else if (navigator.share) await navigator.share({ url });
      else throw new Error('no clipboard');
      setState('copied');
    } catch {
      setState('error');
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={`inline-flex h-[36px] items-center gap-[6px] rounded-[100px] border border-[#D5D5D5] bg-white px-[14px] text-[15px] text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F171F] ${className}`}
    >
      {state === 'copied' ? 'Enlace copiado' : state === 'error' ? 'No se pudo copiar' : label}
    </button>
  );
}
