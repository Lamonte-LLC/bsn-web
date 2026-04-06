'use client';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Props<T> = {
  data: T[];
  render: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
};

export default function DefaultSlider<T>({ data, render, keyExtractor }: Props<T>) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3
  };
  return (
    <Slider {...settings}>
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {render(item, index)}
        </div>
      ))}
    </Slider>
  );
}
