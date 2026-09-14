# Prompt 5 · Dinastías, el Dynasty Tracker

(Pegar después del bloque BASE. Es la octava vista de El BSN en números.)

**Adjuntar:** `champions.json`, `franchises.json`, capturas `screenshots/dyn-paused.png`, `dyn-1975.png`, `dyn-mobile.png`.

---

Vas a diseñar `/archivo/en-numeros/dinastias`: una animación de títulos acumulados por franquicia desde 1930 hasta 2025 donde las barras se reordenan cada año. Ya existe una versión funcional (ver capturas).

## Visual

- Barras horizontales, top 8 en desktop y top 6 en móvil. Cada barra: logo o placeholder, apodo dentro de la barra, número a la derecha. Color de barra: el primario de la franquicia. Los clubes anteriores a 1946 sin franquicia aparecen con su nombre completo, placeholder neutro y sin enlace.
- Un año enorme en la esquina superior derecha que avanza; a la izquierda, "Campeón {año}" con el nombre del campeón de ese año.
- Captions breves de dos segundos cuando el año llega a 1975 ("Vaqueros: cinco al hilo"), 2001 ("Cangrejeros: cuatro seguidos con Julio Toro") y 2009 ("Julio Toro gana su título número doce"). El caption tiene un espacio reservado bajo el nombre del campeón para que nada se mueva cuando aparece.
- Estado inicial: pausado en 2025 mostrando el resultado final (Vaqueros 15, Leones 14, Atléticos 11, Capitanes 8, Cangrejeros 8, Piratas 6, Cardenales 6, Indios 3).

## Controles

- Botón principal: "Reproducir" (desde 1930 si está al final), "Pausa" mientras corre.
- Velocidad 1x y 2x como control segmentado.
- Scrubber por año que ocupa el ancho completo bajo el chart, con 1930 y 2025 en los extremos. Salta solo a años con título.
- Al pausar, cada barra es un enlace a la franquicia; mientras corre, las barras no reciben tap. Una línea de ayuda lo indica.
- Botón "Compartir" que copia la URL.

## Movimiento

Transiciones de posición (transform) y ancho de 250ms con la curva del sistema. Las barras que salen del top se desvanecen; las que entran aparecen desde abajo. Nada más se anima.

## Accesibilidad

Con `prefers-reduced-motion`, no hay animación ni botón de reproducir: un selector de año que salta sin transición, y una línea que lo explica. El año se anuncia con aria-live. Los controles tienen foco visible.

## Móvil

Top 6, texto más grande, el scrubber bajo el chart al ancho completo. Verifica en 375px.

## Entrega

Estado pausado en 2025, estado en reproducción con el caption de 1975 visible, estado con reduced motion, y la versión móvil.
