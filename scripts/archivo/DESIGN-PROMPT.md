# Prompt para Claude Design · Archivo BSN

Adjuntar todos los archivos de `scripts/archivo/samples/` más `data/archivo/insights/coaches.json`, `mvp-champion-overlap.json`, `multi-mvps.json`, `longevity.json`, `records-by-decade.json` y el arco de Georgie Torres (`career-arcs.json`, playerId 788).

---

Vas a diseñar **Archivo BSN**, el archivo histórico y museo digital del Baloncesto Superior Nacional de Puerto Rico. Vive dentro de bsnpr.com como sección propia bajo `/archivo`.

## Sistema de diseño

Importa y respeta el design system de bsn-web en modo light que ya tienes disponible: tipografía (Barlow, Barlow Condensed, Special Gothic Condensed One), paleta, espaciado, componentes de tablas, cards, tags y navegación. No diseñes en dark mode. Archivo BSN es una sub-marca dentro de ese sistema: usa el wordmark "ARCHIVO BSN" en condensada itálica pesada y el rojo de la liga como acento. El tono nostálgico viene de la fotografía en blanco y negro con grano, del tratamiento editorial y de la tipografía, no de fondos oscuros.

## Referencias de intención

NBA History dentro de NBA.com. Basketball Reference en estructura de data pero con diseño de museo. Los archivos digitales de Wimbledon y del Tour de France. Lo que NO queremos: estética de dashboard con filtros arriba, cards translúcidas sobre gradientes, ni nada que se sienta como template.

## La data y sus estados

Diseña sobre los JSON adjuntos, no sobre data inventada. Hay que aguantar cuatro estados con el mismo layout, sin huecos ni mensajes de "no disponible":

1. **1930 a 1955**: solo campeón (dirigente y serie) y, desde 1951, MVP. Sin stats, sin rosters.
2. **1956 a 2023**: campeón, MVP, líderes por categoría, rosters con stats. Las temporadas 2015 en adelante tienen además standings por grupo (A y B), lista de juegos con marcador y fecha, y series de playoffs (cuartos, semifinales, final) con récord de la serie.
3. **2024 y 2025**: campeón y MVP, pero las stats históricas terminan en 2023. En 2025 los standings, rosters y stats de jugadores vienen del sistema actual de la liga y son reales.
4. **2026**: temporada en curso. Standings, juegos, series, rosters y stats reales. Sin campeón ni MVP todavía.

**Data FPO.** Para 2015 a 2024 no existen standings, juegos ni series reales; el archivo trae data de relleno marcada `fpo: true` por bloque (`results.fpo.standings`, `.games`, `.series`, `.rosters`, `.playerStats`). En 2025 los juegos y las series son FPO pero los standings son reales. Necesito un **badge o tratamiento visual de FPO** discreto pero inequívoco que se pueda poner sobre una tabla de standings, una lista de juegos o un bracket, y que desaparezca sin dejar rastro cuando la data sea real. Diséñalo una vez y muéstralo aplicado en la temporada 2022.

**Nulls.** Antes de 1965 no hay asistencias ni porcentajes de campo; robos y pérdidas no existen hasta 2000; bloqueos hasta 2001; triples hasta 1981; rebotes faltan en 2000 a 2004. Todo eso llega como `null` y se muestra con guion, nunca con cero. Cuando una tabla o un récord de una era completa no tiene esa stat, la celda dice "no registrado" en texto secundario, sin romper la grilla.

**Franquicias.** 28 franquicias, 12 activas con logo y color, 16 extintas sin logo (`logo: null`) pero con `colors.primary` cuando se conoce y siempre con apodo. Diseña el **placeholder de logo** para extintas: tipográfico, iniciales o apodo sobre el color de la franquicia, en tres tamaños (chip de 20px, avatar de 40px, hero de 120px). Debe verse intencional al lado de un logo real.

**Fotos de jugadores.** No hay. Diseña el **placeholder de foto** con iniciales sobre el color de la franquicia, en los mismos tres tamaños. Los jugadores de 2025 y 2026 pueden traer `avatarUrl`, casi siempre null.

## Reglas de idioma

Español de Puerto Rico. Se dice "juegos", nunca "partidos". Usa "el UX" y "el UI". Deja "responsive" en inglés. No uses em-dashes.

## Pantallas, en desktop y móvil

### Núcleo del archivo

1. **Home** (`/archivo`). Hero editorial con foto histórica en blanco y negro y el wordmark. Debajo, "Este año en la historia": campeón y MVP de hace 25, 50 y 75 años, cada uno con logo y foto. Luego accesos a las secciones (temporadas, jugadores, campeones, MVPs, récords, franquicias, en números, comparar, leyendas, galería) con una foto o dato representativo cada una. Cierra con el campeón y el MVP más recientes.

2. **Índice de jugadores** (`/archivo/jugadores`). Búsqueda prominente. Navegación alfabética. Filas limpias con nombre, años activos, logos pequeños de equipos y un dato de carrera. Debe aguantar 3,327 nombres: paginación o carga progresiva con ancla, nunca scroll infinito suelto.

3. **Perfil de jugador** (`/archivo/jugadores/[slug]`). La página más importante. Header con foto o placeholder, nombre, años activos, logos de equipos, badges de MVP (con conteo) y de campeonatos. Resumen de carrera con números grandes. Un botón "Comparar". Debajo del resumen, el **arco de carrera** (ver componente más abajo). Tabla temporada por temporada con columna fija del año en móvil, tabs para Serie Regular y Postemporada; las líneas de Postemporada vienen por ronda (Cuartos de Final, Semi Final, Serie Final). Al final, "Jugadores parecidos": tres cards con nombre, score de similitud y botón "Comparar". Si el jugador tiene biografía editorial en Leyendas, un enlace destacado. Diseña dos versiones: Georgie Torres (26 temporadas, todo con data) y Pachín Vicéns (1958 a 1966, sin asistencias ni porcentajes).

4. **Explorador de temporadas** (`/archivo/temporadas`). Navegación por década desde 1930 hasta 2026, años dentro de cada década, cada año como card con logo del campeón y nombre del MVP. Las cards de 1930 a 1955 solo tienen campeón.

5. **Página de temporada** (`/archivo/temporadas/[year]`). Header con el año grande, campeón con logo, dirigente y serie final, MVP con foto. Líderes por categoría en cards con foto y número grande. Rosters por equipo, colapsables. Para 2015 en adelante, tres módulos más: standings por grupo, resultados de playoffs como bracket o lista de series con récord, y lista de juegos por fecha con marcador. Diseña explícitamente 1975 (solo stats), 2022 (stats más resultados FPO con badge) y 2025 (standings reales, juegos FPO, stats de jugadores reales sin arco histórico).

6. **Campeones** (`/archivo/campeones`). Timeline vertical por década. Cada título con año, logo, dirigente y serie. Las dinastías se agrupan visualmente (Vaqueros 1971 a 1975, Cangrejeros 1998 a 2001). Arriba, resumen de títulos por franquicia. Once campeones de 1930 a 1945 son clubes que ya no existen y no tienen franquicia: se muestran con el nombre en texto y el placeholder de logo neutro.

7. **Salón de MVPs** (`/archivo/mvps`). Grid de cards con foto, nombre, año y equipo. Los MVPs múltiples se destacan. El MVP de 2019 jugó con dos equipos ese año.

8. **Página de franquicia** (`/archivo/franquicias/[slug]`). Header con logo grande o placeholder, ciudad, años activos, estado activa o extinta. Contadores: títulos, MVPs, temporadas. Campeonatos con años. Líderes históricos en puntos, rebotes y asistencias. Sus MVPs. Récord por temporada desde 2015 (con badge FPO donde aplique). Todos sus jugadores con enlace al perfil. Diseña Leones (activa, 14 títulos) y una extinta sin logo como Cardenales.

9. **Récords** (`/archivo/records`). Tabs de temporada y carrera. Cada récord como card con el número protagonista, jugador con foto, año y equipo.

### Comparación y análisis

10. **Cara a cara** (`/archivo/comparar`). Dos slots con búsqueda cada uno; hasta tres jugadores. Header por jugador con foto, nombre, años, logos, badges. Bloque de carrera con tabs Carrera, Serie Regular y Postemporada: cada fila es una comparación horizontal con la etiqueta al centro, un valor a cada lado y una barra proporcional bajo cada valor; el ganador de la fila se marca con color y peso tipográfico. Si un lado tiene null, guion y sin ganador. Nota de era bajo el bloque cuando alguno empezó antes de 1975. Debajo, el arco de carrera con las líneas superpuestas. Al final, jugadores parecidos de cada uno con botón para meterlos en el slot libre. Diseña el estado vacío, la comparación de 2 (Georgie Torres vs Quijote Morales) y la matriz de 3 con columna de etiqueta fija en móvil.

11. **El BSN en números** (`/archivo/en-numeros`). Índice como grid de cards, cada una con título editorial y un número hero. Y las siete vistas, cada una con título, un párrafo de contexto de dos líneas, el visual y un botón de compartir:
    - **Dirigentes**: barras horizontales por títulos, top 15, con los años como chips con logo bajo cada barra. "Julio Toro ganó doce campeonatos en cuatro décadas. Nadie está cerca."
    - **MVP y campeón**: número hero "16 de 74 veces, 21.6%". Timeline vertical por año con dos columnas, MVP y campeón; las filas donde coinciden se resaltan; se marcan la racha más larga de coincidencia (1959 a 1963) y de no coincidencia (1983 a 1996).
    - **Multi MVP**: timeline horizontal 1951 a 2025, una fila por jugador con puntos en los años que ganó, coloreados por franquicia; los de 4 arriba; badge para los que ganaron con más de un equipo. En móvil, vertical.
    - **Longevidad**: tabs por temporadas y por juegos; barras tipo gantt del año de inicio al de retiro.
    - **Lealtad**: dos columnas, "Un solo club" y "Trotamundos", con la secuencia de logos de cada jugador. En móvil, tabs.
    - **Club de los 20**: chips de umbral (15, 20, 25, 30); barras por década con cuántas temporadas superaron el umbral; lista de temporadas debajo.
    - **Récords por década**: una fila por década, columnas por categoría, celda con número, nombre, año y logo; las celdas sin data dicen "no registrado".
    Los visuales son divs con anchos proporcionales, no una librería de gráficas. Diseña el índice y las tres primeras vistas completas; las otras cuatro pueden ir como variantes del mismo patrón.

12. **Dinastías** (`/archivo/en-numeros/dinastias`). Bar chart race de títulos acumulados por franquicia de 1930 a 2025. Barras horizontales top 8 (top 6 en móvil), cada una con logo, nombre y número, color primario de la franquicia. Año grande en la esquina. Controles: play, pausa, scrubber por año, velocidad 1x y 2x. Estado inicial pausado en 2025. Captions breves en 1975, 2001 y 2009. Diseña el estado pausado, el estado en reproducción con un caption visible, y la versión con `prefers-reduced-motion` (selector de año sin animación).

### Editorial

13. **Leyendas** (`/archivo/leyendas`). Índice tipo revista con foto grande por leyenda. Página de biografía: foto hero, texto largo editorial, y un módulo automático con su perfil estadístico resumido, sus MVPs y sus campeonatos, enlazando al perfil completo. Estado vacío para cuando no haya posts.

14. **Equipos legendarios** (`/archivo/equipos-legendarios`). Índice con foto del equipo por entrada. Página: foto hero, texto editorial, roster de esa temporada con enlaces a perfiles, y enlace a la página de temporada. Estado vacío.

15. **Galería y videos** (`/archivo/galeria`). Grid de galerías por década y playlists de YouTube de juegos clásicos. Estado vacío elegante por década.

## Componentes a entregar aparte

- **Tabla de stats** reutilizable con sus estados: con data, con nulls, cargando, vacía. Columna izquierda fija y scroll horizontal con indicador visible en móvil.
- **Placeholder de foto de jugador** y **placeholder de logo de franquicia**, tres tamaños cada uno.
- **Badge FPO** aplicable a tabla, lista y bracket.
- **CareerArcChart**: eje X por número de temporada (1, 2, 3...) con toggle a año calendario; eje Y con selector de ppg, rpg y apg como chips; hasta tres líneas, una por jugador con color por jugador; el pico marcado con un punto más grande y su valor; marcador sutil donde el jugador cambia de franquicia; los puntos null interrumpen la línea sin interpolar; tooltip con año, equipo con logo, valor y juegos. Alto de 240px en móvil. Estados: menos de 3 temporadas (no se muestra) y stat no registrada en toda la carrera (mensaje de una línea).
- **Fila de comparación** (etiqueta al centro, valores a los lados, barras, ganador marcado) en sus variantes: dos jugadores, tres jugadores, con null de un lado, empate.
- **Sub-header del archivo** con el wordmark y navegación de secciones como tabs horizontales con scroll en móvil, y búsqueda accesible desde cualquier pantalla.

## Móvil

Mobile-first. Verifica todo en 375px. Tablas con columna izquierda fija y scroll horizontal con indicador visible. Navegación del archivo como tabs horizontales con scroll. Búsqueda accesible desde cualquier pantalla.

## Principios

1. Descubrimiento, no query. El archivo arranca con una historia; los filtros viven dentro de las secciones, no en la puerta.
2. Todo es un enlace. Año a temporada, equipo a franquicia, nombre a jugador, leyenda a perfil estadístico.
3. El jugador es la unidad central; su perfil tiene que ser la mejor página del archivo.
4. Cuatro estados de data, un solo diseño.
5. Contraste y legibilidad primero: mínimo 4.5:1.
6. Los nulls se respetan: guion o "no registrado", nunca cero.
7. Lo FPO se ve como FPO.
