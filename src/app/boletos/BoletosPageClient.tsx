'use client';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

export type BoletosTeam = {
  code: string;
  fullName: string;
  venue: string;
  borderColor: string;
  ticketUrl: string;
};

type Props = {
  teams: BoletosTeam[];
};

const ExternalGlyph = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3H3v10h10v-3" />
    <path d="M9 2h5v5" />
    <path d="m8 8 6-6" />
  </svg>
);

export default function BoletosPageClient({ teams }: Props) {
  const lastIndex = teams.length - 1;
  const lastEvenIndex = lastIndex % 2 === 0 ? lastIndex : lastIndex - 1;

  return (
    <>
      <section className="relative z-10 -mt-8 pb-20">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white"
            style={{
              border: '1px solid #EAEAEA',
              borderRadius: 16,
              boxShadow: '0 12px 32px rgba(15,23,31,0.08)',
            }}
          >
            {teams.map((team, i) => {
              const isLeftCol = i % 2 === 0;
              const isLastDesktopRow = i >= lastEvenIndex;
              const isLastMobile = i === lastIndex;
              return (
                <a
                  key={team.code}
                  href={team.ticketUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'group flex items-center gap-5 no-underline text-inherit',
                    'transition-colors duration-150 ease-out',
                    'hover:bg-[#FAFAFA]',
                    isLastMobile ? 'border-b-0' : 'border-b border-b-[#EAEAEA]',
                    isLastDesktopRow ? 'md:border-b-0' : 'md:border-b md:border-b-[#EAEAEA]',
                    isLeftCol ? 'md:border-r md:border-r-[#EAEAEA]' : '',
                  ].join(' ')}
                  style={{ padding: '18px 22px' }}
                  aria-label={`${team.fullName} — Comprar boletos`}
                >
                  <div
                    className="flex shrink-0 items-center justify-center bg-white w-[52px] h-[52px] md:w-[58px] md:h-[58px]"
                    style={{
                      borderRadius: '50%',
                      border: `1.5px solid ${team.borderColor}`,
                    }}
                  >
                    <div className="md:hidden">
                      <TeamLogoAvatar teamCode={team.code} size={34} />
                    </div>
                    <div className="hidden md:block">
                      <TeamLogoAvatar teamCode={team.code} size={38} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="font-special-gothic-condensed-one text-[18px] md:text-[19px]"
                      style={{
                        lineHeight: 1.05,
                        letterSpacing: '0.020em',
                        color: '#0F171F',
                      }}
                    >
                      {team.fullName}
                    </div>
                    <div
                      className="font-barlow text-[12px] md:text-[13px]"
                      style={{
                        fontWeight: 400,
                        letterSpacing: '-0.010em',
                        color: '#717171',
                        marginTop: 4,
                      }}
                    >
                      {team.venue}
                    </div>
                  </div>

                  <div
                    className={[
                      'shrink-0 inline-flex items-center font-special-gothic-condensed-one',
                      'transition-colors duration-150 ease-out',
                      'bg-[#FAFAFA] text-[#171717] border border-[rgba(168,168,168,0.5)]',
                      'group-hover:bg-[#0F171F] group-hover:text-white group-hover:border-[#0F171F]',
                    ].join(' ')}
                    style={{
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 100,
                      fontSize: 14,
                      letterSpacing: '0.020em',
                    }}
                  >
                    Comprar boletos
                    <ExternalGlyph size={12} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
