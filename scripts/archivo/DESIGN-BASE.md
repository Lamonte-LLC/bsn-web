# Archivo BSN · Base para todos los prompts de Claude Design

Pega este bloque completo al inicio de cualquier prompt de diseño del proyecto. Después del bloque va la instrucción específica de la pantalla o componente. Así todas las pantallas salen con el mismo estándar y no tienes que repetir el criterio cada vez.

---

## BASE · Estándar de diseño de Archivo BSN

Estás diseñando para **Archivo BSN**, el archivo histórico y museo digital del Baloncesto Superior Nacional de Puerto Rico, dentro de bsnpr.com. Lee esto completo antes de diseñar nada. Define el estándar de calidad y las reglas que aplican a toda pantalla y componente del proyecto.

### 1. El sistema de diseño manda

Importa y respeta el design system de **bsn-web en modo light** que ya tienes disponible: tipografía, escala tipográfica, paleta, tokens de espaciado, radios, sombras, y los componentes existentes de tabla, card, badge, botón, tabs y navegación. No inventes un sistema paralelo. Si necesitas una variante, extiende el componente existente y documenta por qué.

Archivo BSN es una **sub-marca dentro de ese sistema**: el wordmark "ARCHIVO BSN" en condensada itálica pesada y el rojo de la liga como color de acento. La nostalgia se logra con fotografía en blanco y negro con grano, tratamiento editorial y jerarquía tipográfica. No con fondos oscuros, no con gradientes, no con texturas.

### 2. El nivel de calidad que espero

Diseña al nivel de estos productos, y toma de cada uno lo que indico:

**Apple (apple.com, Apple Sports).** La disciplina del espacio en blanco. Una idea por sección. Tipografía que hace el trabajo sin ayuda de decoración. Nada compite por atención.

**Stripe (stripe.com, dashboard de Stripe).** Densidad de información sin ruido. Tablas que se leen sin esfuerzo. Jerarquía tan clara que no hace falta explicar dónde mirar. Componentes funcionales que se sienten inevitables, como si no pudieran ser de otra forma.

**MLB.com (secciones de historia, stats y perfiles de jugador).** Data deportiva densa presentada con orden y respeto por el fanático. Perfiles de jugador con números grandes y tablas temporada por temporada que aguantan décadas de data. Navegación que lleva de un jugador a un equipo a una temporada sin perderse.

**Basketball-Reference y NHL Records (records.nhl.com).** No por estética, sino por estructura: cada número es un enlace, cada tabla es ordenable, cada récord tiene contexto.

El resultado debe sentirse **diseñado por una persona con criterio**, con decisiones intencionales, no generado. Un lead de diseño de una empresa seria debe poder mirarlo y no encontrar nada que corregir en jerarquía, alineación o espaciado.

### 3. Lo que NO quiero ver

Esta lista es explícita porque estos patrones aparecen por defecto y hay que evitarlos activamente:

- Cards translúcidas o con blur sobre gradientes
- Fondos con gradientes de dos o tres colores, orbes de luz, "glow", "mesh gradients"
- Iconos genéricos de librería como decoración, sobre todo dentro de círculos de color
- Bordes con gradiente, sombras de colores, "neon", "glassmorphism"
- Tipografía con gradiente
- Badges de colores pastel para todo
- Headers de sección con emoji
- Tres columnas de cards idénticas con icono arriba, título, párrafo, para "explicar features"
- Botones con esquinas completamente redondeadas por defecto en todo
- Micro-animaciones en cada elemento, elementos flotando, "hover lift" en todo
- Placeholder text tipo "Lorem ipsum" o data inventada que no viene de los JSON que te di
- Layouts simétricos por inercia cuando el contenido pide asimetría
- Espaciado uniforme entre todo; el espaciado debe comunicar agrupación
- Contraste bajo: texto gris claro sobre blanco, texto sobre imagen sin protección
- Dashboards con siete filtros arriba antes de mostrar nada

Si un elemento no tiene una función clara, se elimina. Si un color no comunica algo, se elimina.

### 4. Tipografía

- Máximo tres niveles de jerarquía visibles por pantalla. Título, cuerpo, secundario. Si necesitas un cuarto, revisa la estructura.
- Los números son protagonistas en este producto. Las cifras hero (puntos de carrera, títulos, años) van en el tamaño más grande de la escala, con peso pesado, y con tabular figures para que alineen en tablas.
- Nombres de jugadores y equipos siempre en el mismo peso y tamaño dentro de un mismo contexto. Sin excepciones decorativas.
- Texto de cuerpo nunca por debajo de 15px en móvil ni de 16px en desktop.
- Etiquetas de tabla y metadata en mayúsculas con tracking solo si el sistema de bsn-web ya lo hace. Si no, no lo introduzcas.

### 5. Layout y espaciado

- Grid estricto. Todo alinea a columnas y a la escala de espaciado del sistema. Nada a ojo.
- El espaciado comunica relación: elementos relacionados cerca, secciones separadas con aire generoso. La escala de espaciado no es uniforme, es semántica.
- Márgenes consistentes entre pantallas. El contenido arranca en la misma coordenada en cada página.
- Ancho máximo de lectura para texto editorial: 68 a 72 caracteres por línea.
- Las tablas pueden ser más anchas que el texto. No las encajones al ancho de lectura.

### 6. Color

- La paleta es la del sistema de bsn-web. El rojo de la liga es acento, no relleno. Se usa en el wordmark, en el estado activo de navegación, en el resaltado de ganador en comparaciones y en poco más.
- Los colores de franquicia se usan solo en elementos asociados a esa franquicia: barra del Dynasty Tracker, fondo del placeholder de foto, línea de la franquicia en un timeline. Nunca como color de UI general.
- Fondos: blanco y el gris más claro del sistema para alternar secciones. Nada más.
- Fotografía histórica en blanco y negro. Fotografía moderna en color. Esa distinción es parte del lenguaje del archivo.

### 7. Componentes

Todo componente tiene que ser evidentemente funcional. Un botón parece un botón. Un enlace parece un enlace. Una tabla ordenable muestra que es ordenable. Nada de affordances escondidas por estética.

Estados obligatorios en cada componente interactivo: default, hover, activo, focus visible, deshabilitado, cargando, vacío, error. Diseña los ocho o el componente no está terminado.

**Tablas de estadísticas** son el componente más importante del proyecto:
- Columna izquierda fija (nombre o año) con scroll horizontal del resto en móvil, con indicador visible de que hay más columnas
- Cabeceras fijas al hacer scroll vertical
- Tabular figures en todas las cifras
- Filas con altura suficiente para tocar en móvil, mínimo 44px
- Ordenable por columna con indicador claro de dirección
- Nulls como guion, nunca cero, nunca vacío
- Zebra striping sutil solo si mejora el rastreo de filas largas

**Cards de jugador y de récord**: foto o placeholder, nombre, un número hero, contexto en secundario, y todo el card es el área de tap.

**Placeholder de foto de jugador**: iniciales en el color de la franquicia sobre fondo del color de la franquicia al 10%. Sin silueta genérica, sin icono de persona.

**Estados vacíos**: una línea de texto, un enlace a otra sección, nada más. Sin ilustración.

### 8. Movimiento

Solo transiciones que comuniquen cambio de estado o continuidad espacial. Duración entre 150ms y 250ms. Curvas del sistema. Nada decorativo, nada en loop, nada al cargar la página. Respeta `prefers-reduced-motion`.

### 9. Móvil

Mobile-first en serio: diseña primero la versión de 375px y escala hacia arriba. Un pulgar debe poder operar todo. Áreas de tap de mínimo 44px. Navegación del archivo como tabs horizontales con scroll y el activo siempre visible. Búsqueda accesible desde cualquier pantalla del archivo. Las tablas siguen las reglas de la sección 7. Nada se esconde en móvil que sea esencial en desktop; se reorganiza.

### 10. Data y honestidad

Diseña sobre los JSON reales que te adjunto, no sobre data inventada. La data tiene huecos reales: rebotes, asistencias y triples no existen de forma consistente antes de 1975. El diseño tiene que verse completo con esos huecos. Donde haya una comparación entre eras, incluye la nota de contexto que te indico. Un archivo que esconde lo que no sabe pierde credibilidad.

### 11. Idioma

Español de Puerto Rico. Se dice "juegos", nunca "partidos". Usa "el UX" y "el UI". Deja "responsive" en inglés. No uses em-dashes en ningún texto de la interfaz ni en tus notas.

### 12. Entrega

Para cada pantalla: desktop y móvil. Para cada componente: todos los estados. Anota decisiones no obvias en una línea. Si algo del brief específico contradice esta base, sigue esta base y avísame.

---

*Fin de la base. Debajo va el prompt específico.*
