# Prompt 1 · Archivo BSN, núcleo del proyecto

(Pegar después del bloque BASE.)

**Adjuntar:** todo `samples/` (`players-index-primeros-50.json`, `player-carrera-larga-georgie-torres.json`, `player-pre-1970-con-nulls-pachin-vicens.json`, `season-1975-solo-stats.json`, `season-2022-stats-mas-results-fpo.json`, `season-2025-results-reales.json`, `franchise-leones.json`, `franchises.json`, `champions.json`, `mvps.json`, `records.json`) y las capturas `screenshots/profile-desktop.png`, `profile-mobile.png`, `season-desktop.png`, `home-mobile.png`.

---

Vas a diseñar el núcleo de Archivo BSN: nueve pantallas de data, tres editoriales y los componentes base. Ya existe una implementación funcional en código (ver capturas) construida sobre el layout de bsn-web; úsala para entender el contenido real y la estructura de cada página, no como referencia estética. Tu diseño define la versión definitiva.

## La data y sus cuatro estados

Diseña sobre los JSON adjuntos. Cada pantalla que muestre una temporada tiene que funcionar en los cuatro estados con el mismo layout, sin huecos ni mensajes de "no disponible":

1. **1930 a 1955**: solo campeón (nombre completo del club, dirigente y serie) y, desde 1951, MVP. Sin stats, sin rosters. Once de esos campeones son clubes que ya no existen y no tienen franquicia (Fénix de Vega Baja, Capitalinos de San Juan, All San Germán, etc.): se muestran con su nombre y el placeholder de logo neutro.
2. **1956 a 2023**: campeón, MVP, líderes por categoría, rosters con stats. Desde 2015 tienen además standings por grupo (A y B), lista de juegos con marcador y fecha, y series de playoffs con récord.
3. **2024 y 2025**: campeón y MVP, pero las stats históricas terminan en 2023. En 2025 los standings, rosters y stats de jugadores son reales y vienen del sistema actual de la liga.
4. **2026**: temporada en curso, todo real, sin campeón ni MVP todavía.

**Data FPO.** Para 2015 a 2024 no existen standings, juegos ni series reales; el archivo trae relleno marcado `results.fpo.{standings,games,series,rosters,playerStats}`. En 2025 los juegos y series son FPO pero los standings son reales. Diseña un **badge FPO** discreto pero inequívoco, aplicable a una tabla de standings, una lista de juegos o un bracket, que desaparezca sin dejar rastro cuando la data sea real. Muéstralo aplicado en la temporada 2022.

**Nulls.** Antes de 1965 no hay asistencias ni porcentajes de campo; robos y pérdidas empiezan en 2000; bloqueos en 2001; triples en 1981; faltan rebotes en 2000 a 2004. Guion, nunca cero. Cuando toda una era carece de una stat, la celda dice "no registrado" en secundario.

**Franquicias.** 28: 12 activas con logo y color oficial; 16 extintas sin logo (`logo: null`), con un color provisional (`colorSource: "prototype"`) y apodo. Diseña el **placeholder de logo** para extintas: tipográfico (abreviatura de tres letras) sobre el color de la franquicia, en tres tamaños (chip 20px, avatar 40px, hero 120px). Debe verse intencional al lado de un logo real.

**Fotos de jugadores.** No hay. Placeholder con iniciales en el color de la franquicia sobre el mismo color al 10%, tres tamaños. Sobre la banda oscura del hero las iniciales van en el color de la franquicia o en blanco si el color es muy oscuro.

## Pantallas (desktop y móvil, 375px primero)

1. **Home** (`/archivo`). Hero editorial con foto histórica en blanco y negro y el wordmark. "Este año en la historia": campeón y MVP de hace 25, 50 y 75 años (en 2026: 2001, 1976, 1951), con logo y foto. Accesos a las secciones con un dato representativo real cada una (95 títulos, 3,327 jugadores, 75 MVPs, 28 franquicias), no cards idénticas con icono. Cierra con el campeón y el MVP más recientes.

2. **Índice de jugadores** (`/archivo/jugadores`). Búsqueda prominente que también encuentra apodos (buscar "Georgie" da George Torres Dougherty). Navegación alfabética como fila de chips con scroll en móvil. Filas de 44px mínimo con avatar, nombre, años activos, logos pequeños de sus franquicias y puntos de carrera. 3,327 nombres: paginación o "cargar más" con ancla, nunca scroll infinito suelto. Estados: cargando el índice, sin resultados.

3. **Perfil de jugador** (`/archivo/jugadores/[slug]`). La página más importante. Header sobre la banda: avatar hero, nombre, años y temporadas, chips de franquicias enlazadas, badges de MVP (con años) y campeonatos (con años), botón "Comparar". Resumen de carrera con ocho números grandes (juegos, puntos, PPJ, RPJ, APJ, TC%, 3P%, TL%) y una línea de fuente. Debajo, el arco de carrera (componente del Prompt 4). Tabla temporada por temporada con tabs Serie Regular, Postemporada (líneas por ronda: Cuartos de Final, Semi Final, Serie Final) y Otros (All-Star, pretemporada): columna fija del año, ordenable, fila de Total fija al final. Al cierre, "Jugadores parecidos": tres con score de similitud y botón "Comparar". Diseña dos versiones: George Torres Dougherty (26 temporadas, data completa) y Pachín Vicéns (1958 a 1966, sin asistencias ni porcentajes de campo, con la nota de era).

4. **Explorador de temporadas** (`/archivo/temporadas`). Chips de década con scroll, luego cada década con sus años como cards: año grande, logo del campeón, nombre del campeón, nombre del MVP. 1930 a 1955 solo campeón.

5. **Página de temporada** (`/archivo/temporadas/[year]`). Navegación año anterior y siguiente. Año enorme, campeón (logo, nombre completo, dirigente, serie) y MVP (foto, nombre, equipo, posición). Para 2015 en adelante: standings por grupo (posición, G, P, %, PPJ) con badge FPO cuando aplique; series de playoffs como cards por ronda con siembra y récord; resultados con los juegos de playoffs visibles y la Serie Regular colapsada. Líderes por categoría (ocho cards, top 5, el primero destacado con foto y número grande). Rosters por equipo colapsables con tabla ordenable. Diseña explícitamente 1975, 2022 y 2025.

6. **Campeones** (`/archivo/campeones`). Arriba, títulos por franquicia como chips con logo y número. Timeline vertical por década: año, logo, nombre completo, dirigente, serie. Cuando una franquicia repite el año anterior, la fila lo marca (dinastías Vaqueros 1971 a 1975, Cangrejeros 1998 a 2001).

7. **Salón de MVPs** (`/archivo/mvps`). Grid de cards: foto, año, nombre, logo y apodo del equipo, posición. Los MVPs múltiples se distinguen. El MVP de 2019 jugó con dos equipos.

8. **Página de franquicia** (`/archivo/franquicias/[slug]`). Header con logo hero o placeholder, ciudad, años activos, estado, nota cuando el logo está pendiente. Contadores: títulos, MVPs, temporadas. Campeonatos como chips de año con la serie. MVPs como chips. Líderes históricos en tres tablas ordenables (puntos, rebotes, asistencias). Récord por temporada desde 2015 con badge FPO por fila. Todos sus jugadores en columnas con sus años. Diseña Leones (activa, 14 títulos) y Cardenales (extinta, sin logo).

9. **Récords** (`/archivo/records`). Dos secciones, de temporada y de carrera. Cada categoría una card: número protagonista, jugador con foto, año y equipo, y el top 5 debajo.

## Editorial (con estado vacío)

10. **Leyendas** (`/archivo/leyendas`). Índice tipo revista con foto grande. Biografía: foto hero, texto largo editorial a 68 a 72 caracteres por línea, y un módulo automático con su resumen estadístico, MVPs y campeonatos enlazando al perfil.

11. **Equipos legendarios** (`/archivo/equipos-legendarios`). Índice con foto del equipo. Página: foto hero, texto, roster de esa temporada con enlaces a perfiles, enlace a la temporada.

12. **Galería y videos** (`/archivo/galeria`). Grid de galerías por década y playlists de YouTube. Estado vacío por década.

## Componentes a entregar aparte, con todos sus estados

- **Sub-header del archivo**: wordmark, navegación de nueve secciones como tabs con scroll horizontal y activo visible, acceso a búsqueda.
- **Tabla de stats**: columna fija, cabecera fija, ordenable con indicador de dirección, filas de 44px en móvil, fila de total, estados con data, con nulls, cargando, vacía.
- **Placeholder de foto** y **placeholder de logo**, tres tamaños cada uno.
- **Badge FPO** sobre tabla, lista y bracket.
- **Card de líder y de récord** (foto, nombre, número hero, contexto, todo el card es tap).
- **Chips** de año, de franquicia y de filtro, en default, hover, activo, focus.
