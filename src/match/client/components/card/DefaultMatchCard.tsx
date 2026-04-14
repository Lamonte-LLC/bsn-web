"use client";

import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/shared/client/components/ui";
import MatchCompetitor from "../competitor/MatchCompetitor";
import { getFirstWord } from "@/utils/text";
import { MATCH_DATE_FORMAT } from "@/constants";
import { formatDate } from "@/utils/date-formatter";

const MATCH_STATUS: { [key: string]: string } = {
  DELAYED: 'Demorado',
  LOADED: 'Cargado',
  READY: 'Listo',
  IN_PROGRESS: 'En progreso',
  PERIOD_BREAK: 'Descanso',

  INTERRUPTED: 'Interrumpido',
  CANCELLED: 'Cancelado',
  RESCHEDULED: 'Reprogramado',
  FINISHED: 'Finalizado',
  /** Sportradar/DataCore: juego oficialmente cerrado (también en `providerFixtureStatus`). */
  CONFIRMED: 'Confirmado',
  PROTESTED: 'Protestado',
  COMPLETE: 'Completo',
  DRAFT: 'Borrador',
  BYE: 'Descanso',
  SCHEDULED: 'Programado',
  POSTPONED: 'Pospuesto',
  ABANDONED: 'Abandonado',
  WARMUP: 'Calentamiento',
  PREMATCH: 'Prepartido',
  ANTHEM: 'Himno',
  ONCOURT: 'En cancha',
  STANDBY: 'En espera',
  COUNTDOWN: 'Cuenta regresiva',
  /** Pre-en vivo / en espera: en la UI de partido se trata como tramo “live” (ver `isLiveMatchPageStatus`). */
  PENDING: 'Pendiente',
  /** Synergy/Django; en UI se normaliza a `WARMUP` (ver `normalizeMatchStatus`). */
  WARM_UP: 'Calentamiento',
  ABOUT_TO_START: 'A punto de comenzar',
  ON_PITCH: 'En el campo',
  IF_NEEDED: 'Si es necesario',
};

type Props = {
  matchProviderId?: string;
  startAt: string;
  homeTeam: {
    code: string;
    nickname: string;
    city: string;
  };
  visitorTeam: {
    code: string;
    nickname: string;
    city: string;
  };
  status: string;
};

export default function DefaultMatchCard({
  matchProviderId,
  startAt,
  homeTeam,
  visitorTeam,
  status,
}: Props) {
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
              {MATCH_STATUS[status] || status}
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
                    avatarSize={33}
                  />
                </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-[24px] text-white md:text-[32px]">
                    &nbsp;
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
                    &nbsp;
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-[12px] md:pb-[17px]">
            <div className="glass-match-card-pill border border-[rgba(255,255,255,0.21)] block text-center rounded-[18px] p-[2px] md:p-[5px]">
              <span className="text-sm text-white md:text-[15px]">
                Ver más
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
