import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import { getClient } from '@/apollo-client';
import { SEASON_PLAYER_STATS_EXTENDED } from '@/graphql/stats';
import SeasonPlayerStatsExtendedDocument from '@/stats/pdf/SeasonPlayerStatsExtendedDocument';
import { normalizeFileName } from '@/utils/text';

import { PlayerStatsType, PlayerType } from '@/player/types';
import { SeasonType } from '@/season/types';
import { TeamType } from '@/team/types';
import { formatDate } from '@/utils/date-formatter';

export const runtime = 'nodejs';

export const STATS_PER_PAGE = 9999;

type SeasonPlayerStatsExtendedType = {
  season: SeasonType;
  team: TeamType;
  player: PlayerType;
  stats: PlayerStatsType;
};

type SeasonPlayerStatsExtendedResponse = {
  seasonPlayerStatsExtendedConnection: {
    edges: {
      node: SeasonPlayerStatsExtendedType;
    }[];
  };
};

const fetchSeasonPlayerStatsExtended = async (seasonId: string | null) => {
  const { data, error } =
    await getClient().query<SeasonPlayerStatsExtendedResponse>({
      query: SEASON_PLAYER_STATS_EXTENDED,
      variables: { seasonProviderId: seasonId, first: STATS_PER_PAGE },
      fetchPolicy: 'network-only',
    });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return (
    data?.seasonPlayerStatsExtendedConnection.edges.map(
      (edge: { node: SeasonPlayerStatsExtendedType }) => edge.node,
    ) ?? []
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seasonParam = searchParams.get('season');
  const data = await fetchSeasonPlayerStatsExtended(seasonParam);
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
  <body>
    ${renderToStaticMarkup(<SeasonPlayerStatsExtendedDocument data={data} season={season} />)}
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
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true,
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
    `estadisticas-jugadores-${season?.name ?? 'bsn'}`,
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
