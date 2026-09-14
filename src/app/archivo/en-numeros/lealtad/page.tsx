import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import Tabs from '@/archivo/components/Tabs';
import { PaperCard } from '@/archivo/components/ui';
import { getFranchiseMap, getLoyalty } from '@/archivo/lib/data';
import { cls } from '@/archivo/lib/tokens';
import type { LoyaltyEntry } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Un solo uniforme · Archivo BSN', description: 'Los jugadores que nunca cambiaron de equipo en el BSN, y los que vistieron más camisetas.' };

const LIMIT = 30;
const MAX_LOGOS = 8;

function List({ list, label, total }: { list: LoyaltyEntry[]; label: string; total: number }) {
  const franchises = getFranchiseMap();
  return (
    <div>
      <p className={`mb-[6px] ${cls.label}`}>
        {label} · {total}
      </p>
      <ol>
        {list.slice(0, LIMIT).map((e, i) => (
          <li key={e.playerId} className="grid min-h-[56px] grid-cols-[24px_1fr_auto] items-center gap-x-[10px] border-b border-[rgba(0,0,0,0.05)] py-[8px] last:border-b-0">
            <span className="font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)]">{i + 1}</span>
            <Link href={`/archivo/jugadores/${e.slug}`} className={`min-w-0 rounded-[4px] ${cls.focus}`}>
              <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{e.name}</span>
              <span className={`block font-barlow text-[12px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>{e.seasons} temporadas</span>
            </Link>
            <span className="flex shrink-0 items-center gap-[3px]">
              {e.franchiseSlugs.slice(0, MAX_LOGOS).map((s, j) => (
                <FranchiseLogo key={`${s}-${j}`} franchise={franchises.get(s) ?? null} fallbackName={s} sizePx={20} />
              ))}
              {e.franchiseSlugs.length > MAX_LOGOS ? <span className={`ml-[3px] font-barlow text-[11.5px] font-semibold text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>+{e.franchiseSlugs.length - MAX_LOGOS}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LealtadPage() {
  const data = getLoyalty();
  const maxTeams = data.journeymen[0]?.franchiseSlugs.length ?? 0;
  return (
    <InsightPage
      title="Un solo uniforme"
      context={`Algunos nunca cambiaron de camiseta. Otros vistieron ${maxTeams}.`}
      heroNumber={data.oneClub.length}
      heroNumberLabel="jugadores de un solo club"
      source={`Mínimo ${data.minSeasons} temporadas. Un solo club: toda la carrera con una franquicia. Trotamundos: cuatro o más franquicias distintas. Se muestran los primeros ${LIMIT} de cada lista.`}
    >
      <PaperCard className="px-[16px] py-[16px] md:px-[26px] md:py-[22px]">
        <p className="mb-[14px] font-barlow text-[12px] font-bold uppercase tracking-[1px] text-[#0F171F]">Un solo uniforme · Dos listas</p>
        <div className="md:hidden">
          <Tabs
            small
            tabs={[
              { label: `Un solo club`, panel: <List list={data.oneClub} label="Un solo club" total={data.oneClub.length} /> },
              { label: `Trotamundos`, panel: <List list={data.journeymen} label="Trotamundos" total={data.journeymen.length} /> },
            ]}
          />
        </div>
        <div className="hidden grid-cols-2 gap-[40px] md:grid">
          <List list={data.oneClub} label="Un solo club" total={data.oneClub.length} />
          <List list={data.journeymen} label="Trotamundos" total={data.journeymen.length} />
        </div>
      </PaperCard>
    </InsightPage>
  );
}
