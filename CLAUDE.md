# BSN Web — bsnpr.com

Sitio oficial de la BSN (Baloncesto Superior Nacional de Puerto Rico).

## Stack
- Next.js 15 App Router + React 19
- TypeScript 5
- Tailwind CSS v4 + PostCSS
- Apollo Client 4 + GraphQL
- Headless UI, react-slick, HLS.js, Lottie
- Deploy: Heroku

## Estructura clave
- src/app/ → páginas (App Router)
- src/shared/components/layout/ → BoxLayout, FullWidthLayout, headers, footers
- src/shared/client/components/ui/ → componentes base: Card, Tag, ShimmerLine
- src/match/ → features de partidos
- src/team/ → features de equipos
- src/player/ → features de jugadores
- src/stats/ → estadísticas
- src/graphql/ → queries por dominio

## Design system
- globals.css tiene variables CSS custom
- Colores: --background: #fdfdfd, --foreground: #171717
- Clase .bg-bsn para gradientes sobre #0F171F
- Fuentes: --font-barlow, --font-barlow-condensed, --font-special-gothic-condensed-one
- Tema light/dark vía React Context en src/shared/client/components/wsc/hooks/theme.tsx
- No hardcodear colores ni tipografía — usar siempre las variables CSS existentes

## Límites de trabajo — CRÍTICO

Solo estoy autorizado a realizar cambios de UI y estilos.
Claude NO debe tocar bajo ninguna circunstancia:
- Llamados al servidor o API
- Queries de GraphQL
- Lógica de Apollo Client o caché
- Funcionalidad, handlers, o lógica de negocio
- Archivos en src/graphql/
- Cualquier hook que no sea puramente visual

Si un cambio de UI requiere tocar lógica o datos,
detente y avísame antes de proceder.

## Filosofía de cambios

1. Reusar antes de crear — revisar siempre src/shared/client/components/ui/
   antes de escribir un componente nuevo
2. Si en Figma hay un componente similar a uno existente,
   re-estilizar el componente existente, no crear uno nuevo
3. El objetivo es polish del código que ya existe,
   no meter código from scratch
4. Menos código nuevo = mejor solución
5. Si hay duda entre crear o reutilizar, reutilizar siempre

## Convenciones
- Todos los componentes nuevos van en TypeScript (.tsx)
- Estilos en Tailwind inline — no crear CSS custom salvo que sea necesario
- Respetar el file-based routing de Next.js App Router
- No hardcodear valores de color (#hex) — usar variables CSS
- No tocar main directamente — siempre trabajar en feature branches

## Workflow
- Antes de escribir cualquier código, describir el plan completo
  y esperar aprobación explícita. Sin excepciones.
- Un componente por conversación — no mezclar features
- Recordarme hacer commit al terminar cada componente
- Si algo requiere tocar lógica de datos, parar y preguntar