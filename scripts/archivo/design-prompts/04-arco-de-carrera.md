# Prompt 4 · CareerArcChart, el arco de carrera

(Pegar después del bloque BASE. Es un componente; se monta en el perfil de jugador del Prompt 1 y en la comparación del Prompt 2.)

**Adjuntar:** de `data/archivo/insights/career-arcs.json` los arcos de los playerId 788 (George Torres Dougherty, 26 temporadas), 1327 (Pachín Vicéns, 9 temporadas con asistencias null) y 1630 (Mario 'Quijote' Morales Micheo); `franchises.json`; capturas `screenshots/arc-georgie.png`, `arc-pachin-mobile.png`, `arc-compare.png`.

---

Vas a diseñar el componente **CareerArcChart**: una línea por jugador (hasta tres) que muestra cómo evolucionó una estadística a lo largo de su carrera. Ya existe una versión funcional con Recharts (ver capturas).

## Data

Cada punto: `seasonNumber` (1, 2, 3...), `year`, `franchiseSlug`, `ppg`, `rpg`, `apg`, `g`. Un punto por año de Serie Regular. `peakSeason` marca la temporada de más puntos.

## Comportamiento

- Eje X por número de temporada, para que dos carreras de distintas eras se comparen alineadas. Un toggle "Por año calendario" cambia a años.
- Selector de estadística como chips: Puntos, Rebotes, Asistencias.
- Una línea por jugador, color por jugador (no por franquicia) para que la línea sea continua aunque cambie de equipo. En el perfil, el rojo de la liga; en la comparación, los colores de slot.
- El pico de cada jugador con un punto más grande y su valor rotulado encima.
- Cuando el jugador cambia de franquicia, un marcador hueco en ese punto.
- Los puntos con null (rebotes o asistencias pre-1975) no se dibujan y la línea se interrumpe. No se interpola.
- Tooltip al pasar o tocar: por jugador, año, logo y apodo del equipo, valor, juegos.
- Leyenda solo cuando hay más de una línea.
- Línea de fuente debajo: "Serie Regular. El punto grande marca la mejor temporada en puntos; el punto hueco, un cambio de franquicia. Las líneas se cortan donde la estadística no se registró."

## Estados

- Menos de 3 temporadas: el componente no se muestra; solo la tabla.
- Estadística no registrada en toda la carrera: mensaje de una línea, "Esta estadística no se registró durante la carrera de este jugador."
- Cargando, hover sobre un punto, foco por teclado en los chips.

## Móvil

Alto de 240px, ancho fluido, selector arriba, tooltip por tap. Con 26 temporadas las etiquetas del eje X no pueden solaparse (mostrar 1, 5, 9, 13...).

## Entrega

El componente en desktop (320px de alto) y móvil (240px) con una línea (George Torres, puntos), con nulls (Pachín Vicéns, asistencias), con dos líneas (comparación), y el estado de estadística no registrada.
