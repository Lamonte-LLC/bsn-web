import type { ReactNode } from 'react';
import { DASH } from '../lib/format';
import { cls } from '../lib/tokens';
import Scrollable from './Scrollable';
import SortableTable from './SortableTable';
import { EmptyState, Skeleton } from './ui';

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
  /** The protagonist stat of the table (PPJ): rendered in 600. */
  strong?: boolean;
  /** Mark this column as sorted on first paint (the rows must already come in that order). */
  initialSort?: 'asc' | 'desc';
}

interface Props<Row> {
  columns: StatsColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Rows to render as totals: heavier, separated by a stronger hairline, pinned to the bottom when sorting. */
  emphasize?: (row: Row) => boolean;
  emptyMessage?: string;
  emptyHref?: string;
  emptyLinkLabel?: string;
  caption?: ReactNode;
  /** Cap the height so the header stays visible while the body scrolls. Use for long tables. */
  maxHeight?: string;
  /** Subtle zebra for long tables. Defaults to on when there are more than 12 rows. */
  zebra?: boolean;
  /** Footnote rendered inside the card, under the table (era notes, sources). */
  footnote?: ReactNode;
  className?: string;
}

const CELL_X = 'px-[10px] first:pl-[16px] last:pr-[16px] md:first:pl-[24px] md:last:pr-[24px]';

/**
 * Stats table on paper: the most important component of the archive. Header in small caps at 45% with the sorted
 * column in full ink and a red arrow; 44px rows with 6% hairlines; Barlow 14 tabular cells with the protagonist
 * stat in 600; nulls as a quiet dash; totals in 700 above a stronger hairline. On mobile the first column sticks
 * with a vertical divider and the rest scrolls with an honest overflow hint. Sorting is progressively enhanced.
 */
export default function StatsTable<Row>({ columns, rows, rowKey, emphasize, emptyMessage = 'No hay datos disponibles.', emptyHref, emptyLinkLabel, caption, maxHeight, zebra, footnote, className = '' }: Props<Row>) {
  if (!rows.length) {
    return (
      <EmptyState href={emptyHref} linkLabel={emptyLinkLabel} className={className}>
        {emptyMessage}
      </EmptyState>
    );
  }
  const sortable = columns.some((c) => c.sortValue);
  const striped = zebra ?? rows.length > 12;
  const align = (c: StatsColumn<Row>) => (c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left');

  const table = (
    <div className={`${cls.card} overflow-hidden ${className}`}>
      <Scrollable maxHeight={maxHeight}>
        <table className={`w-full border-collapse font-barlow text-[13.5px] text-[#0F171F] md:text-[14px] ${cls.tabular}`}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="sticky top-0 z-20 bg-white">
            <tr className="shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.title}
                  style={{ width: c.width }}
                  data-sort-key={c.sortValue ? c.key : undefined}
                  data-sort-initial={c.initialSort}
                  aria-sort={c.sortValue ? (c.initialSort ? (c.initialSort === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  className={`group h-[36px] whitespace-nowrap bg-white pb-[9px] pt-[10px] align-bottom text-[10.5px] font-semibold uppercase tracking-[0.8px] text-[rgba(0,0,0,0.45)] md:text-[11px] ${CELL_X} ${align(c)} ${
                    c.sticky ? 'sticky left-0 z-30 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.12)] md:shadow-none' : ''
                  } ${c.sortValue ? `cursor-pointer select-none transition-colors duration-150 hover:text-[rgba(0,0,0,0.75)] data-sorted:text-[#0F171F] ${cls.focus}` : ''}`}
                >
                  <span className="inline-flex items-center gap-[4px]">
                    {c.label}
                    {c.sortValue ? <span aria-hidden data-sort-icon className="inline-block min-w-[8px] text-[11px] text-[#E51F1F]">{c.initialSort ? (c.initialSort === 'asc' ? '↑' : '↓') : ''}</span> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const total = emphasize?.(row) ?? false;
              const rowBg = total ? 'bg-white' : striped && ri % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white';
              return (
                <tr
                  key={rowKey(row)}
                  data-pinned={total ? '' : undefined}
                  className={`${rowBg} ${total ? 'shadow-[inset_0_1px_0_rgba(0,0,0,0.14)] font-bold' : 'border-b border-[rgba(0,0,0,0.06)]'}`}
                >
                  {columns.map((c) => {
                    const sv = c.sortValue ? c.sortValue(row) : undefined;
                    const out = c.render(row);
                    const isNull = out === DASH;
                    return (
                      <td
                        key={c.key}
                        data-sort-value={sv === undefined ? undefined : sv === null ? '' : String(sv)}
                        data-sort-type={sv === undefined ? undefined : typeof sv === 'number' ? 'n' : 's'}
                        className={`h-[44px] whitespace-nowrap py-0 ${CELL_X} ${align(c)} ${c.sticky ? `sticky left-0 z-10 ${rowBg} shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] md:shadow-none` : ''} ${
                          isNull ? 'font-normal text-[rgba(0,0,0,0.35)]' : c.strong && !total ? 'font-semibold' : ''
                        }`}
                      >
                        {out}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Scrollable>
      {footnote ? <div className={`border-t border-[rgba(0,0,0,0.06)] px-[16px] pb-[14px] pt-[12px] md:px-[24px] ${cls.note}`}>{footnote}</div> : null}
    </div>
  );
  return sortable ? <SortableTable>{table}</SortableTable> : table;
}

/** Loading state that keeps the table's footprint. */
export function StatsTableSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`${cls.card} p-[16px] ${className}`}>
      <Skeleton rows={rows} />
    </div>
  );
}
