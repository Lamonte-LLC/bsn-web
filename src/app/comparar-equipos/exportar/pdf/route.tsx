import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import { getClient } from '@/apollo-client';
import { HEAD_TO_HEAD_TEAM_STATS_EXTENDED } from '@/graphql/stats';
import { SEASON_HEAD_TO_HEAD_MATCHES } from '@/graphql/match';
import { normalizeFileName } from '@/utils/text';

import { SeasonType } from '@/season/types';
import { TeamType, TeamSeasonStatsType, SeasonHeadToHeadMatchType } from '@/team/types';
import HeadToHeadDocument from '@/stats/pdf/HeadToHeadDocument';
import { formatDate } from '@/utils/date-formatter';

export const runtime = 'nodejs';

type HeadToHeadTeamStatsType = {
  season: SeasonType;
  team: TeamType;
  stats: TeamSeasonStatsType;
};

type HeadToHeadTeamStatsResponse = {
  headToHeadTeamStats: HeadToHeadTeamStatsType[];
};

type SeasonHeadToHeadMatchesResponse = {
  seasonHeadToHeadMatchesConnection: {
    edges: { node: SeasonHeadToHeadMatchType }[];
  };
};

const fetchHeadToHead = async (seasonId: string | null, teamCodes: string[] = []) => {
  const { data, error } =
    await getClient().query<HeadToHeadTeamStatsResponse>({
      query: HEAD_TO_HEAD_TEAM_STATS_EXTENDED,
      variables: { seasonProviderId: seasonId, teamCodes },
      fetchPolicy: 'network-only',
    });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.headToHeadTeamStats ?? [];
};

const fetchHeadToHeadMatches = async (seasonId: string | null, teamCodes: string[] = []) => {
  const { data, error } =
    await getClient().query<SeasonHeadToHeadMatchesResponse>({
      query: SEASON_HEAD_TO_HEAD_MATCHES,
      variables: { seasonProviderId: seasonId, teamCodes, first: 999 },
      fetchPolicy: 'network-only',
    });

  if (error) {
    console.error('Error fetching head to head matches:', error);
    return [];
  }

  return data?.seasonHeadToHeadMatchesConnection?.edges.map((edge) => edge.node) ?? [];
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seasonParam = searchParams.get('season');
  const teamsParam = searchParams.get('teams')?.split(',') ?? [];
  const sectionParam = searchParams.get('section') || 'todos';
  const [data, matches] = await Promise.all([
    fetchHeadToHead(seasonParam, teamsParam),
    fetchHeadToHeadMatches(seasonParam, teamsParam),
  ]);
  const season = data.length > 0 ? data[0].season : null;

  const { renderToStaticMarkup } = await import('react-dom/server');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Special+Gothic+Condensed+One&display=swap" rel="stylesheet">
  </head>
  <body>${renderToStaticMarkup(<HeadToHeadDocument season={season} data={data} matches={matches} section={sectionParam} />)}</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let pdfBuffer: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { bottom: '70px' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width:100%; margin: 0 24px; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #d2d2d2; font-family: Arial, Helvetica, sans-serif; font-weight: 500; font-size: 8px; color: #666; letter-spacing: 0.6px;">
          <span>Baloncesto Superior Nacional · ${formatDate(new Date(), 'YYYY-MM-DD h:mm A')}</span>
          <span>bsnpr.com</span>
        </div>
      `,
    });
  } finally {
    await browser.close();
  }

  const fileName = normalizeFileName(
    `cmp-equipos-${teamsParam.join('-')}-${season?.name ?? 'bsn'}`,
    'pdf',
  );

  // Create a new Response with the PDF data and set the appropriate headers
  return new NextResponse(new Blob([pdfBuffer as unknown as ArrayBuffer]), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
