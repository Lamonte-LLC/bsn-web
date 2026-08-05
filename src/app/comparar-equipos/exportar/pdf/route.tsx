import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import { getClient } from '@/apollo-client';
import { HEAD_TO_HEAD_TEAM_STATS_EXTENDED } from '@/graphql/stats';
import { normalizeFileName } from '@/utils/text';

import { SeasonType } from '@/season/types';
import { TeamType, TeamSeasonStatsType } from '@/team/types';
import HeadToHeadDocument from '@/stats/pdf/HeadToHeadDocument';

export const runtime = 'nodejs';

type HeadToHeadTeamStatsType = {
  season: SeasonType;
  team: TeamType;
  stats: TeamSeasonStatsType;
};

type HeadToHeadTeamStatsResponse = {
  headToHeadTeamStats: HeadToHeadTeamStatsType[];
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seasonParam = searchParams.get('season');
  const teamsParam = searchParams.get('teams')?.split(',') ?? [];
  const data = await fetchHeadToHead(seasonParam, teamsParam);
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
  <body>${renderToStaticMarkup(<HeadToHeadDocument season={season} data={data} />)}</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let pdfBuffer: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  const fileName = normalizeFileName(
    `estadisticas-equipos-${season?.name ?? 'bsn'}`,
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
