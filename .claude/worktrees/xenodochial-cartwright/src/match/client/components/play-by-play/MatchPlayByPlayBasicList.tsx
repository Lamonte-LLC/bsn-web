import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

type ExtraInfo = {
  label: string;
  value: string;
};

type Event = {
  id: string;
  time: string;
  title: string;
  description: string;
  team: {
    code: string;
  };
  highlight?: boolean;
  extraInfo?: ExtraInfo[];
};

type Props = {
  data: Event[];
};

export default function MatchPlayByPlayBasicList({ data }: Props) {
  return (
    <div className="divide-y divide-[rgba(0,0,0,0.07)]">
      {data.map((event) => (
        <div
          key={event.id}
          className="flex flex-row gap-[14px] items-center py-2 md:gap-[20px]"
        >
          <div className="w-[36px]">
            <p className="font-barlow font-medium text-[13px] text-[rgba(0,0,0,0.7)]">
              {event.time}
            </p>
          </div>
          <div className="w-[30px]">
            <TeamLogoAvatar teamCode={event.team.code} size={24} />
          </div>
          <div className="grow">
            <h4
              className="font-barlow font-medium text-sm text-[rgba(15,23,31,0.9)]"
              style={{ fontWeight: event.highlight ? '700' : '500' }}
            >
              {event.title}
            </h4>
            <p className="font-barlow text-xs text-[rgba(0,0,0,0.7)]">
              {event.description}
            </p>
          </div>
          {event.extraInfo?.map((info) => (
            <div key={info.label} className="w-[24px] text-center">
              <p className="text-sm text-[rgba(0,0,0,0.7)]">{info.value}</p>
              <p className="font-barlow font-medium text-[10px] text-[rgba(0,0,0,0.5)]">
                {info.label}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
