import cx from 'classnames';
import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import ClubMark from '@/historia/components/ClubMark';
import { compareHref } from '@/historia/lib/compare-players';
import { birthShort, nationalityLabel } from '@/historia/lib/copy';
import { centimeterToInches, kilogramToPounds } from '@/utils/unit-converter';
import { formatInches } from '@/utils/unit-formater';
import { ageFrom, f1, type PlayerProfileData } from './profile-data';

type Props = { profile: PlayerProfileData };

const LABEL = 'whitespace-nowrap font-barlow text-[11px] font-semibold uppercase tracking-[0.8px]';

/** Flag of the countries the roster actually has; nothing for the rest, never a placeholder. */
function Flag({ code }: { code: string }) {
  const c = code.toUpperCase();
  const common = { width: 18, height: 12, viewBox: '0 0 18 12', className: 'shrink-0 rounded-[2px]', 'aria-hidden': true } as const;
  if (c === 'PUR' || c === 'PR') {
    return (
      <svg {...common}>
        <rect width="18" height="12" fill="#fff" />
        {[0, 4.8, 9.6].map((y) => <rect key={y} y={y} width="18" height="2.4" fill="#ED0000" />)}
        <path d="M0 0L9 6 0 12z" fill="#0050F0" />
        <path d="M3 4.05l.62 1.9h2l-1.62 1.18.62 1.9L3 7.85l-1.62 1.18.62-1.9L.38 5.95h2z" fill="#fff" />
      </svg>
    );
  }
  if (c === 'USA' || c === 'US') {
    return (
      <svg {...common}>
        <rect width="18" height="12" fill="#B22234" />
        {[1, 3, 5, 7, 9, 11].map((y) => <rect key={y} y={y - 0.15} width="18" height="0.9" fill="#fff" />)}
        <rect width="8" height="6.5" fill="#3C3B6E" />
      </svg>
    );
  }
  if (c === 'DOM' || c === 'DO') {
    return (
      <svg {...common}>
        <rect width="18" height="12" fill="#002D62" />
        <rect x="9" width="9" height="6" fill="#CE1126" />
        <rect y="6" width="9" height="6" fill="#CE1126" />
        <rect x="7.6" width="2.8" height="12" fill="#fff" />
        <rect y="4.6" width="18" height="2.8" fill="#fff" />
      </svg>
    );
  }
  return null;
}

/** The jersey number hanging from the bottom of the photo: a narrow dark capsule, the "#" dimmed. */
function Jersey({ n, small = false }: { n: string; small?: boolean }) {
  return (
    <span className={cx('absolute left-1/2 inline-flex -translate-x-1/2 items-center rounded-full border border-white/18 bg-gradient-to-b from-[#2A333D] to-[#1B232C] font-barlow font-bold tracking-[0.3px] text-white tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.35)]', small ? '-bottom-[10px] h-[22px] px-[9px] text-[12px]' : '-bottom-[14px] h-[30px] px-[12px] text-[15px]')}>
      <span className="mr-px text-white/45">#</span>
      {n}
    </span>
  );
}

function Avatar({ profile, phone = false }: Props & { /** 68px inside the phone panel; 160px on the desktop band. */ phone?: boolean }) {
  const color = profile.club?.color ?? profile.mainClub?.color ?? 'rgba(255,255,255,0.22)';
  const shadow = phone ? '' : 'shadow-[0_10px_26px_rgba(0,0,0,0.26)]';
  const px = phone ? 96 : 160;
  return (
    <span className="relative inline-flex shrink-0">
      {profile.avatarUrl ? (
        <span className={cx('inline-flex overflow-hidden rounded-full bg-[#0F171F]', phone ? 'border-[3px]' : 'border-4', shadow)} style={{ borderColor: color, width: px, height: px }}>
          <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover object-top" />
        </span>
      ) : (
        <PlayerAvatar name={profile.name} color={color} sizePx={px} onDark className={shadow} />
      )}
      {profile.jersey ? <Jersey n={profile.jersey} small={phone} /> : null}
    </span>
  );
}

/** The clubs of the career as a row of marks under the years, oldest first, each in its own dark disc. */
function ClubRow({ clubs, size = 24 }: { clubs: PlayerProfileData['clubs']; /** Mark size; the disc adds 10px. */ size?: number }) {
  return (
    <span className="flex flex-wrap items-center gap-[5px]" role="list" aria-label="Equipos">
      {clubs.map((c) => (
        <span key={c.code} role="listitem" title={c.name} className="flex items-center justify-center rounded-full border border-white/12 bg-[#1A222B]" style={{ width: size + 10, height: size + 10 }}>
          <ClubMark code={c.code} color={c.color} size={size} />
        </span>
      ))}
    </span>
  );
}

type Fact = { label: string; value: React.ReactNode; sub?: string | null; /** Takes two columns of the grid (the club logos). */ wide?: boolean };

function Facts({ facts, grid = false }: { facts: Fact[]; /** Desktop: a 4-column grid at the right of the name block instead of one row. */ grid?: boolean }) {
  return (
    <dl className={grid ? 'grid grid-cols-4 gap-x-[28px] gap-y-[18px]' : 'flex'}>
      {facts.map((f, i) => (
        <div key={f.label} className={cx('min-w-0', i && !grid && 'ml-[22px] border-l border-white/12 pl-[22px]', grid && f.wide && 'col-span-2')}>
          <dt className={`${LABEL} text-white/55`}>{f.label}</dt>
          <dd className="mt-[6px] flex items-baseline gap-[7px] whitespace-nowrap">
            <span className="inline-flex items-center gap-[7px] text-[19px] leading-none text-white">{f.value}</span>
            {f.sub ? <span className="font-barlow text-[12.5px] font-medium text-white/60 tabular-nums">{f.sub}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** One of the headline boxes: a hairline, a faint translucent fill and a blur of the band behind it. */
function DeepBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/[0.12] bg-white/[0.045] px-[18px] py-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-[14px]">
      <div className={`${LABEL} text-white/50`}>{label}</div>
      <div className="mt-[8px] text-[32px] leading-none text-white tabular-nums">{value}</div>
    </div>
  );
}

/** The span of a retired player's career, in the display face: the years carry the weight, the dash steps back. */
function Years({ fy, ly, small = false }: { fy: number; ly: number; small?: boolean }) {
  return (
    <span className={cx('inline-flex items-baseline gap-[5px] font-special-gothic-condensed-one leading-none text-white tabular-nums', small ? 'text-[15px]' : 'text-[18px]')}>
      <span className={cx(LABEL, 'mr-[3px] text-white/55', small && 'text-[10px]')}>Años activo</span>
      {fy}
      {fy !== ly ? (
        <>
          <span className="text-[14px] text-white/35">—</span>
          {ly}
        </>
      ) : null}
    </span>
  );
}

/**
 * The ink band of the profile: photo, name, position and club (or the span of the career), the facts row and
 * three headline boxes. An active player shows this season's averages; a retired one, the career's, under the
 * Archivo BSN mark. The card with the tabs overlaps the bottom of the band.
 */
export default function PlayerProfileHero({ profile }: Props) {
  const p = profile;
  const age = ageFrom(p.dob);
  const country = nationalityLabel(p.nationality);

  const span = p.firstYear !== null && p.lastYear !== null ? `${p.firstYear}–${p.lastYear}` : null;
  const born = birthShort(p.dob);
  const facts: Fact[] = [];
  if (p.position) facts.push({ label: 'Posición', value: p.position });
  if (p.heightCm) facts.push({ label: 'Estatura', value: formatInches(centimeterToInches(p.heightCm)) });
  if (p.weightKg) facts.push({ label: 'Peso', value: `${Math.round(kilogramToPounds(p.weightKg))} lbs` });
  if (born) facts.push({ label: 'Nacimiento', value: born, sub: age !== null ? `${age} años` : null });
  if (country && p.nationality) facts.push({ label: 'Lugar de origen', value: <><Flag code={p.nationality} />{country}</> });
  if (p.debut) facts.push({ label: 'Debut en BSN', value: String(p.debut.year), sub: p.debut.club || null });
  if (p.seasonsCount) facts.push({ label: 'Experiencia', value: `${p.seasonsCount} ${p.seasonsCount === 1 ? 'año' : 'años'}` });
  if (!p.active && p.clubs.length) facts.push({ label: 'Equipos', value: <ClubRow clubs={p.clubs} size={20} />, wide: true });

  const s = p.active ? p.season?.stats ?? null : p.career;
  const boxes = [
    { label: 'Puntos por juego', short: 'PPJ', value: f1(s?.pointsAvg) },
    { label: 'Rebotes por juego', short: 'RPJ', value: f1(s?.reboundsTotalAvg) },
    { label: 'Asistencias por juego', short: 'APJ', value: f1(s?.assistsAvg) },
  ];
  if (!p.active) boxes.push({ label: 'Temporadas en BSN', short: 'Temp.', value: p.seasonsCount ? String(p.seasonsCount) : '–' });
  const blockMeta = p.active ? `Temporada ${p.season?.year ?? ''}`.trim() : ['Promedios de carrera', span].filter(Boolean).join(' · ');

  const phoneFacts = facts.filter((f) => f.label !== 'Equipos').map((f) => ({ ...f, label: f.label === 'Lugar de origen' ? 'País' : f.label }));
  const phoneFigures = p.active ? boxes.map((b) => ({ label: b.short, value: b.value })) : [{ label: 'PPJ', value: boxes[0].value }, { label: 'RPJ', value: boxes[1].value }, { label: 'APJ', value: boxes[2].value }, { label: 'Temporadas', value: boxes[3].value }];

  return (
    <>
    {/* Phones: identity, then the figures in a strip, then the bio as two columns of ruled rows. */}
    <section className="container pb-[36px] pt-[18px] lg:hidden">
      <div className="flex items-center gap-[14px] px-[2px]">
          <Avatar profile={p} phone />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-[1] text-white">
              {p.name}
              {p.nickname ? <span className="text-white/45"> “{p.nickname}”</span> : null}
            </h1>
            <div className={cx('flex flex-wrap items-center gap-x-[7px] font-barlow text-[13px] font-medium text-white/72', p.active ? 'mt-[8px]' : 'mt-[5px]')}>
              {p.active ? (
                p.club ? (
                  <span className="inline-flex items-center gap-[7px]">
                    <ClubMark code={p.club.code} color={p.club.color} size={18} />
                    {p.club.name}
                  </span>
                ) : null
              ) : span ? (
                <Years fy={p.firstYear!} ly={p.lastYear!} small />
              ) : null}
            </div>
          </div>
      </div>
      <div className={`mt-[28px] font-barlow text-[13px] font-semibold text-white tabular-nums`}>{blockMeta}</div>
      <div className="mt-[10px] rounded-[12px] border border-white/[0.12] bg-white/[0.045] px-[14px] py-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[14px]">
        <div className={cx('grid', phoneFigures.length === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
          {phoneFigures.map((b, i) => (
            <div key={b.label} className={cx('min-w-0', i && 'border-l border-white/[0.08] pl-[12px]')}>
              <div className="text-[24px] leading-none text-white tabular-nums">{b.value}</div>
              <div className={`${LABEL} mt-[5px] text-[9.5px] tracking-[0.6px] text-white/55`}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
      <dl className="mt-[14px] grid grid-cols-2 gap-x-[24px]">
        {[0, 1].map((col) => (
          <div key={col} className="min-w-0">
            {phoneFacts.filter((_, i) => i % 2 === col).map((f) => (
              <div key={f.label} className="flex h-[46px] items-center justify-between gap-[10px] border-t border-white/[0.08] first:border-t-0">
                <dt className={`${LABEL} text-[10.5px] text-white/55`}>{f.label}</dt>
                <dd className="flex items-baseline gap-[6px] whitespace-nowrap">
                  <span className="inline-flex items-center gap-[6px] text-[16px] leading-none text-white">{f.value}</span>
                  {f.sub ? <span className="font-barlow text-[12px] font-medium text-white/60 tabular-nums">{f.sub}</span> : null}
                </dd>
              </div>
            ))}
          </div>
        ))}
      </dl>
      {!p.active && p.clubs.length ? (
        <div className="flex min-h-[46px] items-center gap-[14px] border-t border-white/[0.08]">
          <span className={`${LABEL} text-[10.5px] text-white/55`}>Equipos</span>
          <ClubRow clubs={p.clubs} size={18} />
        </div>
      ) : null}
    </section>
    <section className="container hidden pb-[56px] pt-[36px] lg:block">
      <div className="flex items-center gap-[28px]">
        <Avatar profile={p} />
        <div className="flex min-w-0 flex-1 items-center gap-[40px]">
          <div className="min-w-0 flex-1">
            <h1 className="text-[42px] leading-[1] text-white">
              {p.name}
              {p.nickname ? <span className="text-white/45"> “{p.nickname}”</span> : null}
            </h1>
            <div className="mt-[10px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] font-barlow text-[15px] font-medium text-white/72">
              {p.active ? (
                <>
                  {p.club ? (
                    <span className="inline-flex items-center gap-[8px]">
                      <ClubMark code={p.club.code} color={p.club.color} size={22} />
                      {p.club.name}
                    </span>
                  ) : null}
                </>
              ) : (
                <>{span ? <Years fy={p.firstYear!} ly={p.lastYear!} /> : null}</>
              )}
            </div>
            {p.active ? <div className="mt-[22px]"><Facts facts={facts} /></div> : null}
            <Link href={compareHref([p.providerId])} className="mt-[18px] inline-flex h-[34px] items-center gap-[8px] rounded-full border border-white/30 px-[14px] font-barlow text-[13px] font-semibold text-white transition-colors duration-150 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 13V7M8 13V3M13 13V9" /></svg>
              Comparar
            </Link>
          </div>
          {!p.active ? <div className="shrink-0"><Facts facts={facts} grid /></div> : null}
        </div>
      </div>

      <div className="mt-[46px]">
        <div className="mb-[12px] flex items-center gap-[12px]">
          <span className="truncate font-barlow text-[14px] font-semibold text-white tabular-nums">{blockMeta}</span>
          <span className="h-px min-w-[24px] flex-1 bg-white/10" aria-hidden />
        </div>
        <div className={`grid gap-[12px] ${boxes.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {boxes.map((b) => <DeepBox key={b.label} label={b.label} value={b.value} />)}
        </div>
      </div>
    </section>
    </>
  );
}
