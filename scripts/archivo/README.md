# Archivo BSN · pipeline de data

Genera `data/archivo/` (JSON estático) a partir del prototipo histórico de la liga. Corre una vez al año, no en cada build. No toca nada de bsn-web.

## Correr

Node 22+ (usa `--experimental-strip-types`, sin dependencias nuevas):

```bash
curl -sL "https://project-alzl7.vercel.app/bsn_data.js" -o scripts/archivo/raw/bsn_data.js   # solo si cambió la fuente
node --experimental-strip-types scripts/archivo/extract-raw.ts   # bsn_data.js -> raw/enc.json, careers.json, season-logs.json
node --experimental-strip-types scripts/archivo/etl-stats.ts     # raw/ + data/ -> data/archivo/**
```

`etl-stats.ts` imprime una validación al final (conteos esperados, Carlos Arroyo 2019, campeones y MVPs sin resolver, stats no registradas por temporada). Revisar antes de commitear la salida.

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
