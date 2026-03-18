import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { useMatchTeamPlayersBoxscore } from '../hooks/matches';
import numeral from 'numeral';
import Link from 'next/link';

type Props = {
  matchProviderId: string;
  teamProviderId: string;
  usePolling?: boolean;
};

const BOXSCORE_HEADER = [
  'MIN',
  'PTS',
  'FG',
  'FG%',
  '3PT',
  '3P%',
  'FT',
  'FT%',
  'REB',
  'AST',
  'TO',
  'STL',
  'BLK',
  'PF',
  '+/-',
];

export default function MatchTeamBoxScoreWidget({
  matchProviderId,
  teamProviderId,
  usePolling = false,
}: Props) {
  const { data, loading } = useMatchTeamPlayersBoxscore(
    matchProviderId,
    teamProviderId,
    usePolling
  );

  if (loading) {
    return (
      <div className="space-y-1">
        <ShimmerLine height="40px" />
        <ShimmerLine height="40px" />
        <ShimmerLine height="40px" />
        <ShimmerLine height="40px" />
        <ShimmerLine height="40px" />
        <ShimmerLine height="40px" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">#</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                JUGADOR
              </span>
            </th>
            {BOXSCORE_HEADER.map((header) => (
              <th
                key={header}
                className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center"
              >
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  {header}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.player.providerId}>
              <td
                className="px-3 py-2 text-center whitespace-nowrap w-[1%]"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                }}
              >
                <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">
                  {item.player.shirtNumber || '-'}
                </span>
              </td>
              <td
                className="px-3 py-2"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <div className="w-[124px]">
                  <Link href={`/jugadores/${item.player.providerId}`}>
                    <span className="text-base">{item.player.name}</span>
                    <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)] ml-2">
                      {item.player.playingPosition}
                    </span>
                  </Link>
                </div>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.minutes).format('0.0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.points).format('0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.fieldGoalsMade).format('0')}/{numeral(item.boxscore.fieldGoalsAttempted).format('0')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.fieldGoalsPercentage).format('0.0%')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.threePointersMade).format('0')}/{numeral(item.boxscore.threePointersAttempted).format('0')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.threePointersPercentage).format('0.0%')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.freeThrowsMade).format('0')}/{numeral(item.boxscore.freeThrowsAttempted).format('0')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.freeThrowsPercentage).format('0.0%')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.reboundsTotal).format('0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.assists).format('0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.turnovers).format('0')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.steals).format('0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">{numeral(item.boxscore.blocks).format('0')}</span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.foulsPersonal).format('0')}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {numeral(item.boxscore.plusMinusPoints).format('0')}
                </span>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                className="px-3 py-2 text-center"
                colSpan={BOXSCORE_HEADER.length + 2}
              >
                No hay datos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
