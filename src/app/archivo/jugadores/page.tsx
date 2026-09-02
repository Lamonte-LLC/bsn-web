import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchises, getPlayerIndex } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import JugadoresClient from './JugadoresClient';

export const metadata: Metadata = {
  title: 'Jugadores · Archivo BSN',
  description: 'Índice de todos los jugadores en la historia del BSN, con su carrera temporada por temporada.',
};

export default function ArchivoJugadoresPage() {
  const players = getPlayerIndex();
  const franchises = franchiseViewMap(getFranchises());
  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>{players.length.toLocaleString('es-PR')} jugadores desde 1956</HeroEyebrow>
          <HeroTitle>Jugadores</HeroTitle>
        </div>
      }
    >
      <JugadoresClient franchises={franchises} />
    </ArchivoShell>
  );
}
