'use client';

import { formatDate } from '@/utils/date-formatter';

type Props = {
  date: string;
};

export default function RecentCalendarDateItem({ date }: Props) {
  return (
    <div className="bg-[rgba(13,21,29,0.45)] border border-[rgba(150,150,150,0.34)] md:border-[rgba(95,93,93,0.17)] flex justify-center items-center rounded-[12px] w-[46px] h-[165px] md:h-[203px] md:w-[66px]">
      <h3 className="text-base/4 text-[rgba(255,255,255,0.65)] text-center uppercase md:text-[23px]/6">
        {formatDate(date, 'DD')}
        <br />
        {formatDate(date, 'MMM')}
      </h3>
    </div>
  );
}
