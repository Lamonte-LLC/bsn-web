'use client';

import { RefObject, useEffect } from 'react';

/**
 * Sportradar widget links use an opaque base64-deflate token in the href
 * (e.g. `/estadisticas?~w=p~eJwlyz...`). The token decodes to JSON like
 *   {"s":"<season-uuid>", "l":"es-ES", "p":"<player-uuid>"}    (player)
 *   {"s":"<season-uuid>", "l":"es-ES", "e":"<entity-uuid>"}    (team)
 *
 * This hook rewrites:
 *   - every <a data-sw-person-link="true"> → /jugadores/<player-uuid>
 *   - every <a data-sw-entity-link="true"> → /equipos/<3-letter-code>
 *
 * Team UUIDs are not stable across our codebase, so we map team links by
 * matching the widget's visible text (city / full name) to the league's
 * 3-letter code.
 */

const REWRITTEN_ATTR = 'data-bsn-rewritten';
const HREF_TOKEN_PREFIX = '~w=p~';

/** Lower-case keyword → team code. Order matters when one keyword is a
 *  substring of another. We match against visible link text. */
const TEAM_TEXT_TO_CODE: Array<[string, string]> = [
  ['aguada', 'AGU'],
  ['arecibo', 'ARE'],
  ['bayamón', 'BAY'],
  ['bayamon', 'BAY'],
  ['caguas', 'CAG'],
  ['carolina', 'CAR'],
  ['canóvanas', 'CAR'],
  ['canovanas', 'CAR'],
  ['guaynabo', 'GBO'],
  ['manatí', 'MAN'],
  ['manati', 'MAN'],
  ['mayagüez', 'MAY'],
  ['mayaguez', 'MAY'],
  ['ponce', 'PON'],
  ['quebradillas', 'QUE'],
  ['san germán', 'SGE'],
  ['san german', 'SGE'],
  ['santurce', 'SCE'],
];

function teamCodeFromText(raw: string): string | null {
  const text = raw.toLowerCase();
  for (const [keyword, code] of TEAM_TEXT_TO_CODE) {
    if (text.includes(keyword)) return code;
  }
  return null;
}

async function inflateBase64UrlToString(token: string): Promise<string> {
  // Sportradar uses URL-safe base64 (no padding) of the deflate output.
  const standard = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = standard + '='.repeat((4 - (standard.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('deflate'));
  const text = await new Response(stream).text();
  return text;
}

async function rewritePlayerLink(anchor: HTMLAnchorElement): Promise<void> {
  if (anchor.getAttribute(REWRITTEN_ATTR) === 'true') return;

  const rawHref = anchor.getAttribute('href') ?? '';
  const decoded = decodeURIComponent(rawHref);
  const idx = decoded.indexOf(HREF_TOKEN_PREFIX);
  if (idx === -1) return;

  const token = decoded.slice(idx + HREF_TOKEN_PREFIX.length).split(/[&#]/)[0];
  if (!token) return;

  try {
    const json = await inflateBase64UrlToString(token);
    const parsed = JSON.parse(json) as { p?: string };
    if (!parsed.p) return;
    anchor.setAttribute('href', `/jugadores/${parsed.p}`);
    anchor.setAttribute(REWRITTEN_ATTR, 'true');
  } catch {
    // Decode failures: skip silently.
  }
}

function rewriteTeamLink(anchor: HTMLAnchorElement): void {
  if (anchor.getAttribute(REWRITTEN_ATTR) === 'true') return;

  // Team links expose the name via `data-sw-team-link-team-name` and as
  // the link's own text content (e.g. "Criollos de Caguas").
  const candidates = [
    anchor.getAttribute('data-sw-team-link-team-name') ?? '',
    anchor.textContent ?? '',
    anchor.getAttribute('aria-label') ?? '',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const code = teamCodeFromText(candidate);
    if (code) {
      anchor.setAttribute('href', `/equipos/${code}`);
      anchor.setAttribute(REWRITTEN_ATTR, 'true');
      return;
    }
  }
}

function rewriteAllLinks(root: HTMLElement, openInNewTab: boolean) {
  const playerAnchors = root.querySelectorAll<HTMLAnchorElement>(
    `a[data-sw-person-link="true"]:not([${REWRITTEN_ATTR}="true"]), a.box-score-person-cell:not([${REWRITTEN_ATTR}="true"])`,
  );
  playerAnchors.forEach((a) => {
    void rewritePlayerLink(a).then(() => {
      if (openInNewTab && a.getAttribute(REWRITTEN_ATTR) === 'true') {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });

  const teamAnchors = root.querySelectorAll<HTMLAnchorElement>(
    `a[data-sw-team-link="true"]:not([${REWRITTEN_ATTR}="true"])`,
  );
  teamAnchors.forEach((a) => {
    rewriteTeamLink(a);
    if (openInNewTab && a.getAttribute(REWRITTEN_ATTR) === 'true') {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

type Options = {
  /** When true, navigate in a new tab and add target/rel attributes. */
  openInNewTab?: boolean;
};

export function useSportRadarPlayerLinks(
  ref: RefObject<HTMLElement | null>,
  options: Options = {},
): void {
  const openInNewTab = options.openInNewTab === true;
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    rewriteAllLinks(container, openInNewTab);

    const observer = new MutationObserver(() => {
      rewriteAllLinks(container, openInNewTab);
    });
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    });

    // Sportradar attaches click/mousedown handlers in bubbling phase
    // that open an internal player modal. Listening in CAPTURE phase
    // lets us intercept before that handler — and listening on
    // `mousedown` too catches widget code that uses pointer events
    // instead of click. We also accept any anchor whose href contains
    // the Sportradar token, even if it wasn't tagged with
    // `data-sw-person-link` (e.g. the box-score person cell), and
    // attempt an on-demand decode if rewrite hasn't run yet.
    const tryNavigateFromAnchor = (anchor: HTMLAnchorElement, e: Event) => {
      let href = anchor.getAttribute('href') ?? '';

      // Already rewritten — go.
      if (href.startsWith('/jugadores/') || href.startsWith('/equipos/')) {
        e.preventDefault();
        e.stopPropagation();
        if (openInNewTab) {
          window.open(href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.assign(href);
        }
        return;
      }

      // Has the Sportradar token but rewrite hasn't completed yet —
      // try to extract the player UUID synchronously is impossible
      // (DecompressionStream is async), but we can kick off the rewrite
      // and abort the widget's modal so the user can click again once
      // rewritten. The MutationObserver below also handles this for
      // future renders.
      const decoded = decodeURIComponent(href);
      if (decoded.includes('~w=p~') || decoded.includes('~w=e~')) {
        // Block the widget modal; rewrite will catch up.
        e.preventDefault();
        e.stopPropagation();
        if (anchor.matches('a[data-sw-person-link="true"], a.box-score-person-cell')) {
          void rewritePlayerLink(anchor).then(() => {
            const next = anchor.getAttribute('href') ?? '';
            if (next.startsWith('/jugadores/')) {
              if (openInNewTab) {
                window.open(next, '_blank', 'noopener,noreferrer');
              } else {
                window.location.assign(next);
              }
            }
          });
        } else if (anchor.matches('a[data-sw-team-link="true"]')) {
          rewriteTeamLink(anchor);
          const next = anchor.getAttribute('href') ?? '';
          if (next.startsWith('/equipos/')) {
            if (openInNewTab) {
              window.open(next, '_blank', 'noopener,noreferrer');
            } else {
              window.location.assign(next);
            }
          }
        }
      }
    };

    const onPointerCapture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>(
        'a[data-sw-person-link="true"], a[data-sw-team-link="true"], a.box-score-person-cell, a.sw-link',
      );
      if (!anchor) return;
      if (!container.contains(anchor)) return;
      tryNavigateFromAnchor(anchor, e);
    };

    container.addEventListener('mousedown', onPointerCapture, true);
    container.addEventListener('click', onPointerCapture, true);

    return () => {
      observer.disconnect();
      container.removeEventListener('mousedown', onPointerCapture, true);
      container.removeEventListener('click', onPointerCapture, true);
    };
  }, [ref, openInNewTab]);
}
