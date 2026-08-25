/**
 * Interruptor de temporada.
 *
 * Con `false` (off-season) se esconde todo lo que depende de que haya juegos
 * en curso:
 *
 * Home (`src/app/page.tsx`)
 * - Slider de partidos recientes (subheader)
 * - Banner de playoffs/allstar (subheader)
 * - #LaMásDura y Highlights (widgets WSC) + el SDK Blaze que los alimenta
 * - Tabla de posiciones (columna derecha)
 * - Layout: la columna izquierda se estira y el ad horizontal se ancla al
 *   fondo para cuadrar con el card "Lo último en el BSN"
 *
 * Header (`src/shared/components/layout/fullwidth/Header.tsx`)
 * - Item "Playoffs" (nav desktop + drawer móvil)
 * - Botón "Boletos" (nav desktop + drawer móvil)
 *
 * Footer (`src/shared/components/layout/fullwidth/Footer.tsx`)
 * - Item "Boletos" del menú
 *
 * Para rescatarlo todo antes del próximo season basta cambiarlo a `true`.
 * El markup sigue vivo en su sitio — no hay nada que descomentar.
 */
export const SEASON_IN_PROGRESS: boolean = false;
