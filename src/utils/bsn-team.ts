import fs from 'fs';
import path from 'path';

import { TEAM_LOGOS } from '@/team/components/avatar/TeamLogoAvatar';

const DEFAULT_TEAM_LOGO = 'default-dark.png';

export const getTeamLogoBase64 = (teamCode: string): string => {
  const relativePath = TEAM_LOGOS[teamCode] ?? `/assets/images/teams/${DEFAULT_TEAM_LOGO}`;
  const logoPath = path.join(process.cwd(), 'public', relativePath);

  return `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
};
