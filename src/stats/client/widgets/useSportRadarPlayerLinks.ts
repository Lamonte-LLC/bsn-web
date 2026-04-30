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

function rewriteAllLinks(root: HTMLElement) {
  const playerAnchors = root.querySelectorAll<HTMLAnchorElement>(
    `a[data-sw-person-link="true"]:not([${REWRITTEN_ATTR}="true"])`,
  );
  playerAnchors.forEach((a) => {
    void rewritePlayerLink(a);
  });

  const teamAnchors = root.querySelectorAll<HTMLAnchorElement>(
    `a[data-sw-team-link="true"]:not([${REWRITTEN_ATTR}="true"])`,
  );
  teamAnchors.forEach((a) => {
    rewriteTeamLink(a);
  });
}

export function useSportRadarPlayerLinks(
  ref: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    rewriteAllLinks(container);

    const observer = new MutationObserver(() => {
      rewriteAllLinks(container);
    });
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    });

    // Sportradar attaches a bubbling-phase click handler that calls
    // preventDefault() and routes navigation through its own internal
    // SPA. Listening in CAPTURE phase lets us run before that handler,
    // so we can read our rewritten href (or compute it on the fly) and
    // navigate to our internal route.
    const onClickCapture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>(
        'a[data-sw-person-link="true"], a[data-sw-team-link="true"]',
      );
      if (!anchor) return;
      if (!container.contains(anchor)) return;

      const href = anchor.getAttribute('href') ?? '';
      // Rewritten anchors point to /jugadores/<uuid> or /equipos/<code>.
      // Anything else (e.g. the original Sportradar token href) means we
      // failed to rewrite — fall back to letting the widget handle it.
      if (!href.startsWith('/jugadores/') && !href.startsWith('/equipos/')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      // Use full navigation rather than Next router so the widget tear-
      // down on the new page is clean (the widget mutates global state
      // and behaves better with a fresh document).
      window.location.assign(href);
    };

    container.addEventListener('click', onClickCapture, true);

    return () => {
      observer.disconnect();
      container.removeEventListener('click', onClickCapture, true);
    };
  }, [ref]);
}
