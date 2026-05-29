'use client';

import RecentCalendarSlider from '@/match/client/components/slider/RecentCalendarSlider';
import RecentCalendarDateItem from '@/match/client/components/slider/RecentCalendarDateItem';
import LiveMatchCard from '@/match/client/components/card/LiveMatchCard';
import CompletedMatchCard from '@/match/client/components/card/CompletedMatchCard';
import ScheduledMatchCard from '@/match/client/components/card/ScheduledMatchCard';
import { usePlayoffsMatches, type PlayoffMatch, type PlayoffSeriesCompetitor } from '@/playoffs/hooks/usePlayoffsMatches';

// ── Item types ─────────────────────────────────────────────────────────────────

type DateItem = { kind: 'date'; id: string; date: string };

type MatchInfo = {
  gameNumber: number;
  roundLabel: string;
  seriesStatus: string;
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

// ── Mapping helpers ────────────────────────────────────────────────────────────

function buildRoundLabel(name: string, group: string | null): string {
  return group ? `${name} - ${group}` : name;
}

function buildSeriesStatus(competitors: PlayoffSeriesCompetitor[]): string {
  if (competitors.length < 2) return '';
  const [c1, c2] = competitors;
  if (c1.won === c2.won) return `Serie empata a ${c1.won}`;
  const winner = c1.won > c2.won ? c1 : c2;
  const loser = c1.won > c2.won ? c2 : c1;
  return `${winner.team.code} lidera ${winner.won}-${loser.won}`;
}

function toItems(matches: PlayoffMatch[]): Item[] {
  const sorted = [...matches].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const items: Item[] = [];
  let lastDate = '';

  for (const match of sorted) {
    const dateKey = match.startAt.slice(0, 10);
    if (dateKey !== lastDate) {
      items.push({ kind: 'date', id: `d-${dateKey}`, date: match.startAt });
      lastDate = dateKey;
    }

    const id = match.providerId;
    const roundLabel = buildRoundLabel(match.series?.name ?? '', match.series?.group ?? null);
    const seriesStatus = buildSeriesStatus(match.series?.competitors ?? []);
    const info: MatchInfo = { gameNumber: match.gameNumber, roundLabel, seriesStatus };

    if (match.status === 'IN_PROGRESS') {
      items.push({
        ...info,
        kind: 'live',
        id,
        homeCode: match.homeTeam.code,
        homeNickname: match.homeTeam.nickname,
        homeCity: match.homeTeam.city,
        homeScore: match.homeTeam.score,
        visitorCode: match.visitorTeam.code,
        visitorNickname: match.visitorTeam.nickname,
        visitorCity: match.visitorTeam.city,
        visitorScore: match.visitorTeam.score,
        currentQuarter: '',
        currentTime: '',
        channel: '',
      });
    } else if (match.status === 'COMPLETED' || match.status === 'FINISHED') {
      items.push({
        ...info,
        kind: 'completed',
        id,
        startAt: match.startAt,
        homeCode: match.homeTeam.code,
        homeNickname: match.homeTeam.nickname,
        homeCity: match.homeTeam.city,
        homeScore: match.homeTeam.score,
        visitorCode: match.visitorTeam.code,
        visitorNickname: match.visitorTeam.nickname,
        visitorCity: match.visitorTeam.city,
        visitorScore: match.visitorTeam.score,
      });
    } else {
      items.push({
        ...info,
        kind: 'scheduled',
        id,
        startAt: match.startAt,
        homeCode: match.homeTeam.code,
        homeNickname: match.homeTeam.nickname,
        homeCity: match.homeTeam.city,
        visitorCode: match.visitorTeam.code,
        visitorNickname: match.visitorTeam.nickname,
        visitorCity: match.visitorTeam.city,
        channel: '',
      });
    }
  }

  return items;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlayoffsHeroCarousel() {
  const { matches, loading } = usePlayoffsMatches();

  if (loading && matches.length === 0) return null;

  const items = toItems(matches);
  const initial = items.findIndex((it) => it.kind === 'live');

  return (
    <div className="playoffs-hero-slider">
      <RecentCalendarSlider
        data={items}
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
