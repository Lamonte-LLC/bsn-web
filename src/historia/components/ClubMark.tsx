import TeamLogoAvatar, { TEAM_LOGOS } from '@/team/components/avatar/TeamLogoAvatar';

type Props = {
  code: string;
  /** Disc color when the site has no logo for the club (extinct franchises). */
  color: string;
  size?: number;
};

/** Club mark: the real logo when the site has it, else a disc with the code in the archive's provisional color. */
export default function ClubMark({ code, color, size = 20 }: Props) {
  if (code in TEAM_LOGOS) return <TeamLogoAvatar teamCode={code} size={size} />;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-barlow-condensed font-bold italic text-white" style={{ backgroundColor: color, width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      {code}
    </span>
  );
}
