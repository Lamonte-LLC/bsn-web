import type { Metadata } from 'next';
import InsightPage from '@/archivo/components/InsightPage';
import { getFranchises, getScoringClub } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import ScoringClubClient from './ScoringClubClient';

export const metadata: Metadata = { title: 'El club de los 20 · Archivo BSN', description: 'Cuántas temporadas de 15, 20, 25 y 30 puntos por juego hubo en cada década del BSN.' };

export default function ClubDeLos20Page() {
  const data = getScoringClub();
  const franchises = franchiseViewMap(getFranchises());
  return (
    <InsightPage
      title="El club de los 20"
      context="En los setenta, promediar treinta era posible. Hoy, veinte es una hazaña."
      heroNumber={data.byThreshold['20']?.length ?? 0}
      heroNumberLabel="temporadas de 20 o más puntos por juego"
      source={`Serie Regular, mínimo ${data.minGames} juegos por temporada.`}
    >
      <ScoringClubClient data={data} franchises={franchises} />
    </InsightPage>
  );
}
