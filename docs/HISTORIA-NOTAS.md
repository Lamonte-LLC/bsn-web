# Historia integrada · Notas de lectura previas al código

Rama `feature/historia-integrada`, creada desde `origin/main` (3c93942) con `archivobsn` fusionado encima (fc8842b), porque el brief exige ramificar desde `main` y a la vez conservar `app/archivo/`, que solo existía en `archivobsn`. Fecha: 14 de septiembre de 2026.

## 1. `docs/DESIGN-BASE.md`

Es el estándar de todo lo que se construye aquí. Manda sobre cualquier detalle del brief y sobre los hábitos del sitio actual. Lo esencial: el rojo `#E51F1F` solo como acento (wordmark, nav activa, ganador de comparación, chip activo del alfabeto, número hero); colores de franquicia solo en elementos de esa franquicia; máximo tres niveles tipográficos por pantalla; cifras en tabular figures; espaciado semántico y no uniforme; cuerpo nunca bajo 15px en móvil. La sección 3 prohíbe glass, gradientes, iconos decorativos, badges pastel, hover-lift y dashboards de filtros. La sección 7 define la tabla de stats: columna izquierda fija, cabecera fija, ordenable con dirección visible, filas de 44px en móvil, nulls como guion. Los ocho estados de todo control interactivo son obligatorios.

Conflicto a tener en cuenta: el sitio actual usa `glass-match-card` y `#D5D5D5`/`#EAEAEA` en cards y tabs, y en `/estadisticas` la tabla es un widget de Sportradar que no controlamos. La base aplica a los módulos nuevos; los existentes se integran sin rediseñarlos, como pide la sección C.4 del brief. Donde un módulo nuevo conviva con uno viejo (perfil de jugador), el nuevo respeta la base y hereda del viejo solo la posición y el ritmo vertical.

## 2. Las secciones actuales

**Patrón común.** Toda página es `FullWidthLayout divider subheader={hero oscuro}` con `main` en `#fdfdfd` y cada bloque dentro de `.container` (padding lateral 1rem, ancho máximo 68rem en lg y 79rem en xl). Las páginas son Server Components que llaman `getClient().query()`; los widgets `'use client'` usan `useQuery` contra el proxy `/api/graphql`. No existe un componente compartido de tabs, toggle, select ni badge: cada página duplica el pill oscuro (`data-selected:bg-[#0F171F]`) inline. `Tag.tsx`, `SeasonDropdown.tsx`, `StatsFiltersBox.tsx` y `PlayerStatsFilter.tsx` existen sin uso. El único estado de temporada real en runtime es `seasonProviderId` en `/comparar-equipos`, con un `Menu` de Headless UI en `CompareHero.tsx:320-350`; el resto muestra `currentSeason.name` como texto o lo tiene hardcodeado ("Calendario 2026", "Líderes de Playoffs 2026").

**Jugadores.** `/jugadores` lista el roster de la temporada con `SEASON_PLAYERS_CONNECTION` (500, dedupe por `providerId`), búsqueda y select de equipo en `JugadoresPageClient.tsx`. `/jugadores/[slug]` recibe el **`providerId` (UUID) como slug** y consulta `PLAYER_PROFILE`. El hero trae foto, nombre, equipo, el bloque de cuatro stats de la temporada (inline en `page.tsx:147-191`, no es componente) y una fila de bio. Debajo, un `TabGroup` con Promedios, Totales y Juego por juego; los dos primeros ya son tablas temporada por temporada (`playerStatsConnection`), pero solo con lo que el API conoce (2025 en adelante). No hay concepto de retirado ni de carrera histórica.

**Equipos.** `/equipos/[slug]` recibe el **código de tres letras** (`BAY`, `PON`), hace `toUpperCase()` y consulta `TEAM_DETAIL`. Hero con logo en círculo del color de marca, nombre y récord. Cinco tabs de Headless UI en estado de cliente sin URL (Resumen, Calendario, Jugadores, Estadísticas, Líderes); el tab se pierde al recargar. Los logos no vienen del API: `TEAM_LOGOS` en `TeamLogoAvatar.tsx` mapea código a `/assets/images/teams/{Ciudad}.png`. Los colores hex viven en `boletos/teams.ts` y están duplicados en `compare/teams.ts` y `playoffs/data.ts`. `/equipos` es un placeholder vacío; la navegación a equipos es el popover del Header.

**Estadísticas.** La tabla de líderes de `/estadisticas` es el widget de Sportradar (`statistics_persons`), inyectado por script y estilizado desde `globals.css`. **No es anotable desde React**: no se pueden resaltar filas ni añadir un indicador junto al nombre. Los leaderboards propios que sí existen son `SeasonPlayerLeadersCard` y `MatchPlayerLeadersCard` (card con lista de filas `position, player, statValue`), sin prop de resaltado. El tab Jugadores/Equipos vive en un store `useSyncExternalStore` sincronizado con `?tab=`.

**Calendario.** `LeagueCalendarWidget` navega por rango de fechas dentro del año actual (`RECENT_CALENDAR`), con `CalendarSidebar` mensual. Sin temporada.

**Playoffs.** `PlayoffsHero` con bracket propio (`PlayoffsBracket`, cards glass, 5 columnas) y `PlayoffsPageClient` con `SeriesCard` por serie. Oculto en nav mientras `SEASON_IN_PROGRESS = false`. Sin temporada.

**Comparar equipos.** `useCompareSelection` (códigos seleccionados y `seasonProviderId`), `CompareTeamPickerDialog`, y `CompareStatsPanel` con el patrón de fila `valor · etiqueta · valor` y ganador en ink (`StatRowTwo`). Es el patrón de comparación del sitio y el comparador de jugadores debe rimar con él.

**Detalle de juego.** `/partidos/[id]` con `providerId` de UUID. Para juegos programados el header es `ScheduledMatchScoreBoard` y tiene un slot de texto por equipo (nickname, ciudad, récord) donde cabe una cuarta línea. Para juegos en vivo y finalizados el header es el banner de Sportradar: no hay slot React; solo se puede montar una franja encima del widget en `SportsRadarMatchPage.tsx:46`.

## 3. El prototipo `app/archivo/`

Vive en `src/app/archivo/` (20 rutas) y `src/archivo/` (componentes, hooks y lib). Todo reutilizable porque ya sigue `DESIGN-BASE.md` y los diseños de Claude Design.

| Se reutiliza tal cual | Se adapta | Se rehace |
|---|---|---|
| `StatsTable` + `SortableTable` + `Scrollable` (tabla con columna fija, orden, indicador honesto), `FranchiseLogo`, `PlayerAvatar`, `FpoBadge`, `LeaderCard`, `CareerArcChart`, `lib/tokens.ts`, `lib/color.ts`, `lib/format.ts`, `lib/names.ts`, `lib/stats.ts` (comparables por fase), `hooks/usePlayerSearch.ts` (índice por prefijo sin acentos, con aliases), `ui.tsx` (Button, Badge, Chip, YearChip, AlphaChip, StatBlock, EraNote, EmptyState, Skeleton, NotRecorded) | `CompararClient` (añadir toggle Promedios/Totales y vista Mejor temporada; hoy solo compara promedios), `PlayerSeasonTabs` (añadir toggle Promedios/Totales y agrupar regular y postemporada por año), `temporadas/[year]/page.tsx` (pasa a `/temporadas/[year]` con selector y navegación), `franquicias/[slug]/page.tsx` (pasa a pestaña Historia y a `/equipos/historicos/[slug]`), `InsightPage` y las vistas de `en-numeros` (backlog 15) | `ArchivoShell` y `ArchivoNav` no se usan: los módulos se montan dentro de `FullWidthLayout` y del header del sitio. El home de `/archivo` desaparece como concepto |

`Tabs.tsx` del archivo es un pill de Headless UI equivalente al que el sitio duplica inline; se usa para los toggles nuevos. `data.ts` (server-only, lee `data/archivo/` con caché) es el acceso a toda la data histórica y se mantiene.

## 4. El data layer e identidad

**Dos mundos.** El vivo, por GraphQL (`BSN_GRAPHQL_URI` en servidor, `/api/graphql` en cliente), identifica jugadores por `providerId` (UUID) y equipos por `code` (tres letras), y solo conoce las temporadas 2025 y 2026. El histórico, en `data/archivo/`, identifica jugadores por `id` numérico y `slug` de nombre, y franquicias por `slug`; `franchises.json` trae el `code` de bsn-web para las 12 activas, así que **equipo vivo a franquicia histórica se resuelve por código** sin ambigüedad (más `EXTRA_CODES` para cinco extintas que el API sí nombró). Los aliases de franquicia modelan reubicaciones como una sola franquicia (Indios de Canóvanas y de Mayagüez; Gigantes de Carolina y de Canóvanas) y homónimos como franquicias distintas (Gallitos de Isabela y Gallitos UPR). No hay data estructurada de reubicaciones con fechas: el módulo de timeline del componente 5 se omite y va al backlog.

**Jugador vivo a jugador histórico es el problema real.** El ETL cruza por nombre normalizado exacto y único (`etl-results.ts:243-253`) e ignora los aliases del índice. Resultado: 74 de 205 activos de 2026 enlazados. De los 131 sin enlazar, unos 100 son importados o novatos sin carrera en `bsn_data` (que termina en 2023) y unos 25 son normalización: el API da un apellido, el archivo dos ("Alex Abreu" vs "Álex Abreu Vázquez"; "Angel Rodriguez" existe con ese alias exacto). Un cruce por nombre y primer apellido sube a ~27 más, pero con falsos positivos evidentes (D J Wilson contra D.J. Strawberry) si no se acota. Decisión: el puente `src/historia/lib/identity.ts` cruza en tres pasos, exacto, alias, y nombre más primer apellido único entre jugadores con `ly >= 2015`; lo que no cruce es el estado de diseño "carrera histórica en proceso de vinculación" del brief. Para el prototipo la data de 2026 (rosters, stats, juegos, standings) se lee de `seasons/2026.json`, que ya es real; el backend en desarrollo no importa aquí.

**Pruebas.** No hay test runner ni ningún test en el repo. Los módulos puros de `src/historia/lib/` se prueban con `node --test --experimental-strip-types`, sin dependencias nuevas, como ya corren los scripts del archivo.

## 5. Validación B.3 contra la data del proyecto

| Referencia del brief | Data del proyecto | Diferencia |
|---|---|---|
| Georgie Torres 15,863 puntos; Quijote 15,293 | 15,863 y 15,293 | Ninguna |
| Neftalí Rivera, 79 puntos en un juego, 22 de mayo de 1974 | No hay box scores históricos | No se puede validar ni mostrar |
| Vaqueros 18 títulos, cinco al hilo 1971 a 1975 | **15 títulos**, cinco al hilo 1971 a 1975 | La data tiene 15, la cinta dirá "15 títulos" |
| Julio Toro 12 | 12 | Ninguna |
| MVPs con 4: Pachín Vicéns, Teófilo Cruz, Quijote Morales | Los mismos tres | Ninguna |
| Longevidad: Teófilo Cruz 25 temporadas | Cruz tiene 25, pero el tope es **Mario Butler con 29** | El brief cita un dato que no es el récord |

La data del proyecto manda. La discrepancia de los Vaqueros conviene levantarla a la liga: o faltan tres títulos en `champions.json` o la cifra de 18 mezcla otra competencia.

## 6. Decisiones de estructura

- Código nuevo en `src/historia/{components,lib}` y `types/historia.ts` (el brief dice `components/historia/`; en este repo los dominios viven bajo `src/`).
- Rutas nuevas: `/jugadores/comparar`, `/temporadas/[year]`, `/equipos/historicos` y `/equipos/historicos/[slug]`. El perfil de jugador y la ficha de equipo se extienden en sus rutas actuales.
- La pestaña Historia de equipo y el selector de temporada persisten en la URL (`?tab=historia`, `?temporada=1984`), aunque los tabs actuales del equipo no lo hagan; se documenta como mejora aparte.
- `Estadísticas` en vista "Todos los tiempos" no puede reusar la tabla de Sportradar: se monta un leaderboard propio con `StatsTable` del archivo, con activos resaltados, y el toggle vive en `EstadisticasHero` junto al tab actual.
- La cinta de contexto en el detalle de juego se monta solo en el header de juegos programados (único slot React); en juegos en vivo y finalizados va en una franja sobre el widget. Anotado.
