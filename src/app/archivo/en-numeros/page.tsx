import type { Metadata } from 'next';
import EnNumerosContent from '@/archivo/components/pages/EnNumerosContent';

export const metadata: Metadata = { title: 'El BSN en números · Archivo BSN', description: 'Ocho historias del BSN contadas con data: dirigentes, MVPs, longevidad, lealtad, récords y dinastías.' };

export default function Page() {
  return <EnNumerosContent />;
}
