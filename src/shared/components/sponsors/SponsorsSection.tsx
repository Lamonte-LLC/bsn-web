'use client';

import { useRef, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';

type Sponsor = {
  name: string;
  logo: string;
};

const PRESENTADO_POR: Sponsor[] = [
  { name: 'Telemundo Puerto Rico',          logo: '/assets/images/sponsors/telemundo.jpg' },
  { name: 'Brava Lubricants',               logo: '/assets/images/sponsors/brava.jpg' },
  { name: 'Sacatú',                         logo: '/assets/images/sponsors/sacato.jpg' },
  { name: 'PH Chemicals',                   logo: '/assets/images/sponsors/ph-chemicals.jpg' },
  { name: 'Lotería Electrónica',            logo: '/assets/images/sponsors/loteria.jpg' },
  { name: 'National Lumber',                logo: '/assets/images/sponsors/national.jpg' },
  { name: 'Taco Maker',                     logo: '/assets/images/sponsors/taco-maker.jpg' },
  { name: "Marco's Pizza",                  logo: '/assets/images/sponsors/marcos-pizza.jpg' },
  { name: 'Windmar',                        logo: '/assets/images/sponsors/windmar.jpg' },
  { name: "Doctors' Center Hospital",       logo: '/assets/images/sponsors/doctors-center.jpg' },
  { name: 'Cooperativa Seguros Múltiples',  logo: '/assets/images/sponsors/seguros-multiples.jpg' },
  { name: 'Palo Ready',                     logo: '/assets/images/sponsors/palo-ready.jpg' },
  { name: 'Ron Don Q',                      logo: '/assets/images/sponsors/don-q.jpg' },
  { name: 'Toyota',                         logo: '/assets/images/sponsors/toyota.jpg' },
];

const CON_EL_AUSPICIO_DE: Sponsor[] = [
  { name: 'Borden',                  logo: '/assets/images/sponsors/borden.jpg' },
  { name: 'Camuy Cooperativa',       logo: '/assets/images/sponsors/camuy.jpg' },
  { name: 'Supermercados Econo',     logo: '/assets/images/sponsors/econo.jpg' },
  { name: 'Primera Hora',            logo: '/assets/images/sponsors/primera-hora.jpg' },
  { name: 'El Nuevo Día',            logo: '/assets/images/sponsors/el-nuevo-dia.jpg' },
  { name: 'Deportes Salvador Colom', logo: '/assets/images/sponsors/deportes-salvador-colom.jpg' },
  { name: 'Molten',                  logo: '/assets/images/sponsors/molten.jpg' },
  { name: 'San Patricio Medflix',    logo: '/assets/images/sponsors/san-patricio-medflix.jpg' },
  { name: 'Sixt Car Rental',         logo: '/assets/images/sponsors/sixt.jpg' },
  { name: 'U-Save',                  logo: '/assets/images/sponsors/u-save.jpg' },
  { name: 'ABC Security',            logo: '/assets/images/sponsors/abc-security.jpg' },
  { name: 'Distrito T-Mobile',       logo: '/assets/images/sponsors/distrito-t-mobile.jpg' },
  { name: 'Toro Verde Parks',        logo: '/assets/images/sponsors/toro-verde.jpg' },
  { name: "Chili's",                 logo: '/assets/images/sponsors/chilis.jpg' },
  { name: 'Osnet',                   logo: '/assets/images/sponsors/osnet.jpg' },
];

const desktopSliderSettings = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 2000,
  slidesToShow: 6,
  slidesToScroll: 1,
  swipeToSlide: true,
};

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="h-[100px] lg:h-[115px] bg-white rounded-[10px] border border-[#E8E8E8] flex items-center justify-center p-4">
      <img
        src={sponsor.logo}
        alt={sponsor.name}
        className="max-h-[72px] lg:max-h-[87px] max-w-full object-contain"
      />
    </div>
  );
}

// Pure CSS scroll — no slick, no hidden margins
function MobileScroller({ sponsors }: { sponsors: Sponsor[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth / 3.2, behavior: 'smooth' });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-2 overflow-x-auto -mr-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {sponsors.map((sponsor) => (
        <div key={sponsor.name} className="shrink-0 w-[30vw]">
          <SponsorCard sponsor={sponsor} />
        </div>
      ))}
    </div>
  );
}

function SponsorGroup({ title, sponsors }: { title: string; sponsors: Sponsor[] }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-4 lg:mb-5">
        <span className="font-barlow font-semibold text-[11px] tracking-[0.12em] uppercase text-[rgba(0,0,0,0.65)] whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-[rgba(0,0,0,0.12)]" />
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-2">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.name} sponsor={sponsor} />
        ))}
      </div>

      {/* Mobile: pure CSS horizontal scroll */}
      <div className="lg:hidden">
        <MobileScroller sponsors={sponsors} />
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  return (
    <section className="bg-[#F2F2F2] py-8 lg:py-[60px]">
      <div className="container">
        <SponsorGroup title="Presentado por" sponsors={PRESENTADO_POR} />
        <div className="mt-8 lg:mt-[60px]">
          <SponsorGroup title="Con el auspicio de" sponsors={CON_EL_AUSPICIO_DE} />
        </div>
      </div>
    </section>
  );
}
