/**
 * Blaze Web SDK (`@wscsports/blaze-web-sdk`): WSC Stories widgets.
 *
 * - Match pages: label = **`g` + match `providerId`**
 * - Team pages: label = **`t` + team `providerId`**
 * Parent view must render `WSCBlazeSDK` above these widgets.
 */

/** Blaze/WSC story label for a match: `g` + provider id. */
export function blazeMatchWscStoriesLabel(providerId: string): string {
  return `g${providerId}`;
}

/** Blaze/WSC story label for a team: `t` + provider id. */
export function blazeTeamWscStoriesLabel(providerId: string): string {
  return `t${providerId}`;
}

/** DOM container id for match pages (Mejores jugadas). */
export function matchWscStoriesContainerId(matchProviderId: string): string {
  return `match-wsc-stories-${matchProviderId}`;
}

/** DOM container id for team pages (Highlights). */
export function teamWscStoriesContainerId(teamProviderId: string): string {
  return `team-wsc-stories-${teamProviderId}`;
}
