import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import EstadisticasHero from './EstadisticasHero';
import EstadisticasPageClient from './EstadisticasPageClient';

export default function EstadisticasPage() {
  return (
    <FullWidthLayout divider subheader={<EstadisticasHero />}>
      <EstadisticasPageClient />
    </FullWidthLayout>
  );
}
