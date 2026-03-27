"use client";

import { useMemo } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/shared/client/components/ui";
import MatchCompetitor from "../competitor/MatchCompetitor";
import animationLiveStreamData from "./live-stream.json";
import { getFirstWord } from "@/utils/text";
import { formatGameClockDisplay } from "@/utils/game-clock";
import { MATCH_STATUS } from "@/constants";

type Props = {
  matchProviderId?: string;
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
  status: string;
  currentQuarter?: string;
  currentTime?: string;
  mediaProvider?: string;
  overtimePeriods?: number;
  isFinals?: boolean;
  finalsDescription?: string;
};

export default function LiveMatchCard({
  matchProviderId,
  homeTeam,
  visitorTeam,
  status,
  currentQuarter = "",
  currentTime = "0:00",
  mediaProvider = "",
  overtimePeriods = 0,
  isFinals = false,
  finalsDescription = "",
}: Props) {
  const currentPeriodTime = useMemo(
    () => formatGameClockDisplay(currentTime),
    [currentTime],
  );

  const currentStatusLabel = useMemo(() => {
    let statusLabel = overtimePeriods > 0 ? "OT" : `Q${currentQuarter}`;
    if (overtimePeriods > 1) {
      statusLabel += `${overtimePeriods}`;
    }
    return statusLabel;
  }, [overtimePeriods, currentQuarter]);

  const lowerMedia = (mediaProvider || "").toLowerCase();
  const hasPunto2 =
    lowerMedia.includes("punto 2") || lowerMedia.includes("punto2");
  const hasYouTube = lowerMedia.includes("youtube");
  const hasTelemundo = lowerMedia.includes("telemundo");

  const statusU = status?.toUpperCase() ?? "";

  const href = `/partidos/${matchProviderId}`;

  return (
    <Link
      href={href}
      className="block w-[220px] md:w-[308px] cursor-pointer rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F171F]"
    >
      <Card className="w-full h-full">
        <CardHeader className="border-b border-b-[rgba(255,255,255,0.05)] mx-[15px] py-[8px] md:mx-[20px]">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row justify-start items-center gap-[7px]">
              <Lottie
                animationData={animationLiveStreamData}
                loop
                autoplay
                style={{ width: "16px", height: "16px" }}
              />
              {![
                MATCH_STATUS.READY,
                MATCH_STATUS.PENDING,
                MATCH_STATUS.DELAYED,
                MATCH_STATUS.PERIOD_BREAK,
                MATCH_STATUS.INTERRUPTED,
                MATCH_STATUS.RESCHEDULED,
              ].includes(statusU) && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  {currentStatusLabel} - {currentPeriodTime}
                </p>
              )}
              {statusU === MATCH_STATUS.READY && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  Por comenzar
                </p>
              )}
              {statusU === MATCH_STATUS.PENDING && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  En espera
                </p>
              )}
              {statusU === MATCH_STATUS.DELAYED && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  Atrasado
                </p>
              )}
              {statusU === MATCH_STATUS.PERIOD_BREAK &&
                overtimePeriods === 0 &&
                currentQuarter === "2" && (
                  <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                    Mediotiempo
                  </p>
                )}
              {statusU === MATCH_STATUS.PERIOD_BREAK &&
                overtimePeriods === 0 &&
                currentQuarter !== "2" && (
                  <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                    Fin de Q{currentQuarter}
                  </p>
                )}
              {statusU === MATCH_STATUS.PERIOD_BREAK && overtimePeriods > 0 && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  Fin de OT{overtimePeriods > 1 ? overtimePeriods : ""}
                </p>
              )}
              {statusU === MATCH_STATUS.INTERRUPTED && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  Interrumpido
                </p>
              )}
              {statusU === MATCH_STATUS.RESCHEDULED && (
                <p className="text-[15px] leading-[22px] text-white md:text-base md:leading-[24px]">
                  Reprogramado
                </p>
              )}
            </div>
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              {hasPunto2 && (
                <span
                  className="inline-flex shrink-0 items-center"
                  style={{ height: 14 }}
                >
                  <img
                    src="/assets/images/icons/channels/punto2.svg"
                    alt="Punto 2"
                    className="max-h-[14px] w-auto object-contain object-center"
                    style={{ height: 14 }}
                  />
                </span>
              )}
              {hasYouTube && (
                <span
                  className="inline-flex shrink-0 items-center"
                  style={{ height: 14 }}
                >
                  <img
                    src="/assets/images/icons/channels/youtube.svg"
                    alt="YouTube"
                    className="max-h-[14px] w-auto object-contain object-center"
                    style={{ height: 14 }}
                  />
                </span>
              )}
              <span
                className="inline-flex shrink-0 items-center"
                style={{ height: 14 }}
              >
                <img
                  src="/assets/images/icons/channels/bsnapp.svg"
                  alt="BSN App"
                  className="max-h-[14px] w-auto object-contain object-center"
                  style={{ height: 14 }}
                />
              </span>
              {hasTelemundo && (
                <span
                  className="inline-flex shrink-0 items-center"
                  style={{ height: 14 }}
                >
                  <img
                    src="/assets/images/icons/channels/telemundo.svg"
                    alt="Telemundo"
                    className="max-h-[14px] w-auto object-contain object-center"
                    style={{ height: 14 }}
                  />
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-[3px]">
          <div className="flex flex-row justify-between items-center mb-[7px]">
            <div className="flex flex-col flex-1">
              <div className="flex flex-row justify-between items-center gap-3">
                <div className="flex-1">
                  <MatchCompetitor
                    code={visitorTeam.code}
                    name={getFirstWord(visitorTeam.nickname)}
                    city={visitorTeam.city}
                    avatarSize={33}
                  />
                </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-[24px] text-white md:text-[32px]">
                    {visitorTeam.score}
                  </p>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center gap-3">
                <div className="flex-1">
                  <MatchCompetitor
                    code={homeTeam.code}
                    name={getFirstWord(homeTeam.nickname)}
                    city={homeTeam.city}
                    avatarSize={33}
                  />
                </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-[24px] text-white md:text-[32px]">
                    {homeTeam.score}
                  </p>
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
                Ver en vivo
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
