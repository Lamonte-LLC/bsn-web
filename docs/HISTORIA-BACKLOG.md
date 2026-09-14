# Historia integrada · Backlog y notas de la primera entrega

Rama `feature/historia-integrada`. Primera entrega: componentes 1 a 6 del brief. Fecha: 14 de septiembre de 2026.

## Lo que quedó construido

| # | Componente | Rutas y montajes |
|---|---|---|
| 1 | Comparador de jugadores | `/jugadores/comparar?a=&b=&c=`; entradas desde el perfil, el índice de Jugadores y cada nombre del comparador |
| 2 | Perfil unificado | `/jugadores/[slug]` acepta el `providerId` del API y el slug del archivo; hero, bloque de temporada actual, Carrera, tabla temporada por temporada, notas de era, "Juego por juego" para activos |
| 3 | Cinta de contexto | Hero de `/equipos/[code]`, header de juego programado, franja sobre el widget de Sportradar en juegos en vivo y finalizados, y cada serie de `/playoffs` |
| 4 | Todos los tiempos | `/estadisticas?vista=historico`, toggle en el hero, cinco categorías, activos resaltados |
| 5 | Historia de franquicia | Pestaña Historia en `/equipos/[code]?tab=historia`, `/equipos/historicos` y `/equipos/historicos/[slug]` |
| 6 | Temporada | `/temporadas/[year]` con selector, campeón, MVP, líderes, standings y playoffs reales, rosters |

## Validación B.3 contra la data del proyecto

| Referencia del brief | Data | Diferencia |
|---|---|---|
| Georgie Torres 15,863; Quijote 15,293 | 15,863 y 15,293 | Ninguna |
| Neftalí Rivera, 79 puntos en un juego | Sin box scores históricos | No verificable |
| Vaqueros 18 títulos, cinco al hilo 1971 a 1975 | **15 títulos**, cinco al hilo 1971 a 1975 | Faltan 3 títulos o la cifra mezcla otra competencia |
| Julio Toro 12 | 12 | Ninguna |
| MVPs con 4: Pachín, Teófilo, Quijote | Los mismos | Ninguna |
| Teófilo Cruz 25 temporadas como tope | Cruz 25; el tope es **Butler con 29** | El brief no cita el récord |

## Identidad de jugador (B.5)

Puente en `src/historia/lib/identity.ts`, tres pasos: nombre exacto, alias, nombre y primer apellido único entre jugadores con temporadas desde 2015. Roster 2026: **106 de 205 enlazados** (74 exactos del ETL, 2 por alias, 30 por apellido; los 30 revisados uno a uno, sin falsos positivos). **99 sin enlazar**, casi todos importados o novatos sin carrera en la data histórica, que termina en 2023. Esos 99 muestran "Carrera histórica en proceso de vinculación" y solo sus temporadas en vivo. Cuando el API unifique identidades, el puente se reemplaza por el id común sin tocar los componentes.

## Movido o reutilizado desde `app/archivo/`

Sin borrar nada de `src/app/archivo/` ni `src/archivo/`. Se importan tal cual: `StatsTable`, `SortableTable`, `Scrollable`, `FranchiseLogo`, `PlayerAvatar`, `LeaderCard`, `Tabs`, `ui.tsx`, `lib/tokens`, `lib/color`, `lib/format`, `lib/names`, `lib/stats`, `lib/data`. `FranchiseView` ganó el campo `code`. Se adaptaron en `src/historia/`: el comparador (nuevas vistas y unidades), la tabla de temporadas (toggle y agrupación), la página de temporada (selector y navegación), la página de franquicia (pestaña y ruta de extintas). Rutas del archivo que ahora tienen equivalente integrado: `/archivo/comparar`, `/archivo/jugadores/[slug]`, `/archivo/temporadas/[year]`, `/archivo/franquicias`, `/archivo/franquicias/[slug]`, `/archivo/records` (parcial, en Todos los tiempos).

## Data que hay que migrar al API

Todo lo histórico se lee de `data/archivo/` por `src/archivo/lib/data.ts` y `src/historia/lib/data.ts` (server-only, en caché). Cuando el API lo sirva: `getPlayer`, `getPlayerIndex`, `getFranchiseFile`, `getSeason`, `getChampions`, `getMvps`, `careerLeaders`, más el índice de búsqueda de `/api/historia/players`. Las temporadas 2025 y 2026 se leen del snapshot `seasons/{year}.json`; en producción salen del API en vivo (`liveSeasonLines`).

## Omitido por falta de data estructurada

- Timeline de reubicaciones y cambios de nombre (componente 5). La data modela Indios de Canóvanas y Mayagüez, y Gigantes de Carolina y Canóvanas, como aliases sin fechas.
- Standings 2015 a 2024: son placeholders FPO y la página de temporada no los muestra.
- Regla 3 de la cinta ("Primera final desde X"): no se puede calcular con certeza con series solo desde 2025.
- Badge de campeón en el header del comparador y del perfil: sí se muestra, la data trae `championships` por jugador.

## Decisiones que conviene revisar

- Los tabs de `/equipos/[code]` siguen en estado de cliente; `?tab=historia` fija el tab inicial pero los demás no escriben la URL.
- El selector de temporada vive en `/temporadas/[year]`. Montarlo en los heros de Calendario, Estadísticas y Playoffs es un cambio de tres archivos existentes; se dejó fuera para no rediseñar esos heros en esta entrega. Con cualquier año que no sea 2026 navega a la página de temporada.
- `/temporadas` sin año no existe; el selector y los enlaces siempre llevan año.
- Los dos errores de lint del repo (`RecentCalendarSlider.tsx`, `LeagueCalendarWidget.tsx`) ya existían en `main`.

## Backlog (componentes 7 a 17)

| # | Componente | Dónde vive | Data que consume | Reutiliza | Le falta | Estimado |
|---|---|---|---|---|---|---|
| 7 | Records watch | Perfil de activo, box score | `careerLeaders()` más stats en vivo | `careerLeaders`, cinta | Stats 2024 y 2025 completas; hasta entonces "aproximado" | M |
| 8 | Jugadores parecidos | Perfil, espacio reservado | `insights/similarity.json` (1,398 jugadores) | Bloque del archivo tal cual | Nada | S |
| 9 | Arco de carrera | Perfil y comparador | `insights/career-arcs.json` | `CareerArcChart` (Recharts ya instalado) | Nada | S |
| 10 | Salón de MVPs | `/estadisticas/mvps` | `mvps.json` | `/archivo/mvps` | Fotos de retirados | S |
| 11 | Récords | `/estadisticas/records` | `records.json` | `/archivo/records` | Nada | S |
| 12 | Timeline de campeones | Playoffs, bajo el bracket | `champions.json` | `/archivo/campeones` | Nada | S |
| 13 | Cabeza a cabeza histórico | Comparar equipos, detalle de juego | Títulos por franquicia, finales entre ambos, series 2025 en adelante | Cinta, `SeriesContextRow` | Box scores históricos | M |
| 14 | Dynasty Tracker | Playoffs o Estadísticas | `champions.json` | `DynastyTracker` del archivo | Nada | S |
| 15 | Historias con data | `/estadisticas/en-numeros` | `insights/` | Las ocho vistas de `/archivo/en-numeros` | Nada | S cada una |
| 16 | Un día como hoy | Home | Fechas de finales, récords y debuts | Nada | Fechas anteriores a 2025 | M, bloqueado |
| 17 | Buscador tipo pregunta | Global | Catálogo de preguntas | `useUnifiedSearch` | Definir el catálogo | L |

## Lista para la liga

1. Tres títulos de los Vaqueros que faltan en `champions.json` (o confirmar que son 15).
2. Stats de jugadores de 2024 y 2025 (hoy solo campeón, MVP y, para 2025, rosters y stats del API).
3. Fotos de jugadores retirados y logos de las 16 franquicias extintas.
4. Fechas y sedes de series finales históricas, para "Un día como hoy" y cabeza a cabeza.
5. Ciudad de Taínos y Avancinos.
6. Identidad única por jugador entre el API y el histórico.
