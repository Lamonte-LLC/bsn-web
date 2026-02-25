'use client';

import { MatchType } from '@/match/types';
import DefaultSlider from '@/shared/client/components/slider/DefaultSlider';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  items: MatchType[];
};

export default function DailyMatchesSlider({ items }: Props) {
  return (
    <DefaultSlider
      data={items}
      render={(item: MatchType) => (
        <div>
          {formatDate(item.startAt, 'HH:mm')}
        </div>
      )}
    />
  );
}
