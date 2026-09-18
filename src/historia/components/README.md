# Componentes de la historia integrada

Cada componente: qué hace, qué data consume, dónde se monta, cómo se comporta sin data, qué extiende.

**PlayerSeasonTable.tsx** · Tabla temporada por temporada con la fila Carrera al pie, píldoras Promedios y Totales y select Serie regular y Postemporada (solo si hay postemporada), ambos del design system. Consume `StatLine[]` del archivo más las líneas en vivo con minutos. Se monta en el perfil. Las columnas que nadie registró no aparecen; las celdas sin dato son guion; All-Star colapsado. Sustituye a CareerSummary y CareerSeasonTable: la banda del perfil lleva los tres números y la ficha, como nba.com.

**Callout.tsx** · Salvedad en cajita: fondo suave, icono en disco (reloj, tabla, info), título y texto. Sin bordes de color. La usan `EraNotes`, el perfil y la página de temporada.

**compare/** · Comparador de dos a cuatro jugadores calcado de `/comparar-equipos`: `PlayerCompareHero` (slots con círculo en color de equipo, X para quitar, VS, píldora de temporada o carrera, añadir), `PlayerPickerDialog` (buscador del índice unificado más los líderes de la temporada como sugeridos), `PlayerComparePanel` (tabs de sección, fila fija de jugadores con subrayado de color, filas espejo con ganador en tinta y punto de color), `PlayerCompareEmptyCard` y `useCompareState` (la selección vive en `?p=a,b,c,d`; el alcance y el diálogo son estado de cliente). Consume `ComparePlayerData` armado en `/jugadores/comparar` desde `lib/compare-players.ts`. El alcance por defecto es la temporada más reciente que todos jugaron, o la carrera si nunca coincidieron; las filas que nadie tiene se ocultan. Un activo sin historia compara solo sus temporadas en vivo con una línea que lo dice. Sin gráficas de barras ni exportar a PDF (backlog).

**season/** · Página de temporada: `SeasonTabs` (píldoras secundarias del design system, un panel a la vez, solo las pestañas con data), `SeasonPanels` (posiciones por grupo con %, PPJ y diferencia; playoffs en una lista lineal con ganador, juegos y eliminado; líderes en dos columnas con enlace Top 10) y `SeasonTeams` (piezas iguales por equipo; el roster se abre justo debajo de la fila de la pieza tocada, dos por fila en móvil y cuatro en escritorio). Consume las vistas puras de `lib/season-view.ts` (con tests), que sirven igual a 1968 y a 2026. Las series marcadas FPO se muestran con una salvedad. `SeasonSelector` ganó la variante `group` (anterior · Temporada · siguiente) para la banda.

**FranchiseContextRibbon.tsx** · Una línea de contexto histórico enlazada a la historia de la franquicia. Consume `franchiseContextByCode` o `BySlug` y `franchiseContextLine` de `lib/copy.ts`. Se monta en el hero de equipo, en el header de juego programado (como texto), sobre el widget de Sportradar y en cada serie de playoffs. Sin franquicia o sin data de títulos no renderiza nada. Nuevo, sin equivalente previo.

**MatchContextStrip.tsx** · Franja en la banda ink con una cinta por equipo, para juegos en vivo y finalizados cuyo header es el widget de Sportradar. Consume los códigos de equipo del juego. Se monta en `/partidos/[id]` sobre `SportsRadarMatchPage`. Sin cintas no ocupa espacio. Envuelve `FranchiseContextRibbon`.

**AllTimeLeaders.tsx** · Líderes de carrera por categoría con los activos resaltados y "Ver los 50". Consume `careerLeaders()` y `activePlayerIds()` pasados desde `/estadisticas`. Se monta cuando `?vista=historico`. Las categorías sin data histórica no existen en la lista. Extiende `StatsTable`.

**FranchiseHistory.tsx** · Historia de una franquicia, apilada y toda en tinta: fila de cuatro contadores, campeonatos en tabla (Año · Dirigente · Final) con las rachas como filas de grupo, líderes históricos con píldoras y números grandes, MVPs en tabla, temporadas resumidas por década y todos los jugadores. Las columnas numéricas comparten un ancho fijo para que el ritmo sea el mismo en todas las tablas. Se monta como pestaña Historia del equipo activo y como página de franquicia extinta.

**FranchiseFullTable.tsx** · Todos los que vistieron la camiseta como tabla (Jugador · Años · Temporadas) con buscador, filtro Todos | Activos y Cargar 20 más. Sin resultados dice "Sin resultados para X".

**SeasonSelector.tsx** · Selector de temporada 1930 a 2026 con décadas como tabs, que navega a `/temporadas/[year]` o a la sección actual. Consume la lista de años. Se monta en el hero de la página de temporada; los heros de Calendario, Estadísticas y Playoffs lo montan por la misma ruta cuando se decida (ver backlog). Siempre tiene data. Nuevo, basado en el `Menu` de Comparar equipos.

**EraNotes.tsx** · Las notas de era que aplican según el año de debut más antiguo. Consume `eraNotes` de `lib/copy.ts`. Se monta bajo tablas y comparaciones. Sin notas no renderiza. Nuevo.
