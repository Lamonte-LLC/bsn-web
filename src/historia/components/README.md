# Componentes de la historia integrada

Cada componente: qué hace, qué data consume, dónde se monta, cómo se comporta sin data, qué extiende.

**PlayerSeasonTable.tsx** · Tabla temporada por temporada con la fila Carrera al pie, píldoras Promedios y Totales y select Serie regular y Postemporada (solo si hay postemporada), ambos del design system. Consume `StatLine[]` del archivo más las líneas en vivo con minutos. Se monta en el perfil. Las columnas que nadie registró no aparecen; las celdas sin dato son guion; All-Star colapsado. Sustituye a CareerSummary y CareerSeasonTable: la banda del perfil lleva los tres números y la ficha, como nba.com.

**Callout.tsx** · Salvedad en cajita: fondo suave, icono en disco (reloj, tabla, info), título y texto. Sin bordes de color. La usan `EraNotes`, el perfil y la página de temporada.

**compare/** · Comparador de dos a cuatro jugadores calcado de `/comparar-equipos`: `PlayerCompareHero` (slots con círculo en color de equipo, X para quitar, VS, píldora de temporada o carrera, añadir), `PlayerPickerDialog` (buscador del índice unificado más los líderes de la temporada como sugeridos), `PlayerComparePanel` (tabs de sección, fila fija de jugadores con subrayado de color, filas espejo con ganador en tinta y punto de color), `PlayerCompareEmptyCard` y `useCompareState` (la selección vive en `?p=a,b,c,d`; el alcance y el diálogo son estado de cliente). Consume `ComparePlayerData` armado en `/jugadores/comparar` desde `lib/compare-players.ts`. El alcance por defecto es la temporada más reciente que todos jugaron, o la carrera si nunca coincidieron; las filas que nadie tiene se ocultan. Un activo sin historia compara solo sus temporadas en vivo con una línea que lo dice. Sin gráficas de barras ni exportar a PDF (backlog).

**FranchiseContextRibbon.tsx** · Una línea de contexto histórico enlazada a la historia de la franquicia. Consume `franchiseContextByCode` o `BySlug` y `franchiseContextLine` de `lib/copy.ts`. Se monta en el hero de equipo, en el header de juego programado (como texto), sobre el widget de Sportradar y en cada serie de playoffs. Sin franquicia o sin data de títulos no renderiza nada. Nuevo, sin equivalente previo.

**MatchContextStrip.tsx** · Franja en la banda ink con una cinta por equipo, para juegos en vivo y finalizados cuyo header es el widget de Sportradar. Consume los códigos de equipo del juego. Se monta en `/partidos/[id]` sobre `SportsRadarMatchPage`. Sin cintas no ocupa espacio. Envuelve `FranchiseContextRibbon`.

**AllTimeLeaders.tsx** · Líderes de carrera por categoría con los activos resaltados y "Ver los 50". Consume `careerLeaders()` y `activePlayerIds()` pasados desde `/estadisticas`. Se monta cuando `?vista=historico`. Las categorías sin data histórica no existen en la lista. Extiende `StatsTable`.

**FranchiseHistory.tsx** · Historia completa de una franquicia: contadores, campeonatos con dinastías, MVPs, líderes históricos, temporadas recientes y todos sus jugadores. Consume `franchises/{slug}.json` con colores del archivo. Se monta como pestaña Historia del equipo activo y como página de franquicia extinta. Los bloques sin data no aparecen; el timeline de reubicaciones se omitió por falta de data estructurada. Reutiliza la página de franquicia del archivo.

**FranchisePlayersList.tsx** · Lista de todos los que vistieron la camiseta con búsqueda y carga progresiva. Consume `FranchisePlayer[]`. Se monta dentro de `FranchiseHistory`. Sin resultados dice "Sin resultados para X". Nuevo.

**SeasonSelector.tsx** · Selector de temporada 1930 a 2026 con décadas como tabs, que navega a `/temporadas/[year]` o a la sección actual. Consume la lista de años. Se monta en el hero de la página de temporada; los heros de Calendario, Estadísticas y Playoffs lo montan por la misma ruta cuando se decida (ver backlog). Siempre tiene data. Nuevo, basado en el `Menu` de Comparar equipos.

**EraNotes.tsx** · Las notas de era que aplican según el año de debut más antiguo. Consume `eraNotes` de `lib/copy.ts`. Se monta bajo tablas y comparaciones. Sin notas no renderiza. Nuevo.
