const TicketGlyph = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6v-3z" />
    <path d="M12 8v16" strokeDasharray="2 2" />
  </svg>
);

export default function BoletosHero() {
  return (
    <section className="relative text-white text-center px-6 pt-[28px] pb-[56px] md:pt-[48px] md:pb-[90px]">
      <div className="relative mx-auto" style={{ maxWidth: 720 }}>
        <div
          className="mx-auto flex items-center justify-center w-[56px] h-[56px] md:w-[64px] md:h-[64px]"
          style={{
            borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <TicketGlyph size={24} />
        </div>
        <h1
          className="font-special-gothic-condensed-one text-white text-[34px] md:text-[61px] mt-[20px] md:mt-[24px]"
          style={{
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.5px',
          }}
        >
          Vive la acción en vivo
        </h1>
        <p
          className="font-barlow text-[14px] md:text-[17px] mt-[12px] md:mt-[11px]"
          style={{
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '-0.010em',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          Accede a la boletería oficial de cada equipo
        </p>
      </div>
    </section>
  );
}
