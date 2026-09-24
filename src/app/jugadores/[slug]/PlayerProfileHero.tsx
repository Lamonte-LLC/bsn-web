import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import ClubMark from '@/historia/components/ClubMark';
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
  const px = phone ? 68 : 160;
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

type Fact = { label: string; value: React.ReactNode; sub?: string | null };

function Facts({ facts, grid = false }: { facts: Fact[]; /** Desktop: a 4-column grid at the right of the name block instead of one row. */ grid?: boolean }) {
  return (
    <dl className={grid ? 'grid grid-cols-4 gap-x-[28px] gap-y-[18px]' : 'flex'}>
      {facts.map((f, i) => (
        <div key={f.label} className={cx('min-w-0', i && !grid && 'ml-[22px] border-l border-white/12 pl-[22px]')}>
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
    <span className={cx('inline-flex items-baseline gap-[5px] font-special-gothic-condensed-one leading-none text-white tabular-nums', small ? 'text-[17px]' : 'text-[20px]')}>
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

/** The Archivo BSN mark: a ball inside a white ring and a blue outer ring, "ARCHIVO" light and tracked, "BSN" heavy. */
function ArchivoMark() {
  return (
    <span className="inline-flex shrink-0 items-center gap-[8px] lg:gap-[10px]" aria-label="Archivo BSN">
      <svg viewBox="0 0 40 40" fill="none" aria-hidden className="h-[22px] w-[22px] lg:h-[28px] lg:w-[28px]">
        <circle cx="20" cy="20" r="18.5" stroke="#4A8DF0" strokeWidth="2.2" />
        <circle cx="20" cy="20" r="14.2" stroke="#fff" strokeWidth="2" />
        <circle cx="20" cy="20" r="8.6" stroke="#fff" strokeWidth="1.6" />
        <path d="M20 11.4v17.2M11.4 20h17.2M14.2 13.9c2.4 2 3.6 4 3.6 6.1s-1.2 4.1-3.6 6.1M25.8 13.9c-2.4 2-3.6 4-3.6 6.1s1.2 4.1 3.6 6.1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="inline-flex items-baseline gap-[5px] whitespace-nowrap leading-none lg:gap-[6px]">
        <span className="font-barlow-condensed text-[17px] uppercase tracking-[2.5px] text-white lg:text-[20px] lg:tracking-[3px]">Archivo</span>
        <span className="text-[17px] uppercase tracking-[1px] text-white lg:text-[20px]">BSN</span>
      </span>
    </span>
  );
}

/** Under the nav, the mark alone on a hairline: the player belongs to the archive. */
function ArchivoStrip() {
  return (
    <div className="container flex h-[40px] items-end lg:h-[52px]">
      <ArchivoMark />
    </div>
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
  const dash = <span className="text-white/35">–</span>;
  const born = birthShort(p.dob);
  const facts: Fact[] = [
    { label: 'Posición', value: p.position ?? dash },
    { label: 'Estatura', value: p.heightCm ? formatInches(centimeterToInches(p.heightCm)) : dash },
    { label: 'Peso', value: p.weightKg ? `${Math.round(kilogramToPounds(p.weightKg))} lbs` : dash },
    { label: 'Nacimiento', value: born ?? dash, sub: born && age !== null ? `${age} años` : null },
    { label: 'Lugar de origen', value: country && p.nationality ? <><Flag code={p.nationality} />{country}</> : dash },
    { label: 'Debut en BSN', value: p.debut ? String(p.debut.year) : dash, sub: p.debut?.club || null },
    { label: 'Experiencia', value: p.seasonsCount ? `${p.seasonsCount} ${p.seasonsCount === 1 ? 'año' : 'años'}` : dash },
  ];

  const s = p.active ? p.season?.stats ?? null : p.career;
  const boxes = [
    { label: 'Puntos por juego', short: 'PPJ', value: f1(s?.pointsAvg) },
    { label: 'Rebotes por juego', short: 'RPJ', value: f1(s?.reboundsTotalAvg) },
    { label: 'Asistencias por juego', short: 'APJ', value: f1(s?.assistsAvg) },
  ];
  if (!p.active) boxes.push({ label: 'Temporadas en BSN', short: 'Temp.', value: p.seasonsCount ? String(p.seasonsCount) : '–' });
  const blockMeta = p.active ? `Promedios · Temporada ${p.season?.year ?? ''}`.trim() : ['Promedios de carrera', span].filter(Boolean).join(' · ');

  const phoneFacts = facts.map((f) => ({ ...f, label: f.label === 'Lugar de origen' ? 'Origen' : f.label }));
  const phoneFigures = [...boxes.map((b) => ({ label: b.short, value: b.value }))];
  if (!p.active) phoneFigures[3] = { label: 'Temporadas', value: boxes[3].value };

  return (
    <>
    {!p.active ? <ArchivoStrip /> : null}
    {/* Phones: one translucent panel with the identity, the facts and the figures; only the panel has a border. */}
    <section className={cx('container pb-[36px] lg:hidden', p.active ? 'pt-[16px]' : 'pt-[12px]')}>
      <div className="rounded-[14px] border border-white/[0.12] bg-white/[0.045] px-[14px] pb-[16px] pt-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[14px]">
        <div className="flex items-center gap-[12px]">
          <Avatar profile={p} phone />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-[1] text-white">
              {p.name}
              {p.nickname ? <span className="text-white/45"> “{p.nickname}”</span> : null}
            </h1>
            <div className="mt-[8px] flex flex-wrap items-center gap-x-[7px] font-barlow text-[13px] font-medium text-white/72">
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
            {!p.active && p.clubs.length ? <div className="mt-[10px]"><ClubRow clubs={p.clubs} size={16} /></div> : null}
          </div>
        </div>
        <dl className={cx('grid grid-cols-2 gap-x-[14px] gap-y-[12px]', p.active ? 'mt-[26px]' : 'mt-[18px]')}>
          {phoneFacts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className={`${LABEL} text-[9.5px] tracking-[0.6px] text-white/55`}>{f.label}</dt>
              <dd className="mt-[4px] flex items-baseline gap-[6px] whitespace-nowrap">
                <span className="inline-flex items-center gap-[6px] text-[15px] leading-none text-white">{f.value}</span>
                {f.sub ? <span className="font-barlow text-[11.5px] font-medium text-white/60 tabular-nums">{f.sub}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className={`mt-[20px] ${LABEL} text-[10px] text-white/50`}>{blockMeta}</div>
        <div className={cx('mt-[10px] grid gap-[10px]', phoneFigures.length === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
          {phoneFigures.map((b) => (
            <div key={b.label} className="min-w-0">
              <div className="text-[24px] leading-none text-white tabular-nums">{b.value}</div>
              <div className={`${LABEL} mt-[5px] text-[9.5px] tracking-[0.6px] text-white/55`}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className={`container hidden pb-[56px] lg:block ${p.active ? 'pt-[36px]' : 'pt-[28px]'}`}>
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
            {!p.active && p.clubs.length ? <div className="mt-[12px]"><ClubRow clubs={p.clubs} /></div> : null}
            {p.active ? <div className="mt-[22px]"><Facts facts={facts} /></div> : null}
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
