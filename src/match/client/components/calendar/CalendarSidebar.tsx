'use client';

import Link from 'next/link';
import moment from 'moment';
import { useMemo, useState } from 'react';

moment.updateLocale('es', {
  months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
});

const WEEKDAY_LABELS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

type Props = {
  selectedDate: moment.Moment;
  onSelectDate: (date: moment.Moment) => void;
  showFullCalendarLink?: boolean;
};

export default function CalendarSidebar({
  selectedDate,
  onSelectDate,
  showFullCalendarLink = false,
}: Props) {
  const [viewMonth, setViewMonth] = useState(selectedDate.clone().startOf('month'));
  const today = moment().startOf('day');

  // Lunes = 1 en moment; obtener inicio de la semana (lunes) que contiene el día 1 del mes
  const startOfGrid = useMemo(() => {
    const first = viewMonth.clone().startOf('month');
    const dow = first.isoWeekday();
    return first.clone().subtract(dow - 1, 'days');
  }, [viewMonth]);

  const gridDays = useMemo(() => {
    const days: moment.Moment[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(startOfGrid.clone().add(i, 'days'));
    }
    return days;
  }, [startOfGrid]);

  const isCurrentMonth = (d: moment.Moment) => d.month() === viewMonth.month();
  const isSelected = (d: moment.Moment) => d.isSame(selectedDate, 'day');
  const isToday = (d: moment.Moment) => d.isSame(today, 'day');

  return (
    <div className="rounded-[12px] border border-[#EAEAEA] bg-white p-4 shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => m.clone().subtract(1, 'month'))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#0F171F] hover:bg-black/5"
          aria-label="Mes anterior"
        >
          <img
            src="/assets/images/icons/calendar/calendar-left.svg"
            alt=""
            className="h-4 w-4"
          />
        </button>
        <span className="font-barlow text-sm font-semibold capitalize text-[#0F171F]">
          {viewMonth.format('MMMM YYYY')}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => m.clone().add(1, 'month'))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#0F171F] hover:bg-black/5"
          aria-label="Mes siguiente"
        >
          <img
            src="/assets/images/icons/calendar/calendar-right.svg"
            alt=""
            className="h-4 w-4"
          />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="font-barlow py-1 text-[11px] font-semibold text-[#717171]"
          >
            {label}
          </div>
        ))}
        {gridDays.map((day) => {
          const inMonth = isCurrentMonth(day);
          const selected = isSelected(day);
          const isTodayCell = isToday(day);
          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              onClick={() => onSelectDate(day.clone().startOf('day'))}
              className={`
                font-barlow flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                ${!inMonth ? 'text-[#B0B0B0]' : 'text-[#0F171F]'}
                ${selected ? 'bg-[#0F171F] text-white' : 'hover:bg-black/5'}
                ${isTodayCell && !selected ? 'ring-1 ring-[#0F171F] ring-offset-1' : ''}
              `}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
      {showFullCalendarLink && (
        <Link
          href="/calendario"
          className="mt-4 block w-full rounded-[12px] border border-[#d9d3d3] bg-[#fcfcfc] py-3 text-center text-[16px] font-normal leading-normal tracking-[0.32px] text-black shadow-[0px_1px_2px_0px_rgba(20,24,31,0.05)] whitespace-nowrap"
        >
          Ver calendario BSN completo
        </Link>
      )}
    </div>
  );
}
