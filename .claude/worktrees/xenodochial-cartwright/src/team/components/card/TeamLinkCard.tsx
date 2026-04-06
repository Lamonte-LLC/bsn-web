import Link from "next/link";
import TeamLogoAvatar from "../avatar/TeamLogoAvatar";

type Props = {
  teamCode: string;
  teamName: string;
  avatarSize?: number;
};

export default function TeamLinkCard({ teamCode, teamName, avatarSize = 56 }: Props) {
  return (
    <Link href={`/equipos/${teamCode}`}>
      <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
        <div className="flex flex-col justify-center items-center gap-0.5">
          <TeamLogoAvatar teamCode={teamCode} size={avatarSize} />
          <p className="font-special-gothic-condensed-one text-sm text-white">
            {teamName}
          </p>
        </div>
      </div>
    </Link>
  )
}
