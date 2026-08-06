import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import { getClient } from '@/apollo-client';
import { SEASON_TEAM_STATS_EXTENDED } from '@/graphql/stats';
import SeasonTeamStatsExtendedDocument from '@/stats/pdf/SeasonTeamStatsExtendedDocument';
import { normalizeFileName } from '@/utils/text';

import { SeasonType } from '@/season/types';
import { TeamType, TeamSeasonStatsType } from '@/team/types';

export const runtime = 'nodejs';
export const STATS_PER_PAGE = 9999;

type SeasonTeamStatsExtendedType = {
  season: SeasonType;
  team: TeamType;
  stats: TeamSeasonStatsType;
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Special+Gothic+Condensed+One&display=swap" rel="stylesheet">
    <style>
      /* 2. Fix the footer to the bottom of every printed page */
      footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24px;
      }
      footer div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #d2d2d2;
        font-family: 'Barlow', Arial, sans-serif;
        font-weight: 500;
        font-size: 8px;
        color: #666;
        letter-spacing: 0.6px;
        padding-top: 8px;
      }
    </style>
  </head>
  <body>
    <footer>
      <div>
        <span>Baloncesto Superior Nacional</span>
        <span>bsnpr.com</span>
      </div>
    </footer>
    ${renderToStaticMarkup(<SeasonTeamStatsExtendedDocument data={data} season={season} />)}
  </body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let pdfBuffer: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, landscape: true });
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
