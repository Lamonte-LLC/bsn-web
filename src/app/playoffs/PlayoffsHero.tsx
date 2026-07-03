import PlayoffsHeroCarousel from './PlayoffsHeroCarousel';
import PlayoffsBracket from './PlayoffsBracket';

export default function PlayoffsHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Extended radial — pushes the bg-bsn highlight further down so it */}
      {/* falls behind the calendar belt as well as the bracket. Sits on top */}
      {/* of the FullWidthLayout's bg-bsn but below all hero content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 95% at 50% 60%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div className="container relative">
        {/* Centered logo */}
        <div className="flex justify-center pt-6 pb-6 lg:pt-10 lg:pb-10">
          <img
            src="/assets/images/playoffs-logo.png"
            alt="BSN Playoffs 2026"
            className="w-[180px] sm:w-[220px] lg:w-[280px] h-auto"
          />
        </div>

        {/* Bracket */}
        <div className="pb-12 lg:pb-16">
          <PlayoffsBracket />
        </div>
      </div>

      {/* Calendar belt — sits on the same hero/bracket bg. A single hairline */}
      {/* divider above provides a subtle structural break without a separate */}
      {/* band background. */}
      <div className="container relative">
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.125) 50%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div className="pt-[45px] pb-[46px] lg:pt-[45px] lg:pb-[46px]">
          <PlayoffsHeroCarousel />
        </div>
      </div>
    </section>
  );
}
