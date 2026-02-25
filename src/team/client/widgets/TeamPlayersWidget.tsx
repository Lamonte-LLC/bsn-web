'use client';

import Link from 'next/link';
import numeral from 'numeral';

import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { centimeterToInches, kilogramToPounds } from '@/utils/unit-converter';
import { formatInches } from '@/utils/unit-formater';
import { useTeamPlayersConnection } from '../hooks/teams';

import { PLAYER_BIRTHDAY_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  teamCode: string;
};

export default function TeamPlayersWidget({ teamCode }: Props) {
  const { data, loading } = useTeamPlayersConnection(teamCode);

  if (loading) {
    return (
      <div className="space-y-3">
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">#</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">
                JUGADOR
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">
                POSICIÓN
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">
                ESTATURA
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">PESO</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">DOB</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="text-[13px] text-[rgba(0,0,0,0.6)]">&nbsp;</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.edges.map(({ node }, index) => (
            <tr key={`player-${node.providerId}`}>
              <td
                className="px-3 py-2"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {node.shirtNumber}
                </span>
              </td>
              <td
                className="px-3 py-2"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <Link
                  href={`/jugadores/${node.providerId}`}
                  className="flex flex-row items-center gap-3"
                >
                  <PlayerPhotoAvatar
                    photoUrl={node.avatarUrl || ''}
                    name={node.name}
                    size={30}
                  />
                  <span className="text-base">{node.name}</span>
                </Link>
              </td>
              <td
                className="px-3 py-2 text-center"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {node.playingPosition}
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
                  {centimeterToInches(node.height) > 0
                    ? formatInches(centimeterToInches(node.height))
                    : 'N/A'}
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
                  {kilogramToPounds(node.weight) > 0
                    ? `${numeral(kilogramToPounds(node.weight)).format('0')} lbs`
                    : 'N/A'}
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
                  {node.dob
                    ? formatDate(node.dob, PLAYER_BIRTHDAY_FORMAT)
                    : 'N/A'}
                </span>
              </td>
              <td
                className="px-3 py-2 text-center whitespace-nowrap w-[1%]"
                style={{
                  backgroundColor:
                    index % 2 == 0 ? 'transparent' : 'rgba(247, 247, 247, 0.7)',
                }}
              >
                <Link
                  href={`/jugadores/${node.providerId}`}
                >
                  <span className="text-[15px] text-black">Ver perfil</span>
                  <img
                    src="/assets/images/icons/icon-arrow-right.svg"
                    alt=""
                    className="inline align-middle ml-1.5"
                  />
                </Link>
              </td>
            </tr>
          ))}
          {data.edges.length === 0 && (
            <tr>
              <td className="px-3 py-2 text-center" colSpan={7}>
                <span className="text-[rgba(0,0,0,0.6)]">
                  No hay datos disponibles.
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
