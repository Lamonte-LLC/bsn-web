import HeaderBoxLayout from '@/shared/components/layout/box/Header';
import FooterBoxLayout from '@/shared/components/layout/box/Footer';
import EstadisticasPageClient from './EstadisticasPageClient';

export default function EstadisticasPage() {
  return (
    <>
      <HeaderBoxLayout />
      <EstadisticasPageClient />
      <FooterBoxLayout />
    </>
  );
}
