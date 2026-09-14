'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui';

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
    <Button variant="secondary" onClick={onClick} aria-live="polite" className={className}>
      {state === 'copied' ? 'Enlace copiado' : state === 'error' ? 'No se pudo copiar' : label}
    </Button>
  );
}
