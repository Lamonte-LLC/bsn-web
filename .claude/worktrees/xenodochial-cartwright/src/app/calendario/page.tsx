import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import LeagueCalendarWidget from '@/match/client/widgets/LeagueCalendarWidget';

export default function CalendarioPage() {
  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="py-[30px] md:py-[60px]">
          <div className="container">
            <h2 className="text-center text-[26px] text-white md:text-[36px] lg:text-[42px]">
              Calendario 2026
            </h2>
          </div>
        </section>
      }
    >
      <section>
        <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
          <div className="container">
            <LeagueCalendarWidget />
          </div>
        </div>
      </section>
    </FullWidthLayout>
  );
}
