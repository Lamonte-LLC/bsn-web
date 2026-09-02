# Prompt 2 · Cara a cara: jugador vs jugador

(Pegar después del bloque BASE. Asume que el Prompt 1 ya se diseñó; reusa su perfil de jugador, sus placeholders y sus chips.)

**Adjuntar:** `player-carrera-larga-georgie-torres.json`, `player-pre-1970-con-nulls-pachin-vicens.json`, `players-index-primeros-50.json`, `franchises.json`, y las capturas `screenshots/comparar-desktop.png`, `comparar-mobile-2.png`, `comparar-search.png`.

---

Vas a diseñar `/archivo/comparar`, la comparación de jugadores de Archivo BSN. Ya existe una versión funcional (ver capturas): úsala para el contenido y el flujo, no para la estética.

## Flujo

- Sin jugadores: dos slots vacíos, cada uno con un campo de búsqueda. El slot A tiene el foco. Una línea de ayuda: "Busca por nombre o apellido, sin acentos".
- Al escribir, un dropdown con hasta ocho resultados: avatar, nombre, años activos, logos de franquicias. La búsqueda encuentra apodos (buscar "Georgie" da George Torres Dougherty). Estados: cargando índice, sin resultados.
- Con dos jugadores, la URL lleva `?a=slug&b=slug` y es compartible. Cada slot tiene "Cambiar".
- Hasta tres jugadores (`?c=`); diseña la de dos como principal y la de tres como matriz.

## Header por jugador

Card por slot: avatar, nombre enlazado al perfil, años, logos de franquicias, badges de MVP (con conteo) y de títulos, una línea de color de identidad del slot (no de franquicia) que se repite en el arco de carrera. El slot B se alinea a la derecha para que la comparación se lea como espejo.

## Bloque de comparación

Tabs Carrera, Serie Regular, Postemporada. Filas: juegos, temporadas, puntos totales, PPJ, RPJ, APJ, robos, bloqueos, pérdidas, TC%, 3P%, TL%. Cada fila: etiqueta al centro, un valor a cada lado y una barra proporcional bajo cada valor. El ganador de la fila va en el rojo de la liga, con su barra en rojo; el otro lado atenuado. Empate: ninguno marcado. Si un lado tiene null: guion y sin ganador. Las filas donde ambos tienen null no aparecen. Menor gana en pérdidas por juego.

Bajo el bloque, una línea de fuente: "Carrera usa los totales publicados por la liga; Serie Regular y Postemporada se suman de las temporadas. Mayor gana, salvo en pérdidas por juego." Si alguno debutó antes de 1975, agrega: "Rebotes, asistencias y triples no se registraban de forma consistente antes de 1975. Los guiones indican data no disponible."

## Arco de carrera

Debajo del bloque, el componente del Prompt 4 con las líneas superpuestas en los colores de slot.

## Jugadores parecidos

Para cada jugador, sus tres más parecidos con score y un botón "Comparar" que lo mete en el otro slot.

## Móvil

En 375px la fila de etiqueta al centro y valores a los lados cabe con etiquetas cortas (J, TEMP., PTS, PPJ, RPJ, APJ, ROB, BLQ, PÉR, TC%, 3P%, TL%); verifica con 15,863 a cada lado. Con tres jugadores, matriz con la etiqueta en columna fija a la izquierda y scroll horizontal con indicador.

## Entrega

Estado vacío, búsqueda abierta con resultados, comparación de dos (George Torres Dougherty vs Mario 'Quijote' Morales Micheo), comparación de tres, variantes de fila (ganador, empate, null de un lado). Desktop y móvil.
