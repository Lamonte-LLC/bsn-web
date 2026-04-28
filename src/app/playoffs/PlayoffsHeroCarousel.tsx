'use client';

import RecentCalendarSlider from '@/match/client/components/slider/RecentCalendarSlider';
import RecentCalendarDateItem from '@/match/client/components/slider/RecentCalendarDateItem';
import LiveMatchCard from '@/match/client/components/card/LiveMatchCard';
import CompletedMatchCard from '@/match/client/components/card/CompletedMatchCard';
import ScheduledMatchCard from '@/match/client/components/card/ScheduledMatchCard';

// 6 dummy playoff games covering live / past / future, plus date columns.
// Reuses the homepage slider's match card components verbatim.
//
// Card additions (rendered as wrappers around the homepage card so we never
// touch shared components): a small "JN" pill anchored to the card's top
// edge, and a thin footer strip beneath the card with the series round
// label on the left and the series status (e.g. "PON lidera 3-1") on the
// right.

type DateItem = { kind: 'date'; id: string; date: string };

type MatchInfo = {
  gameNumber: number;
  roundLabel: string;     // e.g. "Final Conf B"
  seriesStatus: string;   // e.g. "PON lidera 2-1" or "BAY gana 4-1"
};

type LiveItem = MatchInfo & {
  kind: 'live';
  id: string;
  homeCode: string; homeNickname: string; homeCity: string; homeScore: string;
  visitorCode: string; visitorNickname: string; visitorCity: string; visitorScore: string;
  currentQuarter: string;
  currentTime: string;
  channel: string;
};

type CompletedItem = MatchInfo & {
  kind: 'completed';
  id: string;
  startAt: string;
  homeCode: string; homeNickname: string; homeCity: string; homeScore: string;
  visitorCode: string; visitorNickname: string; visitorCity: string; visitorScore: string;
};

type ScheduledItem = MatchInfo & {
  kind: 'scheduled';
  id: string;
  startAt: string;
  homeCode: string; homeNickname: string; homeCity: string;
  visitorCode: string; visitorNickname: string; visitorCity: string;
  channel: string;
};

type Item = DateItem | LiveItem | CompletedItem | ScheduledItem;

const FIXTURES: Item[] = [
  // ── Past day ──────────────────────────────────────────────────────────────
  { kind: 'date', id: 'd-29mar', date: '2026-03-29T20:00:00' },
  {
    kind: 'completed',
    id: 'pf-c1',
    startAt: '2026-03-29T20:00:00',
    homeCode: 'CAG', homeNickname: 'Criollos', homeCity: 'Caguas', homeScore: '88',
    visitorCode: 'BAY', visitorNickname: 'Vaqueros', visitorCity: 'Bayamón', visitorScore: '95',
    gameNumber: 2,
    roundLabel: 'Cuartos de Final',
    seriesStatus: 'BAY gana 4-1',
  },
  // ── Past day with multiple games ─────────────────────────────────────────
  { kind: 'date', id: 'd-31mar', date: '2026-03-31T20:00:00' },
  {
    kind: 'live',
    id: 'pf-l1',
    homeCode: 'ARE', homeNickname: 'Capitanes', homeCity: 'Arecibo', homeScore: '74',
    visitorCode: 'SCE', visitorNickname: 'Cangrejeros', visitorCity: 'Santurce', visitorScore: '91',
    currentQuarter: '1',
    currentTime: '7:44',
    gameNumber: 3,
    roundLabel: 'Final Conf B',
    seriesStatus: 'SCE lidera 2-1',
    channel: 'YouTube · BSN App',
  },
  {
    kind: 'completed',
    id: 'pf-c2',
    startAt: '2026-03-31T20:00:00',
    homeCode: 'BAY', homeNickname: 'Vaqueros', homeCity: 'Bayamón', homeScore: '105',
    visitorCode: 'QUE', visitorNickname: 'Piratas', visitorCity: 'Quebradillas', visitorScore: '98',
    gameNumber: 3,
    roundLabel: 'Cuartos de Final',
    seriesStatus: 'BAY gana 4-3',
  },
  // ── Today ─────────────────────────────────────────────────────────────────
  { kind: 'date', id: 'd-1abr', date: '2026-04-01T19:30:00' },
  {
    kind: 'scheduled',
    id: 'pf-s1',
    startAt: '2026-04-01T19:30:00',
    homeCode: 'MAN', homeNickname: 'Osos', homeCity: 'Manatí',
    visitorCode: 'CAG', visitorNickname: 'Criollos', visitorCity: 'Caguas',
    gameNumber: 3,
    roundLabel: 'Final Conf A',
    seriesStatus: 'SCE lidera 3-2',
    channel: 'YouTube · BSN App',
  },
  {
    kind: 'live',
    id: 'pf-l2',
    homeCode: 'PON', homeNickname: 'Leones', homeCity: 'Ponce', homeScore: '61',
    visitorCode: 'CAR', visitorNickname: 'Gigantes', visitorCity: 'Carolina', visitorScore: '68',
    currentQuarter: '3',
    currentTime: '4:32',
    gameNumber: 4,
    roundLabel: 'Final Conf A',
    seriesStatus: 'CAR lidera 2-1',
    channel: 'Punto 2 · BSN App',
  },
  // ── Future ────────────────────────────────────────────────────────────────
  { kind: 'date', id: 'd-3abr', date: '2026-04-03T20:00:00' },
  {
    kind: 'scheduled',
    id: 'pf-s2',
    startAt: '2026-04-03T20:00:00',
    homeCode: 'SGE', homeNickname: 'Atléticos', homeCity: 'San Germán',
    visitorCode: 'MAY', visitorNickname: 'Indios', visitorCity: 'Mayagüez',
    gameNumber: 4,
    roundLabel: 'Final Conf B',
    seriesStatus: 'Serie empatada 2-2',
    channel: 'YouTube · BSN App',
  },
];

export default function PlayoffsHeroCarousel() {
  const initial = FIXTURES.findIndex((it) => it.kind === 'live');

  return (
    <div className="playoffs-hero-slider">
    <RecentCalendarSlider
      data={FIXTURES}
      initialSlide={initial >= 0 ? initial : 0}
      keyExtractor={(item: Item) => item.id}
      render={(item: Item) => {
        if (item.kind === 'date') {
          return (
            <div className="px-[5px] playoffs-date-item">
              <RecentCalendarDateItem date={item.date} />
            </div>
          );
        }
        if (item.kind === 'live') {
          return (
            <div className="px-[5px]">
              <LiveMatchCard
                matchProviderId={item.id}
                homeTeam={{ code: item.homeCode, nickname: item.homeNickname, city: item.homeCity, score: item.homeScore }}
                visitorTeam={{ code: item.visitorCode, nickname: item.visitorNickname, city: item.visitorCity, score: item.visitorScore }}
                currentQuarter={item.currentQuarter}
                currentTime={item.currentTime}
                mediaProvider={item.channel}
                status="LIVE"
                gameNumber={item.gameNumber}
                roundLabel={item.roundLabel}
                seriesStatus={item.seriesStatus}
              />
            </div>
          );
        }
        if (item.kind === 'completed') {
          return (
            <div className="px-[5px]">
              <CompletedMatchCard
                matchProviderId={item.id}
                startAt={item.startAt}
                homeTeam={{ code: item.homeCode, nickname: item.homeNickname, city: item.homeCity, score: item.homeScore }}
                visitorTeam={{ code: item.visitorCode, nickname: item.visitorNickname, city: item.visitorCity, score: item.visitorScore }}
                gameNumber={item.gameNumber}
                roundLabel={item.roundLabel}
                seriesStatus={item.seriesStatus}
              />
            </div>
          );
        }
        return (
          <div className="px-[5px]">
            <ScheduledMatchCard
              matchProviderId={item.id}
              startAt={item.startAt}
              homeTeam={{ code: item.homeCode, nickname: item.homeNickname, city: item.homeCity }}
              visitorTeam={{ code: item.visitorCode, nickname: item.visitorNickname, city: item.visitorCity }}
              mediaProvider={item.channel}
              gameNumber={item.gameNumber}
              roundLabel={item.roundLabel}
              seriesStatus={item.seriesStatus}
            />
          </div>
        );
      }}
    />
    </div>
  );
}
