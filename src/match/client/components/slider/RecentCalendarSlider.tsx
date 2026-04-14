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
    if (data.length === 0) return;

    // On mobile, CSS takes over scrolling (overflow-x: auto) so slickGoTo
    // won't work. Scroll the .slick-list container to the correct slide.
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 639px)').matches;

    if (isMobile) {
      const list = document.querySelector(
        '.recent-calendar-slider .slick-list',
      ) as HTMLElement | null;
      const slides = list?.querySelectorAll('.slick-slide');
      if (list && slides && slides[initialSlide]) {
        list.scrollLeft = (slides[initialSlide] as HTMLElement).offsetLeft;
      }
    } else {
      sliderRef.current?.slickGoTo(initialSlide, true);
    }
  }, [initialSlide, data.length]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 2,
    initialSlide,
    variableWidth: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          variableWidth: true,
          swipe: false,
          touchMove: false,
          draggable: false,
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
