import type { Metadata } from 'next';
import DinastiasContent from '@/archivo/components/pages/DinastiasContent';

export const metadata: Metadata = { title: 'Dinastías · Archivo BSN', description: 'Los títulos acumulados por franquicia en el BSN, año por año desde 1930.' };

export default function Page() {
  return <DinastiasContent />;
}
