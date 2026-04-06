'use client';

import WSCMoments from '@/highlights/client/components/WSCMoments';
import {
  blazeTeamWscStoriesLabel,
  teamWscStoriesContainerId,
} from '@/shared/constants/wsc';

type Props = {
  /** Team Synergy / provider id — Blaze label is `t` + this id. */
  teamProviderId: string;
};

/**
 * WSC Stories (Blaze) for team page “Highlights”.
 * Label: `t` + `providerId`.
 */
export default function TeamWscStoriesWidget({ teamProviderId }: Props) {
  if (!teamProviderId) {
    return null;
  }

  return (
    <WSCMoments
      id={teamWscStoriesContainerId(teamProviderId)}
      labels={blazeTeamWscStoriesLabel(teamProviderId)}
      contentType="story"
    />
  );
}
