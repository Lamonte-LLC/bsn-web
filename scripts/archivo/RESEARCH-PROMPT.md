# Prompt de research · Integrar la historia del BSN al flujo de bsnpr.com

Pégalo completo en Claude (claude.ai con búsqueda web activada, o Claude Code con WebSearch). Espera un reporte, no código.

---

Eres un investigador de producto y UX especializado en sitios de ligas deportivas. Vas a investigar en internet y en otras ligas cómo integrar la data histórica de una liga de baloncesto al sitio oficial, para que un fanático navegue entre el presente y el pasado sin salir del flujo del sitio. Al final entregas un reporte en español de Puerto Rico con fuentes.

## 1. Contexto

**bsnpr.com** es el sitio oficial del Baloncesto Superior Nacional de Puerto Rico (BSN), la liga profesional de baloncesto de la isla, fundada en 1930. Es un sitio Next.js con estas secciones hoy: Calendario, Noticias, Equipos, Jugadores, Estadísticas, Playoffs, Comparar equipos y Boletos. Todo gira alrededor de la temporada en curso.

**El problema.** Hace poco hubo comentarios negativos de fanáticos hacia el sitio por no tener data histórica: quién ganó en 1984, cuántos títulos tiene cada franquicia, qué hizo un jugador retirado en su carrera. La liga no había suplido esa data hasta ahora. Ya la tenemos, normalizada, y la vamos a servir desde el mismo API que sirve la temporada actual.

**La decisión ya tomada.** No queremos un microsite de historia aparte (ya prototipamos uno bajo `/archivo` y aprendimos de él). Queremos que la historia viva **dentro** del flujo de bsnpr.com: que desde un juego de hoy puedas brincar a la temporada 1984, desde un jugador activo a uno retirado, desde un equipo actual a una franquicia que ya no existe, y que el usuario se quede navegando en ese rabbit hole. **La prioridad sigue siendo la temporada actual**; la historia la enriquece, no la desplaza.

**Lo que haremos con tu reporte.** Un prototipo solo de frontend, con los componentes que recomiendes, montado sobre el sitio actual. No investigues APIs, arquitectura de datos ni backend: asume que toda la data de abajo se puede pedir dinámicamente.

## 2. La data que tenemos (inventario real, con sus huecos)

Diseña recomendaciones sobre esta data y no sobre data que no existe. Los huecos son reales y el sitio tiene que verse completo con ellos.

| Entidad | Qué hay | Cobertura |
|---|---|---|
| **Temporadas** | 97 temporadas, 1930 a 2026 | Campeón todas las temporadas. MVP desde 1951. Stats y rosters de 1956 a 2023. Standings, juegos y series de playoffs reales solo 2025 y 2026 (para 2015 a 2024 hay placeholders marcados). 2024 y 2025 no tienen stats de jugadores todavía |
| **Campeones** | 95 títulos con dirigente y marcador de la serie final | Completo 1930 a 2025. 11 títulos pre-1946 son de clubes sin franquicia moderna (ej. Fénix de Vega Baja, Capitalinos de San Juan) |
| **MVPs** | 75 premios, con posición y equipo | Desde 1951, 74 enlazados a un perfil de jugador |
| **Jugadores** | 3,327 jugadores con carrera temporada por temporada | Debutaron entre 1956 y 2023. Por temporada: juegos, puntos, rebotes, asistencias, robos, bloqueos, pérdidas, porcentajes de tiro, equipo y fase (Serie Regular, Postemporada, All-Star). Totales de carrera publicados por la liga |
| **Cobertura de stats por era** | Ver tabla siguiente | Rebotes desde los 60, asistencias desde los 70, triples desde 1981 (parcial), robos y bloqueos consistentes desde 2010. Antes de eso la stat no se registraba y se muestra como "no registrado", nunca como cero |
| **Franquicias** | 28 franquicias: 12 activas, 16 extintas | Por franquicia: años activos, títulos, MVPs, líderes históricos en puntos, rebotes y asistencias, y todos sus jugadores. Las extintas no tienen logo oficial todavía (usamos un placeholder tipográfico) ni ciudad confirmada en dos casos |
| **Líderes por temporada** | Top por categoría cada temporada con stats | 1956 a 2023, ocho categorías |
| **Récords** | Top 10 de temporada (puntos, rebotes, asistencias, robos, bloqueos por juego, puntos totales) y de carrera (puntos, rebotes, asistencias, juegos, temporadas, MVPs) | Mínimo 10 juegos |
| **Temporada actual (2026)** | Standings por grupo, 246 juegos con marcador y sede, 7 series de playoffs, rosters con foto, posición, número, nacionalidad y fecha de nacimiento, stats por jugador con minutos | Real. Solo 74 de 205 jugadores activos enlazan hoy a un perfil histórico por nombre; la normalización del API va a unificar identidades, así que **asume una sola identidad por jugador a través de todas las eras** |
| **Derivados ya calculados** | Dirigentes con más títulos, coincidencia MVP y campeón por año, MVPs múltiples, longevidad, lealtad (un solo club vs trotamundos), temporadas de 20+ puntos por década, récords por década, arco de carrera por temporada, y un índice de jugadores parecidos (8 por jugador, 1,398 jugadores con 3+ temporadas) | Listos para consumir |

**Disponibilidad de stats por década (Serie Regular, porcentaje de líneas sin dato):**

| Década | Rebotes | Asistencias | Tiros de campo | Triples | Robos y bloqueos |
|---|---|---|---|---|---|
| 1950s | 45% | 100% | 100% | 100% | 100% |
| 1960s | 0% | 49% | 51% | 100% | 100% |
| 1970s | 0% | 0% | 3% | 100% | 100% |
| 1980s | 0% | 0% | 4% | 63% | 100% |
| 1990s | 0% | 0% | 4% | 36% | 100% |
| 2000s | 56% | 1% | 5% | 33% | 1% a 14% |
| 2010s en adelante | 0% | 0% | 4% | 22% a 27% | 0% |

**Lo que NO tenemos:** fotos de jugadores retirados, minutos por juego históricos, box scores de juegos históricos, líneas de playoffs para la mayoría de las carreras, logos de franquicias extintas, biografías, videos.

## 3. Lo que ya prototipamos (para que no lo reinventes, sino que lo reubiques)

Bajo `/archivo` construimos y probamos con usuarios internos: perfil de jugador con resumen de carrera y tabla temporada por temporada; comparación cara a cara de dos o tres jugadores con barras por stat y ganador resaltado; arco de carrera (gráfica de puntos por temporada con pico y cambios de franquicia); página de temporada con campeón, MVP, líderes, standings, playoffs y rosters; página de franquicia con títulos, MVPs, líderes históricos y todos sus jugadores; índice de jugadores con búsqueda por apodo y filtro alfabético; salón de MVPs; récords; y ocho "historias con data" (dirigentes ganadores, MVP vs campeón, MVPs múltiples, longevidad, lealtad, club de los 20, lo mejor de cada década, y un Dynasty Tracker animado de títulos acumulados por franquicia desde 1930).

La pregunta ahora no es qué construir desde cero, sino **dónde vive cada pieza dentro de bsnpr.com y qué piezas nuevas hacen falta para conectar presente y pasado.**

## 4. Qué investigar

Investiga con búsqueda web y cita fuentes. Separa lo que encontraste con evidencia de lo que infieres.

**A. Benchmark de ligas y sitios de referencia.** Cómo integran la historia al flujo principal (no cómo lucen sus secciones de historia aisladas). Mira al menos: NBA.com (stats, perfiles de jugadores retirados, "All-Time" en leaderboards, comparaciones), MLB.com (history, perfiles de retirados, franchise timelines), NHL Records, Baseball-Reference y Basketball-Reference (player finder, similarity scores, franchise encyclopedia, "on this day"), Pro Football Reference, ESPNcricinfo StatsGuru, StatMuse (preguntas en lenguaje natural), Premier League y UEFA (all-time stats junto a la temporada actual), Euroleague y Liga ACB (ligas de baloncesto europeo con archivo histórico), y al menos dos ligas latinoamericanas de baloncesto (Liga Nacional de Argentina, LNBP de México, Liga Sudamericana). Para cada una: qué patrones usan para cruzar presente y pasado, cómo manejan eras con stats incompletas, cómo tratan equipos desaparecidos y reubicados, y qué se sentiría fuera de lugar en una liga del tamaño del BSN.

**B. Qué quiere el fanático.** Busca qué preguntan y comparten los fanáticos de baloncesto puertorriqueño y de ligas comparables: redes (X, Facebook, Reddit, foros), búsquedas frecuentes (ej. "quién ganó el BSN en 1984", "campeonatos de los Vaqueros", "récord de puntos en el BSN"), comentarios sobre bsnpr.com si los encuentras, y cualquier estudio o artículo sobre por qué los fanáticos consumen data histórica (nostalgia, debates de "quién es mejor", contexto para lo que pasa hoy, récords que se están rompiendo en vivo). Quiero saber qué preguntas específicas hace la gente, no generalidades.

**C. Patrones de interacción que crean el rabbit hole.** Identifica patrones concretos y comprobados: módulos de contexto histórico dentro de páginas de la temporada actual ("los Vaqueros buscan su título 16"), leaderboards de todos los tiempos con los jugadores activos resaltados, "records watch" (un jugador activo a X puntos de un récord), "un día como hoy", cabezas a cabeza históricos entre dos equipos, línea de tiempo de una franquicia con sus reubicaciones y cambios de nombre, comparaciones entre eras con nota de contexto, selector de temporada que persiste mientras navegas, jugadores parecidos, dinastías, tarjetas de "hace 25 años". Para cada patrón: dónde funciona, por qué, y ejemplos reales.

**D. Cómo manejan otros los huecos de data.** Prácticas honestas para stats que no se registraban en ciertas eras, jugadores sin foto, equipos sin logo, temporadas sin box score. Qué hacen Basketball-Reference y NBA.com con las eras pre-1974 (robos y bloqueos) y pre-1980 (triples). Lo que no queremos es esconder el hueco ni inventar ceros.

## 5. Restricciones que deben respetar tus recomendaciones

- La temporada actual manda. Cada componente histórico tiene que ganarse su lugar en una página del presente o vivir a un clic de ella.
- Mobile-first, 375px. Un pulgar debe poder operar todo.
- Nada de dashboards con siete filtros arriba. El fanático llega con una pregunta; el sitio contesta y le ofrece la siguiente.
- Español de Puerto Rico. Se dice "juegos", nunca "partidos". Se dice "dirigente", no "entrenador". Los apodos importan ("Georgie", "Pachín", "Quijote").
- Los componentes se reutilizan en varias páginas: Jugadores, Equipos, Estadísticas, Calendario, Playoffs, y el detalle de un juego.
- Todo es data real del inventario de arriba. Si una recomendación necesita data que no tenemos, márcala como tal y ponla en la lista para la liga.
- Es un prototipo de frontend. No propongas nada que dependa de contenido editorial nuevo (biografías, videos) a menos que lo marques como fase posterior.

## 6. Entregables, en este orden

1. **Benchmark** de 8 a 12 sitios: tabla con sitio, patrón de integración presente y pasado, qué hace bien, qué no aplica al BSN, enlace.
2. **Lo que pide el fanático**: lista de las 15 a 20 preguntas concretas más frecuentes que un fanático le haría al sitio, con evidencia de dónde salen, y cuáles de ellas nuestra data puede contestar hoy, cuáles parcialmente y cuáles no.
3. **Catálogo de componentes recomendados**, 15 a 25, priorizados. Para cada uno: nombre en español, en qué página o páginas de bsnpr.com vive y en qué posición (arriba, lateral, al final), qué pregunta del fanático contesta, qué data del inventario usa, cómo se comporta cuando falta data en una era, esfuerzo estimado (S, M, L), prioridad (ahora, después, más tarde), y de dónde tomaste el patrón. Marca cuáles ya existen en nuestro prototipo de `/archivo` y solo hay que reubicar, y cuáles son nuevos.
4. **Cinco recorridos de rabbit hole**, paso a paso, que empiecen en la temporada actual y terminen décadas atrás. Ejemplo del tipo de recorrido que quiero: box score de un juego de hoy, un jugador anota 40, "es la mejor marca de un Vaquero desde X en 1987", perfil de X, temporada 1987, campeón 1987, Dynasty Tracker. Di qué componente hace cada salto.
5. **Diez comparativas posibles con nuestra data**, explícitas: qué se compara con qué, con qué stats, y qué nota de contexto necesita cada una por los huecos de era (ej. jugador de 2026 vs jugador de 1975 no puede comparar triples).
6. **Lo que no hay que construir** y por qué, con ejemplos de sitios que lo hicieron mal o de patrones que no escalan a una liga con 12 equipos y un archivo de 3,327 jugadores.
7. **Lista para la liga**: la data que falta y que más valor desbloquearía, ordenada por impacto (fotos de retirados, logos de extintas, box scores históricos, stats de 2024 y 2025, etc.), con qué componente habilita cada una.
8. **Preguntas abiertas** que deberíamos resolver antes de prototipar.

Formato: markdown, títulos claros, tablas donde ayuden, fuentes como enlaces al final de cada sección. Extensión objetivo: entre 2,500 y 4,000 palabras. Sin relleno. Si una sección no tiene evidencia sólida, dilo en una línea en vez de rellenarla.
