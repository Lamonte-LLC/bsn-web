# Insights de Archivo BSN

Generado por `scripts/archivo/build-insights.ts` a partir de `data/archivo/`. No editar a mano.

| Archivo | Contenido |
|---|---|
| coaches.json | Dirigentes campeones; co-dirigentes ("A y B") cuentan el título para ambos |
| mvp-champion-overlap.json | Por año, si el MVP jugaba en el equipo campeón (21.6% de 74 años) |
| multi-mvps.json | Jugadores con 2+ MVPs |
| longevity.json | Top 25 por temporadas y por juegos |
| loyalty.json | Un solo club vs 4+ franquicias (mínimo 5 temporadas) |
| scoring-club.json | Temporadas con ppg >= 15/20/25/30 (mínimo 10 juegos) y conteo por década |
| records-by-decade.json | Mejor registro por década; `value: null` con `reason: "no data"` cuando la stat no se registraba |
| career-arcs.json | Arco de carrera (temporada regular, un punto por año) para jugadores con 3+ temporadas |
| similarity.json | 8 jugadores más parecidos por jugador con 3+ temporadas |

## Similarity score

Vector por jugador: `[ppg, rpg, apg, spg, bpg, fgPct, fg3Pct, ftPct, g, seasons]` calculado sobre líneas de Serie Regular con franquicias reales; una dimensión es null si alguna temporada no la tiene (misma regla que el ETL).

1. Cada dimensión se normaliza a z-score sobre la población (1398 jugadores).
2. Distancia entre dos jugadores = raíz de la media de las diferencias de z al cuadrado, solo sobre las dimensiones donde ambos tienen data. Dividir por el número de dimensiones compartidas evita que compartir más dimensiones parezca estar más lejos. Pares con menos de 5 dimensiones compartidas se descartan.
3. `score = 100 * (1 - distancia / distanciaMáxima)` acotado a 0..100, con la distancia máxima observada entre todos los pares (4.72).

`sharedDimensions` indica sobre cuántas dimensiones se calculó cada score; un score sobre 5 dimensiones (jugador pre-1975) es menos preciso que uno sobre 10.
