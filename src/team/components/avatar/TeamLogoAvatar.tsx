type Props = {
  teamCode: string;
  size?: number;
  rounded?: boolean;
  defaultLogo?: string;
};

const TEAM_LOGOS: Record<string, string> = {
  AGU: `/assets/images/teams/Aguada.png`,
  ARE: `/assets/images/teams/Arecibo.png`,
  BAY: `/assets/images/teams/Bayamon.png`,
  CAG: `/assets/images/teams/Caguas.png`,
  CAR: `/assets/images/teams/Carolina.png`,
  GBO: `/assets/images/teams/Guaynabo.png`,
  MAN: `/assets/images/teams/Manati.png`,
  MAY: `/assets/images/teams/Mayaguez.png`,
  PON: `/assets/images/teams/Ponce.png`,
  QUE: `/assets/images/teams/Quebradillas.png`,
  SGE: `/assets/images/teams/San-German.png`,
  SCE: `/assets/images/teams/Santurce.png`,
  S8S: `/assets/images/teams/S8S.png`,
  ELC: `/assets/images/teams/ELC.png`,
  REF: `/assets/images/teams/REF.png`,
  DAQ: `/assets/images/teams/DAQ.png`,
};

export default function TeamLogoAvatar({
  teamCode,
  size = 50,
  defaultLogo = 'default-dark.png',
}: Props) {
  const imageSource = teamCode in TEAM_LOGOS
    ? TEAM_LOGOS[teamCode]
    : `/assets/images/teams/${defaultLogo}`;

  return (
    <div className="flex shrink-0 items-center justify-center">
      <img
        src={imageSource}
        className=""
        style={{ height: `${size}px`, width: `${size}px` }}
      />
    </div>
  );
}
