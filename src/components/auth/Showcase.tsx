'use client';

import { useState, useEffect } from 'react';

// Import images directly for Vite to handle bundling
import slide1 from '../../assets/photos/activty_1.jpg';
import slide2 from '../../assets/photos/activty_2.jpg';
import slide3 from '../../assets/photos/activty_3.jpg';

import trio1 from '../../assets/photos/who_are_we.jpg';
import trio2 from '../../assets/photos/our_vission.jpg';
import trio3 from '../../assets/photos/our_massage.jpg';

import charMan from '../../assets/photos/man_figure.png';
import charWoman from '../../assets/photos/women_figure.png';

import gallery1 from '../../assets/photos/activty_4.jpg';
import gallery2 from '../../assets/photos/activty_5.jpg';
import gallery3 from '../../assets/photos/activty_6.jpg';
import gallery4 from '../../assets/photos/activty_7.jpg';
import gallery5 from '../../assets/photos/activty_8.jpg';

const slides = [
  { src: slide1, alt: 'لقطة من الفعالية' },
  { src: slide2, alt: 'طلاب أمام الشاشة' },
  { src: slide3, alt: 'نشاط تفاعلي' },
];

const trio = [
  { src: trio1, alt: 'من نحن' },
  { src: trio2, alt: 'رؤيتنا' },
  { src: trio3, alt: 'رسالتنا' },
];

const characters = [
  { src: charMan, alt: 'شخصية توعوية', className: 'man' },
  { src: charWoman, alt: 'شخصية توعوية', className: 'woman' },
];

const gallery = [
    { src: gallery1, alt: 'نشاط تفاعلي' },
    { src: gallery2, alt: 'نشاط تفاعلي' },
    { src: gallery3, alt: 'نشاط تفاعلي' },
    { src: gallery4, alt: 'نشاط تفاعلي' },
    { src: gallery5, alt: 'نشاط تفاعلي' },
];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero">
        {slides.map((slide, index) => (
            <img
            key={index}
            className={index === activeIndex ? 'active' : ''}
            src={slide.src}
            alt={slide.alt}
            />
        ))}
        <div className="hero-text">
            <h2>النبض الأخضر</h2>
            <p>نشر الوعي البيئي في المجتمع الطلابي</p>
        </div>
    </div>
  );
};

export default function Showcase() {
  return (
    <div className="showcase">
      <Hero />
      <div className="trio">
        {trio.map((card, index) => (
          <img key={index} src={card.src} alt={card.alt} />
        ))}
      </div>
      <div className="characters">
        {characters.map((char, index) => (
          <img key={index} className={char.className} src={char.src} alt={char.alt} />
        ))}
      </div>
      <div className="gallery">
        {gallery.map((item, index) => (
            <img key={index} src={item.src} alt={item.alt} />
        ))}
      </div>
    </div>
  );
}
