'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Progressive enhancement for StatsTable: makes headers with `data-sort-key` clickable and reorders the
 * server-rendered rows by their cells' `data-sort-value`. Rows marked `data-pinned` (totals) stay at the bottom.
 * Works without hydration of the rows themselves, so server components can keep rendering the table.
 */
export default function SortableTable({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const table = root.querySelector('table');
    if (!table) return;
    const headers = [...table.querySelectorAll<HTMLTableCellElement>('th[data-sort-key]')];
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const original = [...tbody.rows];
    let current: { index: number; dir: 'asc' | 'desc' } | null = null;

    const paint = () => {
      for (const h of headers) {
        const idx = h.cellIndex;
        const icon = h.querySelector<HTMLElement>('[data-sort-icon]');
        const active = current && current.index === idx;
        h.setAttribute('aria-sort', active ? (current!.dir === 'asc' ? 'ascending' : 'descending') : 'none');
        h.style.color = active ? 'rgba(0,0,0,0.9)' : '';
        if (icon) {
          icon.textContent = active ? (current!.dir === 'asc' ? '↑' : '↓') : '↕';
          icon.style.color = active ? '#E51F1F' : '';
        }
      }
    };

    const apply = () => {
      const rows = current
        ? [...original].sort((a, b) => {
            const ca = a.cells[current!.index];
            const cb = b.cells[current!.index];
            const va = ca?.dataset.sortValue ?? '';
            const vb = cb?.dataset.sortValue ?? '';
            if (va === '' && vb === '') return 0;
            if (va === '') return 1;
            if (vb === '') return -1;
            const numeric = ca?.dataset.sortType === 'n';
            const cmp = numeric ? Number(va) - Number(vb) : va.localeCompare(vb, 'es');
            return current!.dir === 'asc' ? cmp : -cmp;
          })
        : original;
      const pinned = rows.filter((r) => r.hasAttribute('data-pinned'));
      const free = rows.filter((r) => !r.hasAttribute('data-pinned'));
      for (const r of [...free, ...pinned]) tbody.appendChild(r);
      paint();
    };

    const onClick = (e: Event) => {
      const th = e.currentTarget as HTMLTableCellElement;
      const idx = th.cellIndex;
      const numeric = original[0]?.cells[idx]?.dataset.sortType === 'n';
      if (!current || current.index !== idx) current = { index: idx, dir: numeric ? 'desc' : 'asc' };
      else if ((numeric && current.dir === 'desc') || (!numeric && current.dir === 'asc')) current = { index: idx, dir: numeric ? 'asc' : 'desc' };
      else current = null;
      apply();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    };

    for (const h of headers) {
      h.tabIndex = 0;
      h.setAttribute('role', 'button');
      h.addEventListener('click', onClick);
      h.addEventListener('keydown', onKey);
    }
    paint();
    return () => {
      for (const h of headers) {
        h.removeEventListener('click', onClick);
        h.removeEventListener('keydown', onKey);
      }
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
