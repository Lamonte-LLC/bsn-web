import type { Metadata } from 'next';
import Link from 'next/link';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchiseMap, getMvps } from '@/archivo/lib/data';

export const metadata: Metadata = { title: 'Salón de MVPs · Archivo BSN', description: 'Los Jugadores Más Valiosos del BSN desde 1951.' };

export default function MvpsPage() {
  const mvps = getMvps();
  const franchises = getFranchiseMap();
  const countByPlayer = new Map<string, number>();
  for (const m of mvps) {
    const key = m.playerId ?? m.name;
    countByPlayer.set(key, (countByPlayer.get(key) ?? 0) + 1);
  }
  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>{mvps.length} premios desde 1951</HeroEyebrow>
          <HeroTitle>Salón de MVPs</HeroTitle>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {mvps.map((m) => {
          const f = m.franchiseSlugs[0] ? franchises.get(m.franchiseSlugs[0]) ?? null : null;
          const multi = (countByPlayer.get(m.playerId ?? m.name) ?? 1) > 1;
          const href = m.slug ? `/archivo/jugadores/${m.slug}` : `/archivo/temporadas/${m.year}`;
          return (
            <Link key={m.year} href={href} className={`rounded-[12px] border bg-white p-[14px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)] ${multi ? 'border-[rgba(254,194,0,0.6)]' : 'border-[#EAEAEA]'}`}>
              <div className="flex items-start justify-between">
                <PlayerAvatar name={m.name} color={f?.colors.primary} sizePx={52} />
                <span className="text-[22px] text-black">{m.year}</span>
              </div>
              <p className="mt-[10px] truncate text-[17px] leading-[1.15] text-[rgba(15,23,31,0.9)]">{m.name}</p>
              <p className="mt-[4px] flex items-center gap-[6px] font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">
                {m.franchiseSlugs.map((s) => (
                  <FranchiseLogo key={s} franchise={franchises.get(s) ?? null} fallbackName={s} size="chip" />
                ))}
                <span className="truncate">{f?.nickname ?? m.teamName}</span>
              </p>
              {multi || m.position ? (
                <div className="mt-[8px] flex flex-wrap gap-[4px]">
                  {multi ? <Badge>{m.mvpNumber ? `MVP #${m.mvpNumber}` : 'Múltiple'}</Badge> : null}
                  {m.position ? <span className="font-barlow text-[11px] text-[rgba(15,23,31,0.5)]">{m.position}</span> : null}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </ArchivoShell>
  );
}
