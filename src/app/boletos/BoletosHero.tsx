const TicketGlyph = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6v-3z" />
    <path d="M12 8v16" strokeDasharray="2 2" />
  </svg>
);

export default function BoletosHero() {
  return (
    <section
      className="relative text-white text-center"
      style={{ padding: '40px 24px 88px' }}
    >
      <div className="relative mx-auto" style={{ maxWidth: 720 }}>
        <div
          className="mx-auto flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <TicketGlyph size={28} />
        </div>
        <h1
          className="font-special-gothic-condensed-one text-white text-[44px] md:text-[64px]"
          style={{
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '0.020em',
            margin: '24px 0 0',
          }}
        >
          Vive la acción en vivo
        </h1>
        <p
          className="font-barlow text-[15px] md:text-[17px]"
          style={{
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '-0.010em',
            color: 'rgba(255,255,255,0.65)',
            margin: '14px 0 0',
          }}
        >
          Accede a la boletería oficial de cada equipo
        </p>
      </div>
    </section>
  );
}
