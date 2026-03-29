'use client';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import { useRef, useEffect, forwardRef } from 'react';

type Props<T> = {
  data: T[];
  render: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  initialSlide?: number;
  onEdge?: (direction: 'left' | 'right') => void;
  onSlideChange?: (index: number, total: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecentCalendarSliderInner<T>({
  data,
  render,
  keyExtractor,
  initialSlide = 0,
  onEdge,
  onSlideChange,
}: Props<T>, _ref: any) {
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    if (data.length > 0) {
      sliderRef.current?.slickGoTo(initialSlide, true);
    }
  }, [initialSlide, data.length]);

  // Menos columnas visibles que slidesToScroll evita un hueco vacío al final del carrusel
  // (fecha + partidos) cuando slick reserva sitio para 3 slides y solo quedan 2.
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    initialSlide,
    variableWidth: true,
    adaptiveHeight: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          variableWidth: true,
          swipeToSlide: true,
        },
      },
    ],
    className: 'recent-calendar-slider',
    onEdge,
    afterChange: (current: number) => {
      onSlideChange?.(current, data.length);
    },
  };

  return (
    <Slider ref={sliderRef} {...settings}>
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {render(item, index)}
        </div>
      ))}
    </Slider>
  );
}

const RecentCalendarSlider = forwardRef(RecentCalendarSliderInner) as <T>(
  props: Props<T> & { ref?: React.Ref<unknown> }
) => React.ReactElement;

export default RecentCalendarSlider;
