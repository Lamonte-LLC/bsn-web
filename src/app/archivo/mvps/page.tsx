import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, CardLink, HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchiseMap, getMvps } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';

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
          <HeroEyebrow>{mvps.length} premios desde {mvps[mvps.length - 1]?.year}</HeroEyebrow>
          <HeroTitle>Salón de MVPs</HeroTitle>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:gap-[16px] lg:grid-cols-5">
        {mvps.map((m) => {
          const f = m.franchiseSlugs[0] ? franchises.get(m.franchiseSlugs[0]) ?? null : null;
          const multi = (countByPlayer.get(m.playerId ?? m.name) ?? 1) > 1;
          const href = m.slug ? `/archivo/jugadores/${m.slug}` : `/archivo/temporadas/${m.year}`;
          return (
            <CardLink key={m.year} href={href} className="px-[16px] pb-[16px] pt-[16px] md:px-[18px]">
              <span className="flex items-start justify-between gap-[8px]">
                <PlayerAvatar name={m.name} color={f?.colors.primary} sizePx={48} />
                <span className={`text-[22px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{m.year}</span>
              </span>
              <span className="mt-[12px] block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{m.name}</span>
              <span className={`mt-[4px] flex items-center gap-[6px] ${cls.meta} !text-[12px]`}>
                {m.franchiseSlugs.map((s) => (
                  <FranchiseLogo key={s} franchise={franchises.get(s) ?? null} fallbackName={s} sizePx={16} />
                ))}
                <span className="truncate">{m.franchiseSlugs.map((s) => franchises.get(s)?.nickname ?? s).join(' · ') || m.teamName}</span>
              </span>
              {multi || m.position ? (
                <span className="mt-[10px] flex flex-wrap items-center gap-[6px]">
                  {multi ? <Badge tone="gold">{m.mvpNumber ? `MVP #${m.mvpNumber}` : 'MVP múltiple'}</Badge> : null}
                  {m.position ? <span className={`${cls.meta} !text-[11.5px]`}>{m.position}</span> : null}
                </span>
              ) : null}
            </CardLink>
          );
        })}
      </div>
    </ArchivoShell>
  );
}
