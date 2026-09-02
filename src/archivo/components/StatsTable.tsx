import type { ReactNode } from 'react';

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
}

interface Props<Row> {
  columns: StatsColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Rows to visually emphasize (e.g. totals). */
  emphasize?: (row: Row) => boolean;
  emptyMessage?: string;
  caption?: ReactNode;
  className?: string;
}

/**
 * Data table on paper. First column can be sticky; the wrapper scrolls horizontally on narrow screens
 * with a fade on the right edge as the scroll cue. Numeric cells use tabular figures. Nulls must be
 * rendered by callers as a dash (see lib/format.ts), never as zero.
 */
export default function StatsTable<Row>({ columns, rows, rowKey, emphasize, emptyMessage = 'No hay datos disponibles.', caption, className = '' }: Props<Row>) {
  if (!rows.length) {
    return <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">{emptyMessage}</p>;
  }
  return (
    <div className={`relative ${className}`}>
      <div className="archivo-scroll overflow-x-auto rounded-[12px] border border-[#EAEAEA] bg-white">
        <table className="w-full border-collapse font-barlow text-[13px] text-[rgba(15,23,31,0.9)] [font-variant-numeric:tabular-nums]">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="bg-[#F3F3F3]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.title}
                  style={{ width: c.width }}
                  className={`whitespace-nowrap px-[10px] py-[9px] text-[12px] font-medium uppercase tracking-[0.3px] text-[rgba(0,0,0,0.6)] ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  } ${c.sticky ? 'sticky left-0 z-10 bg-[#F3F3F3] shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)]' : ''}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const strong = emphasize?.(row) ?? false;
              return (
                <tr key={rowKey(row)} className={`border-t border-[rgba(0,0,0,0.07)] ${strong ? 'bg-[#ECECEC] font-semibold' : 'odd:bg-white even:bg-[#FCFCFC]'}`}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`whitespace-nowrap px-[10px] py-[8px] ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'} ${
                        c.sticky ? `sticky left-0 z-10 shadow-[inset_-1px_0_0_rgba(0,0,0,0.088)] ${strong ? 'bg-[#ECECEC]' : 'bg-inherit'}` : ''
                      }`}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[28px] rounded-r-[12px] bg-gradient-to-l from-white to-transparent md:hidden" />
    </div>
  );
}
