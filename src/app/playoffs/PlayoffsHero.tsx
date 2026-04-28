import PlayoffsHeroCarousel from './PlayoffsHeroCarousel';
import PlayoffsBracket from './PlayoffsBracket';

export default function PlayoffsHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative">
        {/* Centered logo */}
        <div className="flex justify-center pt-6 pb-6 lg:pt-10 lg:pb-10">
          <img
            src="/assets/images/playoffs-logo.png"
            alt="BSN Playoffs 2026"
            className="w-[180px] sm:w-[220px] lg:w-[280px] h-auto"
          />
        </div>

        {/* Eyebrow */}
        <p
          className="text-center font-barlow font-semibold text-[11px] lg:text-[12px] text-white/55 uppercase mb-5 lg:mb-6"
          style={{ letterSpacing: '3px' }}
        >
          BSN Playoffs 2026
        </p>

        {/* Bracket — first in the hero band, beneath the eyebrow */}
        <div className="pb-12 lg:pb-16">
          <PlayoffsBracket />
        </div>

        {/* Carousel */}
        <div className="pb-14 lg:pb-20">
          <PlayoffsHeroCarousel />
        </div>
      </div>
    </section>
  );
}
