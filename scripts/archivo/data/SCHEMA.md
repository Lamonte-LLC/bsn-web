# Archivo BSN · Schema de la data histórica

Fuente: prototipo de la liga en `https://project-alzl7.vercel.app/`
Archivo de data: `https://project-alzl7.vercel.app/bsn_data.js` (5.7 MB, un solo archivo JS, público)

Para descargarlo desde Claude Code:

```bash
curl -sL "https://project-alzl7.vercel.app/bsn_data.js" -o bsn_data.js
```

Es un archivo JS plano que declara tres constantes globales. Para convertirlo a JSON, ejecutar en Node:

```js
const fs = require('fs');
const src = fs.readFileSync('bsn_data.js','utf8');
const sandbox = {};
new Function('window', src + '\nwindow._ENC=_ENC; window._SL=_SL; window.CAREER_DATA=CAREER_DATA;')(sandbox);
fs.writeFileSync('enc.json', JSON.stringify(sandbox._ENC));
fs.writeFileSync('season-logs.json', JSON.stringify(sandbox._SL));
fs.writeFileSync('careers.json', JSON.stringify(sandbox.CAREER_DATA));
```

---

## Cobertura

- Temporadas: 1956 a 2025 (el título del prototipo dice 2023 pero la data llega a 2025)
- Campeones: 1930 a 2025 (95 títulos; 1953 no aparece)
- MVPs: 1951 a 2025 (75)
- Jugadores únicos: 3,253
- Filas jugador-temporada: 17,835
- Equipos / entidades: 46 (incluye All-Star, selección nacional, exhibiciones)

Lo que NO tiene: standings por temporada, resultados de juegos, fechas, playoffs bracket, fotos, biografías, videos.

**Complemento:** para 2015 a 2025, standings, resultados con fecha y calendario existen en Sportradar (ya migrado). Antes de 2015 no existe nada más que lo que hay en este archivo.

---

## 1. `_ENC` · Jugador-temporada (17,835 filas)

```
_ENC = { teams: string[46], data: Row[] }
```

Cada `Row` es un array posicional de 26 columnas. Mapa verificado contra Carlos Arroyo 2019 (Leones, Serie Regular):

| Idx | Campo | Ejemplo | Notas |
|-----|-------|---------|-------|
| 0 | playerId | `"273"` | string. Cruza con `_SL` y `CAREER_DATA` |
| 1 | teamIndex | `6` | índice en `_ENC.teams` (6 = Leones) |
| 2 | year | `2019` | |
| 3 | phaseCode | `0` | 0 = Serie Regular, 1 = Postemporada. All-Star también usa 0 pero con label distinto (col 25) |
| 4 | g | `19` | juegos |
| 5 | ppg | `9.6` | puntos por juego |
| 6 | rpg | `2.9` | rebotes por juego |
| 7 | apg | `10.6` | asistencias por juego |
| 8 | bpg | `0.1` | bloqueos por juego |
| 9 | spg | `0.7` | robadas por juego |
| 10 | topg | `2.5` | pérdidas por juego |
| 11 | ??? | `1812.2` | **Campo sospechoso.** Parece dos valores concatenados. Ignorar en el MVP hasta confirmar con la liga |
| 12 | fgPct | `32.9` | % tiros de campo. `-1` = null |
| 13 | fg3Pct | `22.6` | % triples. `-1` = null |
| 14 | ftPct | `85.5` | % tiros libres. `-1` = null |
| 15 | fgm | `55` | tiros de campo convertidos |
| 16 | fga | `167` | tiros de campo intentados |
| 17 | fg3m | `19` | triples convertidos |
| 18 | fg3a | `84` | triples intentados |
| 19 | ftm | `53` | tiros libres convertidos |
| 20 | fta | `62` | tiros libres intentados |
| 21 | pts | `182` | puntos totales |
| 22 | reb | `55` | rebotes totales |
| 23 | ast | `201` | asistencias totales |
| 24 | name | `"Carlos Arroyo Bermúdez"` | |
| 25 | phaseLabel | `"Serie Regular"` | valores: `Serie Regular`, `Postemporada`, `All-Star` |

Convención: `-1` significa dato no disponible (común en temporadas viejas para rebotes, asistencias, triples).

---

## 2. `_SL` · Season logs por jugador (3,327 llaves)

```
_SL = { [playerId: string]: SeasonLog[] }

SeasonLog = {
  y: number,        // año
  t: string,        // nombre del equipo
  ph: "regular" | "playoffs" | "allstar",
  g: number,        // juegos
  pp: number,       // ppg
  rp: number,       // rpg
  ap: number,       // apg
  ex: boolean,      // ??? (probablemente "exhibición")
  ind: boolean      // ??? (probablemente "indefinido / incompleto")
}
```

Es una vista resumida de `_ENC` por jugador. Útil para el perfil de jugador (tabla temporada por temporada).

---

## 3. `CAREER_DATA` · Totales de carrera (3,253 jugadores)

```
CAREER_DATA = { [playerId: string]: Career }

Career = {
  n: string,          // nombre
  s: number,          // temporadas jugadas
  tm: string[],       // equipos en los que jugó
  fy: number,         // primer año
  ly: number,         // último año
  g, pts, reb, ast,   // totales de carrera (null si no hay data)
  fgm, fga, c3m, c3a, ftm, fta,
  pp, rp, ap,         // promedios de carrera
  fg, f3, ft,         // porcentajes de carrera
  reg: { ...mismos campos solo Serie Regular },
  po:  { ...mismos campos solo Postemporada }
}
```

---

## 4. `champions.json` (extraído del DOM, 95 filas)

```json
{ "year": 2025, "champion": "Vaqueros", "series": "4-2", "seriesRaw": "4-2", "coach": "Christian Dalmau", "coachTitleNumber": null }
```

`coachTitleNumber` viene de los superíndices del prototipo (ej. Julio Toro¹² = su título número 12). `series` es null cuando el prototipo tenía `4-?` o no tenía el dato.

Nota: los nombres de equipos en champions usan solo el apodo (`Vaqueros`), sin ciudad. Antes de 1950 aparecen clubes que ya no existen (Heinz, Fénix, Club Náutico, etc.).

---

## 5. `mvps.json` (extraído del DOM, 75 filas)

```json
{ "year": 2025, "player": "Emmanuel Mudiay", "mvpNumber": null, "team": "Piratas de Quebradillas" }
```

`mvpNumber` viene de los superíndices (ej. Teófilo Cruz⁴ = su cuarto MVP). Aquí sí aparece el nombre completo del equipo con ciudad.

---

## 6. `teams-index.json`

Los 46 índices de `_ENC.teams`. Los índices 0 a 23 son franquicias reales. Del 24 en adelante son All-Star, selección nacional, exhibiciones y equipos de eventos especiales. Filtrar `teamIndex < 24` para vistas de franquicias.

---

## Lo que hay que resolver antes de construir

1. **Normalización de nombres de equipos.** Tres formatos coexisten: `Vaqueros` (champions), `Vaqueros de Bayamón` (mvps), y `Atleticos` sin acento (index) vs `Atléticos` (champions). Necesitas una tabla maestra `franchises.json` con `slug`, `nickname`, `city`, `fullName`, `logo`, `colors`, `activeYears`, `aliases[]`.

2. **Confirmar columna 11.** Preguntarle a quien montó el prototipo qué es. Probablemente minutos concatenados con otro valor.

3. **Sportradar para 2015+.** Standings, resultados y fechas se integran en un segundo ETL y se escriben dentro de los mismos `seasons/{year}.json`. Pre-2015 se construye solo con lo que hay aquí; las secciones que dependan de fechas o standings simplemente no aparecen en esas temporadas.
