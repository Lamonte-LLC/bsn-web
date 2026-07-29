'use client';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { crossRecord, getMeetings, type MeetingFixture } from './meetingsFixture';

type Props = {
  codes: string[];
  /** Alineación del título — 'left' en el layout de 3 equipos. */
  titleAlign?: 'center' | 'left';
};

/** Logo del CMS a 24px desktop / 20px móvil, sin contenedor. */
function ScoreLogo({ code }: { code: string }) {
  return (
    <>
      <span className="lg:hidden">
        <TeamLogoAvatar teamCode={code} size={20} />
      </span>
      <span className="hidden lg:inline-flex">
        <TeamLogoAvatar teamCode={code} size={24} />
      </span>
    </>
  );
}

/**
 * Tarjeta 6b: scoreboard en línea. El ganador va siempre a la izquierda
 * del separador.
 */
function MeetingCard({
  meeting,
  pair,
  serie,
}: {
  meeting: MeetingFixture;
  /** Cruce en el orden de selección: ["BAY", "PON"]. */
  pair: [string, string];
  /** Récord del cruce en la temporada: "3-2". */
  serie: string;
}) {
  return (
    <div className="rounded-[10px] border border-[rgba(15,23,31,0.05)] bg-[#FAFBFC] px-[15px] py-[12px] text-center">
      <div className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.5)]">
        {meeting.date}
        {meeting.note ? ` · ${meeting.note}` : ''}
      </div>
      <div className="mt-[9px] flex items-center justify-center gap-[10px]">
        <ScoreLogo code={meeting.winner} />
        <span className="text-[20px] leading-none tabular-nums text-[#0F171F] lg:text-[24px]">
          {meeting.winnerScore}
        </span>
        <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.35)]">
          —
        </span>
        <span className="text-[20px] leading-none tabular-nums text-[rgba(15,23,31,0.3)] lg:text-[24px]">
          {meeting.loserScore}
        </span>
        <ScoreLogo code={meeting.loser} />
      </div>
      <div className="mt-[9px] font-barlow font-semibold text-[10px] uppercase tracking-[0.8px] text-[rgba(15,23,31,0.45)]">
        {pair[0]} – {pair[1]} · Serie {serie}
      </div>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="rounded-[10px] border border-[rgba(15,23,31,0.05)] bg-[#FAFBFC] px-[15px] py-[18px] text-center">
      <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.5)]">
        No hay datos disponibles.
      </p>
    </div>
  );
}

/** 2 equipos: hasta 5 juegos del cruce en una fila. */
function TwoTeamMeetings({ a, b }: { a: string; b: string }) {
  const meetings = getMeetings(a, b);

  if (meetings.length === 0) {
    return <EmptyCard />;
  }

  const serie = crossRecord(a, b);

  return (
    <div className="grid grid-cols-1 gap-[8px] lg:grid-cols-5 lg:gap-[10px]">
      {meetings.slice(0, 5).map((meeting, index) => (
        <MeetingCard key={index} meeting={meeting} pair={[a, b]} serie={serie} />
      ))}
    </div>
  );
}

/** 3–4 equipos: una tarjeta por cruce con su juego más reciente. */
function CrossMeetings({ codes }: { codes: string[] }) {
  const pairs: [string, string][] = [];
  for (let i = 0; i < codes.length; i += 1) {
    for (let j = i + 1; j < codes.length; j += 1) {
      pairs.push([codes[i], codes[j]]);
    }
  }

  const withData = pairs.filter(([a, b]) => getMeetings(a, b).length > 0);

  if (withData.length === 0) {
    return <EmptyCard />;
  }

  return (
    <div className="grid grid-cols-1 gap-[8px] lg:grid-cols-3 lg:gap-[12px]">
      {withData.map(([a, b]) => (
        <MeetingCard
          key={`${a}-${b}`}
          meeting={getMeetings(a, b)[0]}
          pair={[a, b]}
          serie={crossRecord(a, b)}
        />
      ))}
    </div>
  );
}

export default function CompareRecentMeetings({
  codes,
  titleAlign = 'center',
}: Props) {
  const isPair = codes.length === 2;

  return (
    <div>
      {/* Mismo estilo de título que las demás categorías (Promedio, etc.) */}
      <div className="flex items-center gap-[12px] pb-[10px] pt-[16px] lg:gap-[14px] lg:pb-[12px] lg:pt-[26px]">
        {titleAlign === 'center' && (
          <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" />
        )}
        <span className="text-[17px] tracking-[0.3px] text-[#0F171F] lg:text-[20px]">
          {isPair ? 'Últimos encuentros' : 'Últimos encuentros por cruce'}
        </span>
        <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" />
      </div>
      <p className="pb-[8px] text-center font-barlow text-[10px] font-medium text-[rgba(15,23,31,0.35)]">
        Datos de muestra — pendiente de backend
      </p>
      {isPair ? (
        <TwoTeamMeetings a={codes[0]} b={codes[1]} />
      ) : (
        <CrossMeetings codes={codes} />
      )}
    </div>
  );
}
