import ScoringClubClient from '@/app/archivo/en-numeros/club-de-los-20/ScoringClubClient';
import InsightPage from '@/archivo/components/InsightPage';
import { getFranchises, getScoringClub } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';

/** El club de los 20: seasons of 15, 20, 25 and 30 points per game by decade, with the full list per threshold. */
export default function ClubDeLos20Content({ site = false }: { site?: boolean }) {
  const data = getScoringClub();
  const franchises = franchiseViewMap(getFranchises());
  return (
    <InsightPage
      site={site}
      title="El club de los 20"
      context="En los setenta, promediar treinta era posible. Hoy, veinte es una hazaña."
      heroNumber={data.byThreshold['20']?.length ?? 0}
      heroNumberLabel="temporadas de 20 o más puntos por juego"
      source={`Serie Regular, mínimo ${data.minGames} juegos por temporada.`}
    >
      <ScoringClubClient data={data} franchises={franchises} site={site} />
    </InsightPage>
  );
}
