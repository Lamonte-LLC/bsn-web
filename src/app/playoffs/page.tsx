import Header from '@/shared/components/layout/fullwidth/Header';
import Footer from '@/shared/components/layout/fullwidth/Footer';
import PlayoffsPageClient from './PlayoffsPageClient';

export default function PlayoffsPage() {
  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <header className="bg-bsn">
        <Header />
      </header>
      <PlayoffsPageClient />
      <Footer />
    </div>
  );
}
