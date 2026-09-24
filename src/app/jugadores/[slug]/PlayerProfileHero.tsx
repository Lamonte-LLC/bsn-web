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
function Jersey({ n }: { n: string }) {
  return (
    <span className="absolute -bottom-[12px] left-1/2 inline-flex h-[26px] -translate-x-1/2 items-center rounded-full border border-white/18 bg-gradient-to-b from-[#2A333D] to-[#1B232C] px-[10px] font-barlow text-[13px] font-bold tracking-[0.3px] text-white tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.35)] lg:-bottom-[14px] lg:h-[30px] lg:px-[12px] lg:text-[15px]">
      <span className="mr-px text-white/45">#</span>
      {n}
    </span>
  );
}

function Avatar({ profile }: Props) {
  const color = profile.club?.color ?? profile.mainClub?.color ?? 'rgba(255,255,255,0.22)';
  const shadow = 'shadow-[0_10px_26px_rgba(0,0,0,0.26)]';
  return (
    <span className="relative inline-flex shrink-0">
      {profile.avatarUrl ? (
        <span className={`inline-flex h-[112px] w-[112px] overflow-hidden rounded-full border-[3px] bg-[#0F171F] lg:h-[160px] lg:w-[160px] lg:border-4 ${shadow}`} style={{ borderColor: color }}>
          <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover object-top" />
        </span>
      ) : (
        <>
          <span className="lg:hidden"><PlayerAvatar name={profile.name} color={color} sizePx={112} onDark className={shadow} /></span>
          <span className="hidden lg:block"><PlayerAvatar name={profile.name} color={color} sizePx={160} onDark className={shadow} /></span>
        </>
      )}
      {profile.jersey ? <Jersey n={profile.jersey} /> : null}
    </span>
  );
}

/** The clubs of the career as a row of marks under the years, oldest first, each in its own dark disc. */
function ClubRow({ clubs }: { clubs: PlayerProfileData['clubs'] }) {
  return (
    <span className="flex flex-wrap items-center gap-[6px]" role="list" aria-label="Equipos">
      {clubs.map((c) => (
        <span key={c.code} role="listitem" title={c.name} className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/12 bg-[#1A222B] lg:h-[34px] lg:w-[34px]">
          <span className="lg:hidden"><ClubMark code={c.code} color={c.color} size={20} /></span>
          <span className="hidden lg:block"><ClubMark code={c.code} color={c.color} size={24} /></span>
        </span>
      ))}
    </span>
  );
}

type Fact = { label: string; value: React.ReactNode; sub?: string | null };

function Facts({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-[12px] gap-y-[16px] lg:flex lg:gap-0">
      {facts.map((f, i) => (
        <div key={f.label} className={i ? 'min-w-0 lg:ml-[22px] lg:border-l lg:border-white/12 lg:pl-[22px]' : 'min-w-0'}>
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
function DeepBox({ label, short, value, boxes4 = false }: { label: string; short: string; value: string; /** Four boxes sit 2×2 on phones, with room for the full label. */ boxes4?: boolean }) {
  return (
    <div className="rounded-[14px] border border-white/[0.12] bg-white/[0.045] p-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-[14px] lg:px-[18px] lg:py-[16px]">
      <div className={`${LABEL} text-white/50`}>
        <span className={boxes4 ? 'hidden' : 'lg:hidden'}>{short}</span>
        <span className={boxes4 ? '' : 'hidden lg:inline'}>{label}</span>
      </div>
      <div className="mt-[8px] text-[28px] leading-none text-white tabular-nums lg:text-[32px]">{value}</div>
    </div>
  );
}

/** The span of a retired player's career, in the display face: the years carry the weight, the dash steps back. */
function Years({ fy, ly }: { fy: number; ly: number }) {
  return (
    <span className="inline-flex items-baseline gap-[6px] text-[18px] leading-none text-white tabular-nums lg:text-[20px]">
      <span className={`${LABEL} mr-[4px] text-white/55`}>Activo</span>
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

/** "ARCHIVO BSN" as type alone: condensed italic, the league's red on the acronym, no plaque around it. */
function ArchivoMark() {
  return (
    <span className="inline-flex shrink-0 items-center gap-[12px]">
      <span className="whitespace-nowrap font-barlow-condensed text-[14px] font-extrabold italic uppercase leading-none tracking-[0.6px] text-white">
        Archivo <span className="text-[#E51F1F]">BSN</span>
      </span>
      <span className="h-[12px] w-px bg-white/20" aria-hidden />
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
  const facts: Fact[] = [];
  if (p.heightCm) facts.push({ label: 'Estatura', value: formatInches(centimeterToInches(p.heightCm)) });
  if (p.weightKg) facts.push({ label: 'Peso', value: `${Math.round(kilogramToPounds(p.weightKg))} lbs` });
  const born = birthShort(p.dob);
  if (born) facts.push({ label: 'Nacimiento', value: born, sub: age !== null ? `${age} años` : null });
  if (country && p.nationality) facts.push({ label: 'Lugar de origen', value: <><Flag code={p.nationality} />{country}</> });
  if (p.debut) facts.push({ label: 'Debut en BSN', value: String(p.debut.year), sub: p.debut.club || null });
  if (p.active && p.seasonsCount) facts.push({ label: 'Experiencia', value: `${p.seasonsCount} ${p.seasonsCount === 1 ? 'año' : 'años'}` });

  const s = p.active ? p.season?.stats ?? null : p.career;
  const boxes = [
    { label: 'Puntos por juego', short: 'PPJ', value: f1(s?.pointsAvg) },
    { label: 'Rebotes por juego', short: 'RPJ', value: f1(s?.reboundsTotalAvg) },
    { label: 'Asistencias por juego', short: 'APJ', value: f1(s?.assistsAvg) },
  ];
  if (!p.active) boxes.push({ label: 'Temporadas en BSN', short: 'Temp.', value: p.seasonsCount ? String(p.seasonsCount) : '–' });
  const blockMeta = p.active ? `Promedios · Temporada ${p.season?.year ?? ''}`.trim() : ['Promedios de carrera', span].filter(Boolean).join(' · ');

  return (
    <section className="container pb-[40px] pt-[22px] lg:pb-[56px] lg:pt-[36px]">
      <div className="flex items-start gap-[16px] lg:items-center lg:gap-[28px]">
        <Avatar profile={p} />
        <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-[40px]">
          <div className="min-w-0 lg:flex-1">
            <h1 className="text-[27px] leading-[1] text-white lg:text-[42px]">
              {p.name}
              {p.nickname ? <span className="mt-[4px] block text-[19px] text-white/45 lg:mt-0 lg:inline lg:text-[42px]"><span className="hidden lg:inline"> </span>“{p.nickname}”</span> : null}
            </h1>
            <div className="mt-[10px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] font-barlow text-[13px] font-medium text-white/72 lg:text-[15px]">
              {p.position ? <span>{p.position}</span> : null}
              {p.active ? (
                <>
                  {p.position && p.club ? <span className="text-white/30">·</span> : null}
                  {p.club ? (
                    <span className="inline-flex items-center gap-[8px]">
                      <ClubMark code={p.club.code} color={p.club.color} size={22} />
                      {p.club.name}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  {p.position && span ? <span className="text-white/30">·</span> : null}
                  {span ? <Years fy={p.firstYear!} ly={p.lastYear!} /> : null}
                </>
              )}
            </div>
            {!p.active && p.clubs.length ? <div className="mt-[12px] lg:mt-[14px]"><ClubRow clubs={p.clubs} /></div> : null}
            {p.active && facts.length ? <div className="mt-[22px] hidden lg:block"><Facts facts={facts} /></div> : null}
          </div>
          {!p.active && facts.length ? <div className="hidden shrink-0 lg:block"><Facts facts={facts} /></div> : null}
        </div>
      </div>
      {facts.length ? <div className="mt-[22px] lg:hidden"><Facts facts={facts} /></div> : null}

      <div className="mt-[36px] lg:mt-[46px]">
        <div className="mb-[12px] flex items-center gap-[12px]">
          {!p.active ? <ArchivoMark /> : null}
          <span className="truncate font-barlow text-[13px] font-semibold text-white tabular-nums lg:text-[14px]">{blockMeta}</span>
          <span className="h-px min-w-[24px] flex-1 bg-white/10" aria-hidden />
        </div>
        <div className={`grid gap-[8px] lg:gap-[12px] ${boxes.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
          {boxes.map((b) => <DeepBox key={b.label} {...b} boxes4={boxes.length === 4} />)}
        </div>
      </div>
    </section>
  );
}
