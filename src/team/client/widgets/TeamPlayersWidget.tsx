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
  seasonProviderId?: string;
};

export default function TeamPlayersWidget({ teamCode, seasonProviderId }: Props) {
  const { data, loading } = useTeamPlayersConnection(teamCode, seasonProviderId);

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
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 whitespace-nowrap w-[1%] min-w-[48px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">#</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 whitespace-nowrap w-[1%] min-w-[200px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                JUGADOR
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap min-w-[80px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                POSICIÓN
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap min-w-[80px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                ESTATURA
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap min-w-[72px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">PESO</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap min-w-[88px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">DOB</span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] pl-4 pr-8 py-3 text-center whitespace-nowrap w-[1%] min-w-[100px]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">&nbsp;</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((node, index) => (
            <tr key={`player-${node.player.providerId}`}>
              <td
                className="px-4 py-3"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {node.jerseyNumber ?? '—'}
                </span>
              </td>
              <td
                className="px-4 py-3"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <Link
                  href={`/jugadores/${node.player.providerId}`}
                  className="flex flex-row items-center gap-3"
                >
                  <PlayerPhotoAvatar
                    photoUrl={node.player.avatarUrl || ''}
                    name={node.player.name}
                    size={30}
                  />
                  <span className="text-[15px]">{node.player.name}</span>
                </Link>
              </td>
              <td
                className="px-4 py-3 text-center"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {node.playingPosition || 'N/A'}
                </span>
              </td>
              <td
                className="px-4 py-3 text-center"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {centimeterToInches(node.player.height) > 0
                    ? formatInches(centimeterToInches(node.player.height))
                    : 'N/A'}
                </span>
              </td>
              <td
                className="px-4 py-3 text-center"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {kilogramToPounds(node.player.weight) > 0
                    ? `${numeral(kilogramToPounds(node.player.weight)).format('0')} lbs`
                    : 'N/A'}
                </span>
              </td>
              <td
                className="px-4 py-3 text-center"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <span className="font-barlow text-[13px]">
                  {node.player.dob
                    ? formatDate(node.player.dob, PLAYER_BIRTHDAY_FORMAT)
                    : 'N/A'}
                </span>
              </td>
              <td
                className="pl-4 pr-8 py-3 text-center whitespace-nowrap w-[1%]"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : '#F9F9F9',
                }}
              >
                <Link
                  href={`/jugadores/${node.player.providerId}`}
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
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-center" colSpan={7}>
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
