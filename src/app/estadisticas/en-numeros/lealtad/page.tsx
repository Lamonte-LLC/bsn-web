import type { Metadata } from 'next';
import LealtadContent from '@/archivo/components/pages/LealtadContent';

export const metadata: Metadata = { title: 'Un solo uniforme · Estadísticas · BSN', description: 'Los jugadores que nunca cambiaron de equipo en el BSN, y los que vistieron más camisetas.' };

export default function Page() {
  return <LealtadContent site />;
}
