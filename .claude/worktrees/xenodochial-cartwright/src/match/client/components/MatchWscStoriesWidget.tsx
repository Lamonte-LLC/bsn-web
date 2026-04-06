'use client';

import WSCMoments from '@/highlights/client/components/WSCMoments';
import {
  blazeMatchWscStoriesLabel,
  matchWscStoriesContainerId,
} from '@/shared/constants/wsc';

type Props = {
  /** Match Synergy / provider id — used as Blaze label and for container id. */
  matchProviderId: string;
};

/**
 * WSC Stories (Blaze) for live/completed match “Mejores jugadas”.
 * Label: `g` + match `providerId`.
 */
export default function MatchWscStoriesWidget({ matchProviderId }: Props) {
  if (!matchProviderId) {
    return null;
  }

  return (
    <WSCMoments
      id={matchWscStoriesContainerId(matchProviderId)}
      labels={blazeMatchWscStoriesLabel(matchProviderId)}
      contentType="story"
    />
  );
}
