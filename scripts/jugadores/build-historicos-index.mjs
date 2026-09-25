/**
 * Builds public/data/jugadores-historicos.json: every player of the API with the years, clubs and games of their
 * career, so /jugadores can filter and sort the historical list without one request per row.
 *
 *   node scripts/jugadores/build-historicos-index.mjs
 *
 * Reads BSN_GRAPHQL_URI from the environment (or .env). Takes a few minutes: one request per player.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const env = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const URI = process.env.BSN_GRAPHQL_URI || /BSN_GRAPHQL_URI=\s*"?([^"\n]+)"?/.exec(env)?.[1];
if (!URI) throw new Error('BSN_GRAPHQL_URI is not set');

async function gql(query, variables, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(URI, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) });
      const json = await res.json();
      if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 200));
      return json.data;
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
}

const LIST = `query($first:Int,$after:String){ playersConnection(first:$first, after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ providerId name nickname avatarUrl } } } }`;
const CAREER = `query($id:String){ player(geniusId:0, providerId:$id){ statsBySeasonConnection(first:99){ edges{ node{ season{ year isPlayoffs } teams{ code name nickname colorPrimary } stats{ games } } } } careerStats{ games } } }`;

const players = [];
let after = null;
do {
  const data = await gql(LIST, { first: 200, after });
  const conn = data.playersConnection;
  players.push(...conn.edges.map((e) => e.node));
  after = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
  process.stderr.write(`listed ${players.length}\n`);
} while (after);

const teams = {};
const out = [];
let done = 0;
const queue = [...players];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try {
      const data = await gql(CAREER, { id: p.providerId });
      const lines = (data.player?.statsBySeasonConnection.edges ?? []).map((e) => e.node).filter((n) => !n.season.isPlayoffs);
      const years = [...new Set(lines.map((l) => l.season.year))].sort((a, b) => a - b);
      const codes = [];
      for (const l of [...lines].sort((a, b) => a.season.year - b.season.year)) {
        for (const t of l.teams) {
          if (!codes.includes(t.code)) codes.push(t.code);
          if (!teams[t.code]) teams[t.code] = { name: t.name, nickname: t.nickname, color: t.colorPrimary || null };
        }
      }
      const g = data.player?.careerStats?.games ?? lines.reduce((s, l) => s + (l.stats.games ?? 0), 0);
      out.push({ id: p.providerId, n: p.name, k: p.nickname || undefined, a: p.avatarUrl || undefined, fy: years[0] ?? null, ly: years[years.length - 1] ?? null, s: years.length, g: g ? Math.round(g) : 0, t: codes, d: [...new Set(years.map((y) => Math.floor(y / 10) * 10))] });
    } catch (e) {
      process.stderr.write(`failed ${p.name}: ${e.message}\n`);
      out.push({ id: p.providerId, n: p.name, k: p.nickname || undefined, a: p.avatarUrl || undefined, fy: null, ly: null, s: 0, g: 0, t: [], d: [] });
    }
    done += 1;
    if (done % 100 === 0) process.stderr.write(`career ${done}/${players.length}\n`);
  }
}
await Promise.all(Array.from({ length: 10 }, worker));

out.sort((a, b) => a.n.localeCompare(b.n, 'es'));
const file = path.join(root, 'public/data/jugadores-historicos.json');
fs.writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), teams, players: out }));
console.log(`wrote ${file}: ${out.length} players, ${Object.keys(teams).length} clubs, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
