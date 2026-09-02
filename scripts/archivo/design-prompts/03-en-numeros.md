# Prompt 3 · El BSN en números

(Pegar después del bloque BASE. Asume el Prompt 1.)

**Adjuntar:** de `data/archivo/insights/`: `coaches.json`, `mvp-champion-overlap.json`, `multi-mvps.json`, `longevity.json`, `loyalty.json`, `scoring-club.json`, `records-by-decade.json`. Más `franchises.json` y las capturas `screenshots/num-index.png`, `num-dirigentes.png`, `num-mvp-mobile.png`, `num-multi.png`, `num-club-mobile.png`, `num-records.png`.

---

Vas a diseñar `/archivo/en-numeros`: un índice y siete vistas cortas que cuentan una historia cada una con data precalculada. Es contenido de descubrimiento, no de query. Ya existe una versión funcional (ver capturas).

## Marco común

Cada vista tiene: título editorial, un número hero con su etiqueta (en el hero, junto al título), un párrafo de contexto de dos líneas, un botón "Compartir" que copia la URL, el visual, y una línea de fuente al final. Todos los nombres enlazan al perfil, todos los años a la temporada, todos los logos a la franquicia. Los visuales son barras y timelines hechos con bloques, no gráficas de librería; la única gráfica de librería del proyecto es el arco de carrera.

## Índice

Grid de ocho cards, una por vista, cada una con el título y su número hero real: 12 (títulos de Julio Toro), 21.6% (16 de 74), 3 (jugadores con cuatro MVPs), 29 (temporadas de Mario Butler), 100 (jugadores de un solo club), 18 (temporadas de 30 o más puntos), 8 décadas, 95 títulos. Todo el card es tap.

## Las siete vistas

1. **Los dirigentes que ganaron** (`/dirigentes`). Top 15 como barras horizontales por títulos, con posición, nombre, barra y número. Bajo cada barra, los años como chips con el logo del equipo, enlazados a la temporada. Los títulos con dos dirigentes cuentan para ambos. Contexto: "Julio Toro ganó doce campeonatos en cuatro décadas. Nadie está cerca."

2. **¿El MVP levanta el trofeo?** (`/mvp-y-campeon`). Hero "16 de 74" y "21.6% de las veces". Dos cards con la racha más larga de coincidencia (5 años, 1959 a 1963) y sin coincidencia (14 años, 1983 a 1996). Lista vertical por año con tres columnas: año, MVP (foto, nombre, logo y apodo), campeón (logo y nombre). Las filas donde coinciden se resaltan; las que pertenecen a una racha llevan una marca lateral. Contexto: "El mejor jugador del año y el mejor equipo del año no siempre son la misma historia."

3. **Los que repitieron** (`/multi-mvp`). Timeline horizontal 1951 a 2025 con marcas de década; una fila por jugador (11), puntos en los años que ganó coloreados por franquicia, el conteo junto al nombre, los de cuatro arriba, badge "2 equipos" para Christian Dalmau y Tinajón Feliciano. En móvil, cards verticales con los años como chips con logo. Contexto: "Tres jugadores ganaron cuatro veces. Ninguno en la misma década."

4. **Los que duraron** (`/longevidad`). Tabs por temporadas y por juegos, top 25. Cada fila: posición, nombre, barra tipo gantt del año de debut al de retiro sobre un eje 1956 a 2023 con marcas de década, y el total a la derecha. En móvil la barra se reemplaza por "1980 a 2008" bajo el nombre. Contexto: "Teófilo Cruz jugó veinticinco temporadas. Empezó antes de que existiera la línea de tres."

5. **Un solo uniforme** (`/lealtad`). Dos columnas en desktop, tabs en móvil: "Un solo club" (100) y "Trotamundos" (503). Cada fila: posición, nombre, temporadas, y la secuencia de logos de franquicias (hasta ocho, luego "+N"). Se muestran 30 por lista. Contexto: "Algunos nunca cambiaron de camiseta. Otros vistieron doce."

6. **El club de los 20** (`/club-de-los-20`). Chips de umbral (15, 20, 25, 30 PPJ). Barras por década con cuántas temporadas superaron el umbral (para 20: 2, 19, 98, 155, 119, 77, 34, 12). Debajo, la lista de temporadas: posición, jugador, año, equipo, PPJ, juegos, con "Ver más" de 40 en 40. Contexto: "En los setenta, promediar treinta era posible. Hoy, veinte es una hazaña."

7. **Lo mejor de cada década** (`/records-por-decada`). Tabla: una fila por década (1950s a 2020s), columnas por categoría (PPJ, RPJ, APJ, robos, bloqueos, puntos totales). Celda: número grande, nombre, logo y año. Cuando no hay data, "no registrado" en secundario sin romper la grilla (robos y bloqueos antes de 2000, asistencias en los 50). Columna de década fija con scroll horizontal en móvil. Contexto: "Cada era tuvo su número imposible."

## Entrega

Índice más las siete vistas en desktop y móvil. Las vistas 1, 2 y 3 completas; 4 a 7 pueden ir como variantes del mismo patrón si el sistema ya quedó claro.
