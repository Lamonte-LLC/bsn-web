# Archivo BSN · pipeline de data

Genera `data/archivo/` (JSON estático) a partir del prototipo histórico de la liga. Corre una vez al año, no en cada build. No toca nada de bsn-web.

## Correr

Node 22+ (usa `--experimental-strip-types`, sin dependencias nuevas):

```bash
curl -sL "https://project-alzl7.vercel.app/bsn_data.js" -o scripts/archivo/raw/bsn_data.js   # solo si cambió la fuente
node --experimental-strip-types scripts/archivo/extract-raw.ts   # bsn_data.js -> raw/enc.json, careers.json, season-logs.json
node --experimental-strip-types scripts/archivo/etl-stats.ts     # raw/ + data/ -> data/archivo/**
node --experimental-strip-types scripts/archivo/etl-results.ts   # GraphQL de BSN + FPO -> results en seasons/, seasonRecords en franchises/
node --experimental-strip-types scripts/archivo/build-insights.ts # data/archivo -> data/archivo/insights/ (ver insights/README.md)
```

O todo junto: `scripts/archivo/build-all.sh [--from-cache]`.

El orden importa: `etl-stats.ts` regenera `seasons/` desde cero y `etl-results.ts` escribe dentro de esos archivos. `etl-results.ts --from-cache` usa las respuestas guardadas en `raw/graphql/` en vez de pegarle al API (usa `BSN_GRAPHQL_URI` de `.env`).

Ambos imprimen una validación al final. Revisar antes de commitear la salida.

## Resultados: real vs FPO

El GraphQL de BSN solo conoce las temporadas 2025 y 2026. `etl-results.ts` llena `season.results` así:

| Temporada | Standings | Juegos | Series de playoffs | Rosters | Stats de jugadores |
|---|---|---|---|---|---|
| 2026 | real | real (246) | real (7) | real | real |
| 2025 | real | **FPO** (solo 2 juegos reales de All-Star) | **FPO** | real | real |
| 2015 a 2024 | **FPO** | **FPO** | **FPO** | ninguno | ninguno |

Cada bloque lleva su bandera en `results.fpo.{standings,games,series,rosters,playerStats}`; el UI debe marcar visualmente lo que sea FPO. Los FPO son deterministas (semilla por año), usan la lista real de equipos de cada temporada, el campeón real gana la final con el marcador real de `champions.json`, y en 2025 los juegos dummy se ajustan al récord y las posiciones reales. Los ids FPO empiezan con `fpo-`.

Los jugadores de rosters y stats de GraphQL se enlazan al perfil del archivo (`playerId`) solo cuando el nombre cruza con exactamente un jugador de `players.json`; los importados recientes no tienen carrera en bsn_data y quedan con `playerId: null`.

`seasons/2026.json` lo crea `etl-results.ts` (no existe en bsn_data ni en champions.json). El campeón 2026 queda null hasta que el backend marque la final como completada.

## Entradas curadas (`scripts/archivo/data/`)

| Archivo | Qué es |
|---|---|
| `SCHEMA.md` | Mapa de columnas de `bsn_data.js` |
| `champions.json`, `mvps.json`, `teams-index.json` | Extraídos del DOM del prototipo |
| `franchises.seed.json` | Tabla maestra de franquicias: slug, ciudad, código de bsn-web, color, aliases. Editar aquí para agregar ciudades faltantes o logos nuevos |
| `mvp-overrides.json` | MVPs cuyo nombre no cruza automáticamente con `CAREER_DATA`, con la razón de cada asignación |

## Salidas (`data/archivo/`)

- `franchises.json` · franquicias (`type: "franchise"`) y entidades de evento (`type: "event"`)
- `franchises/{slug}.json` · títulos, MVPs, líderes históricos, todos sus jugadores
- `players.json` · índice liviano para búsqueda (3,327 jugadores)
- `players/{id}.json` · carrera publicada (`career`), totales sumados de las líneas (`computed`), líneas por fase (`regular`, `playoffs`, `allstar`, `other`)
- `seasons/{year}.json` · 1930 a 2025; campeón, MVP, líderes y rosters cuando hay stats (1956 a 2023)
- `champions.json`, `mvps.json`, `records.json`

## Reglas de la data

- `-1` en la fuente es `null` en la salida. Nunca cero.
- En temporadas viejas la fuente pone `0` donde no registraba la stat (asistencias, robos, bloqueos) o `fga = fgm`. Una stat se considera registrada en una temporada solo si al menos el 20% de las filas de Serie Regular tiene un valor real; si no, se convierte a `null` para toda la temporada. La validación imprime los rangos afectados.
- Los totales en `computed` solo se reportan cuando todas las líneas tienen el valor; una suma parcial subestimaría carreras viejas.
- `career` viene tal cual de la liga (`CAREER_DATA`). Sus porcentajes de tiro para jugadores pre-1965 heredan el problema de `fga = fgm`; preferir `computed` cuando `career` y `computed` difieran en porcentajes.
- Los índices 24+ de `_ENC.teams` son eventos (All-Star, selección, etc.), excepto Atenienses (31), Grises (42) y Osos (45), que son franquicias reales y están en la tabla semilla.
- La data estadística termina en 2023. 2024 y 2025 solo tienen campeón y MVP hasta que entre Sportradar.
