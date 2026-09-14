# Componentes de la historia integrada

Cada componente: qué hace, qué data consume, dónde se monta, cómo se comporta sin data, qué extiende.

**CareerSummary.tsx** · Cinco números hero de carrera con tabs Carrera, Serie Regular y Postemporada, más una fila secundaria. Consume `ComparableStats` por fase (archivo más temporadas en vivo). Se monta en el perfil de jugador bajo el hero. Sin líneas de una fase, ese tab queda deshabilitado; los nulls son guion. Extiende `StatBlock` y `TAB_PILL` del archivo.

**CareerSeasonTable.tsx** · Tabla temporada por temporada con toggle Promedios y Totales, Serie Regular y Postemporada del mismo año juntas, All-Star colapsado. Consume `StatLine[]` del archivo más las líneas en vivo de 2025 y 2026. Se monta en el perfil. Una columna que la era nunca registró dice "no registrado"; sin líneas, no se monta. Extiende `StatsTable` del archivo.

**PlayerCompare.tsx** · Comparador de dos o tres jugadores con vistas Carrera, Serie Regular, Postemporada y Mejor temporada, toggle Promedios y Totales, ganador por fila y matriz para tres. Consume `ComparePlayer` armado en `/jugadores/comparar`. Sin selección muestra los slots vacíos; un activo sin historia compara solo sus temporadas en vivo con una línea que lo dice. Extiende `CompararClient` del archivo y el patrón de fila de Comparar equipos.

**FranchiseContextRibbon.tsx** · Una línea de contexto histórico enlazada a la historia de la franquicia. Consume `franchiseContextByCode` o `BySlug` y `franchiseContextLine` de `lib/copy.ts`. Se monta en el hero de equipo, en el header de juego programado (como texto), sobre el widget de Sportradar y en cada serie de playoffs. Sin franquicia o sin data de títulos no renderiza nada. Nuevo, sin equivalente previo.

**MatchContextStrip.tsx** · Franja en la banda ink con una cinta por equipo, para juegos en vivo y finalizados cuyo header es el widget de Sportradar. Consume los códigos de equipo del juego. Se monta en `/partidos/[id]` sobre `SportsRadarMatchPage`. Sin cintas no ocupa espacio. Envuelve `FranchiseContextRibbon`.

**AllTimeLeaders.tsx** · Líderes de carrera por categoría con los activos resaltados y "Ver los 50". Consume `careerLeaders()` y `activePlayerIds()` pasados desde `/estadisticas`. Se monta cuando `?vista=historico`. Las categorías sin data histórica no existen en la lista. Extiende `StatsTable`.

**FranchiseHistory.tsx** · Historia completa de una franquicia: contadores, campeonatos con dinastías, MVPs, líderes históricos, temporadas recientes y todos sus jugadores. Consume `franchises/{slug}.json` con colores del archivo. Se monta como pestaña Historia del equipo activo y como página de franquicia extinta. Los bloques sin data no aparecen; el timeline de reubicaciones se omitió por falta de data estructurada. Reutiliza la página de franquicia del archivo.

**FranchisePlayersList.tsx** · Lista de todos los que vistieron la camiseta con búsqueda y carga progresiva. Consume `FranchisePlayer[]`. Se monta dentro de `FranchiseHistory`. Sin resultados dice "Sin resultados para X". Nuevo.

**SeasonSelector.tsx** · Selector de temporada 1930 a 2026 con décadas como tabs, que navega a `/temporadas/[year]` o a la sección actual. Consume la lista de años. Se monta en el hero de la página de temporada; los heros de Calendario, Estadísticas y Playoffs lo montan por la misma ruta cuando se decida (ver backlog). Siempre tiene data. Nuevo, basado en el `Menu` de Comparar equipos.

**EraNotes.tsx** · Las notas de era que aplican según el año de debut más antiguo. Consume `eraNotes` de `lib/copy.ts`. Se monta bajo tablas y comparaciones. Sin notas no renderiza. Nuevo.
