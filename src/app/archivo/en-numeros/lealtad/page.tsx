import type { Metadata } from 'next';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import InsightPage from '@/archivo/components/InsightPage';
import Tabs from '@/archivo/components/Tabs';
import { Eyebrow } from '@/archivo/components/ui';
import { getFranchiseMap, getLoyalty } from '@/archivo/lib/data';
import type { LoyaltyEntry } from '@/archivo/lib/types';

export const metadata: Metadata = { title: 'Un solo uniforme · Archivo BSN', description: 'Los jugadores que nunca cambiaron de equipo en el BSN, y los que vistieron más camisetas.' };

function List({ list, limit }: { list: LoyaltyEntry[]; limit: number }) {
  const franchises = getFranchiseMap();
  return (
    <ol className="rounded-[12px] border border-[#EAEAEA] bg-white">
      {list.slice(0, limit).map((e, i) => (
        <li key={e.playerId} className={`flex min-h-[52px] items-center gap-[10px] px-[12px] py-[6px] ${i ? 'border-t border-[rgba(0,0,0,0.05)]' : ''}`}>
          <span className="w-[22px] shrink-0 font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 1}</span>
          <Link href={`/archivo/jugadores/${e.slug}`} className="min-w-0 flex-1 hover:underline">
            <span className="block truncate text-[16px] text-[rgba(15,23,31,0.9)]">{e.name}</span>
            <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">{e.seasons} temporadas</span>
          </Link>
          <span className="flex shrink-0 items-center gap-[2px]">
            {e.franchiseSlugs.slice(0, 8).map((s, j) => (
              <FranchiseLogo key={`${s}-${j}`} franchise={franchises.get(s) ?? null} fallbackName={s} sizePx={22} />
            ))}
            {e.franchiseSlugs.length > 8 ? <span className="font-barlow text-[11px] text-[rgba(15,23,31,0.5)]">+{e.franchiseSlugs.length - 8}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function LealtadPage() {
  const data = getLoyalty();
  const LIMIT = 30;
  const maxTeams = data.journeymen[0]?.franchiseSlugs.length ?? 0;
  return (
    <InsightPage title="Un solo uniforme" context={`Algunos nunca cambiaron de camiseta. Otros vistieron ${maxTeams}.`} heroNumber={data.oneClub.length} heroNumberLabel="jugadores de un solo club">
      <div className="md:hidden">
        <Tabs
          tabs={[
            { label: `Un solo club (${data.oneClub.length})`, panel: <List list={data.oneClub} limit={LIMIT} /> },
            { label: `Trotamundos (${data.journeymen.length})`, panel: <List list={data.journeymen} limit={LIMIT} /> },
          ]}
        />
      </div>
      <div className="hidden grid-cols-2 gap-6 md:grid">
        <div>
          <Eyebrow className="mb-2">Un solo club · {data.oneClub.length}</Eyebrow>
          <List list={data.oneClub} limit={LIMIT} />
        </div>
        <div>
          <Eyebrow className="mb-2">Trotamundos · {data.journeymen.length}</Eyebrow>
          <List list={data.journeymen} limit={LIMIT} />
        </div>
      </div>
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">
        Se consideran jugadores con al menos {data.minSeasons} temporadas. Un solo club: toda la carrera con una franquicia. Trotamundos: cuatro o más franquicias distintas. Se muestran los primeros {LIMIT} de cada lista.
      </p>
    </InsightPage>
  );
}
