'use client';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

type Props<T> = {
  data: T[];
  render: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  initialSlide?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecentCalendarSliderInner<T>({ data, render, keyExtractor, initialSlide = 0 }: Props<T>, _ref: any) {
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    if (initialSlide > 0) {
      sliderRef.current?.slickGoTo(initialSlide, true);
    }
  }, [initialSlide]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 2,
    variableWidth: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          variableWidth: true,
        },
      },
    ],
    className: 'recent-calendar-slider',
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
