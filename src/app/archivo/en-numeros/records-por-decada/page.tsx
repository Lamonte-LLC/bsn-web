import type { Metadata } from 'next';
import RecordsPorDecadaContent from '@/archivo/components/pages/RecordsPorDecadaContent';

export const metadata: Metadata = { title: 'Lo mejor de cada década · Archivo BSN', description: 'El mejor registro de temporada regular por década en puntos, rebotes, asistencias, robos y bloqueos.' };

export default function Page() {
  return <RecordsPorDecadaContent />;
}
