import { appendFile } from 'fs';

'use client';

import { useState, useEffect } from 'react';


// TODO: Replace with actual image paths from assets
const slides = [
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.30.13_b690b8c0.jpg', alt: 'لقطة من الفعالية' },
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.30.13_fafd7428.jpg', alt: 'طلاب أمام الشاشة' },
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.30.14_0fd16389.jpg', alt: 'نشاط تفاعلي' },
];

const cards = [
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.28.17_f885b8c0.jpg', alt: 'من نحن' },
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.28.18_7c9dceb4.jpg', alt: 'رؤيتنا' },
  { src: '/assets/photos/صورة واتساب بتاريخ 1447-05-08 في 07.28.18_c81a12d2.jpg', alt: 'رسالتنا' },
];

const characters = [
  { src: '/assets/photos/man figure.png', alt: 'شخصية توعوية', className: 'gp-char gp-char-man' },
  { src: '/assets/photos/women figure.png', alt: 'شخصية توعوية', className: 'gp-char gp-char-woman' },
];


const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gp-hero">
      {slides.map((slide, index) => (
        <img
          key={index}
          className={`gp-slide ${index === activeIndex ? 'is-active' : ''}`}
          src={slide.src}
          alt={slide.alt}
        />
      ))}
      <div className="gp-hero-text">
        <h2>النبض الأخضر</h2>
        <p>نلهم طلبتنا نحو ممارسات يومية صديقة للبيئة</p>
      </div>
    </div>
  );
};

export default function Showcase() {
  return (
    <aside className="gp-showcase" aria-label="عرض النبض الأخضر">
      <HeroSlider />
      <div className="gp-cards">
        {cards.map((card, index) => (
          <img key={index} src={card.src} alt={card.alt} />
        ))}
      </div>
      <div className="gp-characters">
        {characters.map((char, index) => (
          <img key={index} className={char.className} src={char.src} alt={char.alt} />
        ))}
      </div>
    </aside>
  );
}
