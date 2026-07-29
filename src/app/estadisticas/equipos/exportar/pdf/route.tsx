import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import { getClient } from '@/apollo-client';
import { SEASON_TEAM_STATS_EXTENDED } from '@/graphql/stats';
import SeasonTeamStatsExtendedDocument from '@/stats/pdf/SeasonTeamStatsExtendedDocument';
import { normalizeFileName } from '@/utils/text';

import { SeasonType } from '@/season/types';
import { TeamType } from '@/team/types';
import { TeamStatsType } from '@/stats/types';

export const runtime = 'nodejs';
export const STATS_PER_PAGE = 9999;

type SeasonTeamStatsExtendedType = {
  season: SeasonType;
  team: TeamType;
  stats: TeamStatsType;
};

type SeasonTeamStatsExtendedResponse = {
  seasonTeamStatsExtendedConnection: {
    edges: {
      node: SeasonTeamStatsExtendedType;
    }[];
  };
};

const fetchSeasonTeamStatsExtended = async (seasonId: string | null) => {
  const { data, error } =
    await getClient().query<SeasonTeamStatsExtendedResponse>({
      query: SEASON_TEAM_STATS_EXTENDED,
      variables: { seasonProviderId: seasonId, first: STATS_PER_PAGE },
      fetchPolicy: 'network-only',
    });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return (
    data?.seasonTeamStatsExtendedConnection.edges.map(
      (edge: { node: SeasonTeamStatsExtendedType }) => edge.node,
    ) ?? []
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seasonParam = searchParams.get('season');
  const data = await fetchSeasonTeamStatsExtended(seasonParam);
  const season = data.length > 0 ? data[0].season : null;

  const { renderToStaticMarkup } = await import('react-dom/server');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>${renderToStaticMarkup(<SeasonTeamStatsExtendedDocument data={data} season={season} />)}</body>
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
