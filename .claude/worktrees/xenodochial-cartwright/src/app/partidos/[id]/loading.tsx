/**
 * Feedback inmediato al navegar a `/partidos/[id]` mientras el RSC espera GraphQL en el servidor.
 */
export default function PartidoLoading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 bg-[#0F171F] px-4">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-solid border-[rgba(255,255,255,0.25)] border-t-white"
        aria-hidden
      />
      <p className="text-center font-barlow text-sm text-[rgba(255,255,255,0.75)]">
        Cargando partido…
      </p>
    </div>
  );
}
