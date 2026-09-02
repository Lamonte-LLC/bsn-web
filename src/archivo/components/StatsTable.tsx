import type { ReactNode } from 'react';
import SortableTable from './SortableTable';

export interface StatsColumn<Row> {
  key: string;
  label: ReactNode;
  /** Sticky left column (only the first column should set this). */
  sticky?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  render: (row: Row) => ReactNode;
  /** Title attribute for abbreviated headers. */
  title?: string;
  /** Value used to sort by this column. Omit to make the column unsortable. Null sorts last. */
  sortValue?: (row: Row) => number | string | null;
}

interface Props<Row> {
  columns: StatsColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Rows to visually emphasize (e.g. totals). They are pinned to the bottom when sorting. */
  emphasize?: (row: Row) => boolean;
  emptyMessage?: string;
  caption?: ReactNode;
  /** Cap the height so the header stays visible while the body scrolls. Use for long tables. */
  maxHeight?: string;
  className?: string;
}

/**
 * Stats table on paper. The first column can stick to the left while the rest scrolls horizontally, with a fade
 * as the scroll cue; the header sticks to the top of the scroll area. Columns with `sortValue` become sortable
 * (progressively enhanced by SortableTable, so the server-rendered markup is already complete). Numerals use
 * tabular figures. Callers render nulls as a dash via lib/format, never as zero.
 */
export default function StatsTable<Row>({ columns, rows, rowKey, emphasize, emptyMessage = 'No hay datos disponibles.', caption, maxHeight, className = '' }: Props<Row>) {
  if (!rows.length) {
    return <p className="font-barlow text-[15px] text-[rgba(0,0,0,0.6)]">{emptyMessage}</p>;
  }
  const sortable = columns.some((c) => c.sortValue);
  const table = (
    <div className={`relative ${className}`}>
      <div className="archivo-scroll overflow-auto rounded-[12px] border border-[#EAEAEA] bg-white" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full border-collapse font-barlow text-[13px] text-[rgba(15,23,31,0.9)] [font-variant-numeric:tabular-nums] md:text-[14px]">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#F3F3F3]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.title}
                  style={{ width: c.width }}
                  data-sort-key={c.sortValue ? c.key : undefined}
                  aria-sort={c.sortValue ? 'none' : undefined}
                  className={`whitespace-nowrap px-[10px] py-[10px] text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)] ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  } ${c.sticky ? 'sticky left-0 z-30 bg-[#F3F3F3] shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)]' : 'bg-[#F3F3F3]'} ${c.sortValue ? 'cursor-pointer select-none hover:text-[rgba(0,0,0,0.9)]' : ''}`}
                >
                  <span className="inline-flex items-center gap-[4px]">
                    {c.label}
                    {c.sortValue ? <span aria-hidden data-sort-icon className="inline-block w-[8px] text-[10px] text-[rgba(0,0,0,0.35)]">↕</span> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const strong = emphasize?.(row) ?? false;
              return (
                <tr
                  key={rowKey(row)}
                  data-pinned={strong ? '' : undefined}
                  className={`border-t border-[rgba(0,0,0,0.07)] ${strong ? 'bg-[#ECECEC] font-semibold' : 'odd:bg-white even:bg-[#FCFCFC]'}`}
                >
                  {columns.map((c) => {
                    const sv = c.sortValue ? c.sortValue(row) : undefined;
                    return (
                      <td
                        key={c.key}
                        data-sort-value={sv === undefined ? undefined : sv === null ? '' : String(sv)}
                        data-sort-type={sv === undefined ? undefined : typeof sv === 'number' ? 'n' : 's'}
                        className={`h-[44px] whitespace-nowrap px-[10px] py-[6px] md:h-[40px] ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'} ${
                          c.sticky ? `sticky left-0 z-10 shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)] ${strong ? 'bg-[#ECECEC]' : 'bg-inherit'}` : ''
                        }`}
                      >
                        {c.render(row)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[28px] rounded-r-[12px] bg-gradient-to-l from-white to-transparent md:hidden" />
    </div>
  );
  return sortable ? <SortableTable>{table}</SortableTable> : table;
}
