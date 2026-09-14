# Prompts para Claude Design · Archivo BSN

Cada prompt se arma así: **el bloque de `../DESIGN-BASE.md` completo** + uno de estos archivos. Adjuntar lo que indica cada uno desde `../samples/` (JSON reales) y `../samples/screenshots/` (capturas de la implementación actual, que sirven de referencia de contenido y estructura, no de estética final).

| # | Archivo | Qué cubre | Cuándo pasarlo |
|---|---|---|---|
| 1 | `01-proyecto-completo.md` | Las 9 pantallas del núcleo (home, jugadores, perfil, temporadas, temporada, campeones, MVPs, franquicia, récords), las 3 editoriales y los componentes base | Primero |
| 2 | `02-comparar.md` | Cara a cara jugador vs jugador (Prompt B) | Después del 1 |
| 3 | `03-en-numeros.md` | Índice de El BSN en números y las siete vistas (Prompt C) | Después del 1 |
| 4 | `04-arco-de-carrera.md` | Componente CareerArcChart (Prompt D) | Junto con el 2 |
| 5 | `05-dinastias.md` | Dynasty Tracker (Prompt E) | Al final |

Orden sugerido: 1, luego 2 y 4 en la misma sesión (comparten el perfil de jugador), luego 3, luego 5.

Todo lo que describen ya existe implementado en código bajo `/archivo`; los diseños definen la versión definitiva que después se aplica encima. Si un diseño contradice la base, manda la base.
