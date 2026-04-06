import { MATCH_DATE_FULL_FORMAT, MATCH_TIME_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  startAt?: string;
  venue?: { name: string };
  channel?: string;
  ticketUrl?: string;
};

export default function MatchInfoCard({
  startAt,
  venue,
  channel,
  ticketUrl,
}: Props) {
  return (
    <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="px-[30px] pt-[24px] flex flex-row justify-between items-center">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Información del juego
          </h3>
        </div>
      </div>
      <div className="px-[30px] py-[24px] space-y-4">
        <ul className="space-y-[14px]">
          <li className="flex flex-row items-center gap-[12px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white border border-[rgba(230,230,230,0.74)]">
              <img
                src="/assets/images/icons/icon-calendar-circle.svg"
                alt=""
                className="h-[18px] w-[18px]"
              />
            </span>
            <p className="font-barlow font-medium text-sm">
              {formatDate(startAt, MATCH_DATE_FULL_FORMAT)}
            </p>
          </li>
          <li className="flex flex-row items-center gap-[12px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white border border-[rgba(230,230,230,0.74)]">
              <img
                src="/assets/images/icons/icon-map-pin-circle.svg"
                alt=""
                className="h-[18px] w-[18px]"
              />
            </span>
            <p className="font-barlow font-medium text-sm">{venue?.name}</p>
          </li>
          <li className="flex flex-row items-center gap-[12px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white border border-[rgba(230,230,230,0.74)]">
              <img
                src="/assets/images/icons/icon-clock-circle.svg"
                alt=""
                className="h-[18px] w-[18px]"
              />
            </span>
            <p className="font-barlow font-medium text-sm">
              {formatDate(startAt, MATCH_TIME_FORMAT)}
            </p>
          </li>
          <li className="flex flex-row items-center gap-[12px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white border border-[rgba(230,230,230,0.74)]">
              <img
                src="/assets/images/icons/icon-tv-circle.svg"
                alt=""
                className="h-[18px] w-[18px]"
              />
            </span>
            <p className="font-barlow font-medium text-sm">{channel}</p>
          </li>
        </ul>
      </div>
      {ticketUrl && ticketUrl.trim() !== '' && ticketUrl !== '#' && (
        <div className="px-[30px] pb-[24px]">
          <a
            href={ticketUrl}
            className="bg-[#FCFCFC] block border border-[#D9D3D3] rounded-[12px] p-[12px] text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-base text-black">Comprar boletos</span>
          </a>
        </div>
      )}
    </div>
  );
}
