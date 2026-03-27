"use client";

import { useMemo } from "react";
import Link from "next/link";
import cx from "classnames";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/shared/client/components/ui";
import MatchCompetitor from "../competitor/MatchCompetitor";
import { getFirstWord } from "@/utils/text";
import { MATCH_DATE_FORMAT } from "@/constants";
import { formatDate } from "@/utils/date-formatter";

type Props = {
  matchProviderId?: string;
  startAt: string;
  homeTeam: {
    code: string;
    nickname: string;
    city: string;
    score: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  visitorTeam: {
    code: string;
    nickname: string;
    city: string;
    score: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  overtimePeriods?: number;
  isFinals?: boolean;
  finalsDescription?: string;
};

export default function CompletedMatchCard({
  matchProviderId,
  startAt,
  homeTeam,
  visitorTeam,
  overtimePeriods = 0,
  isFinals = false,
  finalsDescription = "",
}: Props) {
  const isHomeTeamWinner = useMemo(
    () => parseInt(homeTeam.score) > parseInt(visitorTeam.score),
    [homeTeam, visitorTeam],
  );

  const href = `/partidos/${matchProviderId}`;

  return (
    <Link
      href={href}
      className="block w-[220px] md:w-[308px] cursor-pointer rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F171F]"
    >
      <Card className="w-full h-full">
        <CardHeader className="border-b border-b-[rgba(255,255,255,0.05)] mx-[15px] py-[8px] md:mx-[20px]">
          <div className="flex flex-row justify-between items-center">
            <p className="font-barlow-condensed font-semibold text-sm leading-[22px] text-[rgba(255,255,255,0.9)] md:text-[15px] md:leading-[24px]">
              Final {overtimePeriods > 0 ? `${overtimePeriods}OT` : ""}
            </p>
            <p className="font-barlow font-medium text-[13px] text-[rgba(255,255,255,0.8)] md:text-sm">
              {formatDate(startAt, MATCH_DATE_FORMAT)}
            </p>
          </div>
        </CardHeader>
        <CardBody className="pt-[3px]">
          <div className="flex flex-row justify-between items-center mb-[7px]">
            <div className="flex flex-1 flex-col">
              <div className="flex flex-row justify-between items-center gap-3">
                <div className="flex-1">
                  <MatchCompetitor
                    code={visitorTeam.code}
                    name={getFirstWord(visitorTeam.nickname)}
                    city={visitorTeam.city}
                    disabled={isHomeTeamWinner}
                    avatarSize={33}
                  />
                </div>
                <div
                  className={cx("flex flex-row items-center gap-2", {
                    "pr-[15px]": isHomeTeamWinner,
                  })}
                >
                  <p
                    className="text-[24px] text-white md:text-[32px]"
                    style={{
                      color: isHomeTeamWinner
                        ? "rgba(255, 255, 255, 0.5)"
                        : "#ffffff",
                    }}
                  >
                    {visitorTeam.score}
                  </p>
                  {!isHomeTeamWinner && (
                    <img
                      src="/assets/images/icons/icon-caret-winner.png"
                      style={{ width: 7, height: 9 }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between items-center gap-3">
                <div className="flex-1">
                  <MatchCompetitor
                    code={homeTeam.code}
                    name={getFirstWord(homeTeam.nickname)}
                    city={homeTeam.city}
                    disabled={!isHomeTeamWinner}
                    avatarSize={33}
                  />
                </div>
                <div
                  className={cx("flex flex-row items-center gap-2", {
                    "pr-[15px]": !isHomeTeamWinner,
                  })}
                >
                  <p
                    className="text-[24px] text-white md:text-[32px]"
                    style={{
                      color: !isHomeTeamWinner
                        ? "rgba(255, 255, 255, 0.5)"
                        : "#ffffff",
                    }}
                  >
                    {homeTeam.score}
                  </p>
                  {isHomeTeamWinner && (
                    <img
                      src="/assets/images/icons/icon-caret-winner.png"
                      style={{ width: 7, height: 9 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pb-[12px] md:pb-[17px]">
            <div
              className="bg-[rgba(15,15,15,0.19)] border border-[rgba(255,255,255,0.21)] block text-center rounded-[18px] p-[2px] md:p-[5px]"
              style={{ backdropFilter: "blur(40px)" }}
            >
              <span className="text-sm text-white md:text-[15px]">
                Ver resultados
              </span>
            </div>
          </div>
        </CardBody>
        {isFinals && (
          <CardFooter>
            <div className="flex flex-row justify-center items-center">
              <p className="font-barlow text-sm text-neutral-90">
                {finalsDescription}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
