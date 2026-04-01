'use client';

import Link from 'next/link';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getCalendarLivePrimaryLine } from '@/match/client/utils/calendarView';
import { getFirstWord } from '@/utils/text';

type TeamSlice = {
  code: string;
  nickname: string;
  score: string;
  city: string;
  competitionStandings?: {
    won: number;
    lost: number;
  };
};

type Props = {
  providerId: string;
  homeTeam: TeamSlice;
  visitorTeam: TeamSlice;
  status: string;
  currentQuarter?: string;
  currentTime?: string;
  overtimePeriods?: number;
  /** Para el círculo «en» / «vs» (mismo criterio que ScheduledMatchCardInline). */
  contextTeamCode: string;
};

function recordLabel(team: TeamSlice): string {
  const w = team.competitionStandings?.won ?? 0;
  const l = team.competitionStandings?.lost ?? 0;
  return `${w}-${l}`;
}

export default function CalendarLiveMatchRow({
  providerId,
  homeTeam,
  visitorTeam,
  status,
  currentQuarter,
  currentTime,
  overtimePeriods = 0,
  contextTeamCode,
}: Props) {
  const href = `/partidos/${providerId}`;
  const centerLabel = contextTeamCode === homeTeam.code ? 'vs' : 'en';
  const primary = getCalendarLivePrimaryLine(
    status,
    currentQuarter,
    currentTime,
    overtimePeriods,
  );

  return (
    <Link
      href={href}
      className="block rounded-[12px] border border-[rgba(125,125,125,0.15)] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition hover:bg-[#fafafa]"
    >
      {/* Mobile — Figma 553:35665 / 553:35670 / 553:35645 */}
      <div className="sm:hidden">
        <div className="flex flex-row items-center gap-2 border-b border-b-[rgba(125,125,125,0.1)] mx-[20px] py-[12px]">
          <span
            className="relative inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border-2 border-[#E51F1F] bg-white"
            aria-hidden
          >
            <span className="h-[6px] w-[6px] rounded-full bg-[#E51F1F]" />
          </span>
          <p className="font-barlow font-medium text-[13px] text-[rgba(0,0,0,0.9)]">
            {primary}
          </p>
        </div>
        <div className="flex flex-col gap-[10px] px-[20px] pb-[16px] pt-[12px]">
          <MobileTeamRowLive team={visitorTeam} score={visitorTeam.score ?? '0'} />
          <MobileTeamRowLive team={homeTeam} score={homeTeam.score ?? '0'} />
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-[100px] border border-[#E51F1F] bg-white px-5 py-2.5 font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[#E51F1F] pointer-events-none">
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              aria-hidden
            >
              <path d="M0 0L10 6L0 12V0Z" fill="currentColor" />
            </svg>
            Ver en vivo
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:h-[77px] sm:min-h-[77px] sm:flex-row sm:items-center sm:gap-0 sm:px-5 sm:py-0">
        <div className="flex shrink-0 items-center gap-2 sm:max-w-[160px] sm:pr-2">
          <span
            className="relative inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center"
            aria-hidden
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#E51F1F] shadow-[0_0_0_2px_#fff]" />
          </span>
          <p className="font-special-gothic-condensed-one text-[18px] font-normal leading-normal tracking-[0.18px] text-black sm:truncate">
            {primary}
          </p>
        </div>

        <div
          className="hidden h-[57px] w-px shrink-0 bg-[rgba(125,125,125,0.25)] sm:mx-4 sm:block"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="max-w-[132px] truncate font-special-gothic-condensed-one text-[20px] leading-none text-[#0f171f]">
              {getFirstWord(visitorTeam.nickname)}
            </span>
            <TeamLogoAvatar teamCode={visitorTeam.code} size={30} />
            <span className="font-special-gothic-condensed-one text-[30px] leading-none tracking-[0.3px] text-black tabular-nums">
              {visitorTeam.score ?? '0'}
            </span>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(125,125,125,0.35)] bg-white">
            <span className="font-barlow-condensed text-[16px] leading-[normal] tracking-[0.16px] text-[rgba(15,23,31,0.8)]">
              {centerLabel}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="font-special-gothic-condensed-one text-[30px] leading-none tracking-[0.3px] text-black tabular-nums">
              {homeTeam.score ?? '0'}
            </span>
            <TeamLogoAvatar teamCode={homeTeam.code} size={30} />
            <span className="max-w-[132px] truncate font-special-gothic-condensed-one text-[20px] leading-none text-[#0f171f]">
              {getFirstWord(homeTeam.nickname)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 justify-end sm:pl-3">
          <span className="inline-flex items-center gap-2 rounded-[100px] border border-[#E51F1F] bg-white px-5 py-2.5 font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[#E51F1F] pointer-events-none">
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              aria-hidden
            >
              <path d="M0 0L10 6L0 12V0Z" fill="currentColor" />
            </svg>
            Ver en vivo
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobileTeamRowLive({
  team,
  score,
}: {
  team: TeamSlice;
  score: string;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-[12px]">
        <TeamLogoAvatar teamCode={team.code} size={30} />
        <div className="min-w-0 flex-1">
          <p className="text-base/6 tracking-[2%] text-black">
            {getFirstWord(team.nickname)}&nbsp;&nbsp;
            <span className="font-barlow text-xs text-[#717171]">
              {recordLabel(team)}
            </span>
          </p>
          <p className="font-barlow text-xs text-[#717171]">{team.city}</p>
        </div>
      </div>
      <span className="min-w-[52px] shrink-0 text-right text-[27px] leading-[36px] text-black tabular-nums">
        {score}
      </span>
    </div>
  );
}
