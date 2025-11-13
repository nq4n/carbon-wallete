import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import greenPulseLogo from '../../assets/logo.png';
import { ChapterSection, CHAPTERS } from './Chapters';
import { ActivitiesSection, VideosSection, activities } from './Media';
import { LoginSection } from './Login';

const LOGO = greenPulseLogo;

const AnimatedPath = ({ pathRef, d, progress, pathLength }: {
  pathRef: React.RefObject<SVGPathElement>;
  d: string;
  progress: number;
  pathLength: number;
}) => {
  const dashOffset = (1 - Math.min(progress * 1.05, 1)) * (pathLength || 1);

  return (
    <svg viewBox="0 0 100 220" preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{ shapeRendering: 'geometricPrecision' }}>
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="1" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10b981" floodOpacity="1" />
        </filter>
      </defs>

      <path
        d={d}
        stroke="rgba(16,185,129,.10)"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathGlow)"
      />

      <path
        ref={pathRef}
        d={d}
        stroke="url(#pathGradient)"
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: dashOffset,
          transition: 'stroke-dashoffset 100ms ease-out',
        }}
      />
    </svg>
  );
};

export default function PreAuthShowcaseCentered() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(1);
  const ticking = useRef(false);

  const pathD = useMemo(
    () => ['M 50 8', 'C 65 25, 70 45, 50 65', 'C 30 85, 28 105, 50 125', 'C 72 145, 75 165, 50 185', 'C 25 205, 50 218, 50 215'].join(' '),
    []
  );

  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const len = pathRef.current.getTotalLength();
      if (Number.isFinite(len) && len > 0) setPathLength(len);
    } catch { }
  }, []);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      if (!containerRef.current) { ticking.current = false; return; }
      const sections = containerRef.current.querySelectorAll('section');
      let maxP = 0, activeIdx = 0;
      const vh = window.innerHeight;
      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (vh / 2 - rect.top) / (vh / 2)));
        if (p > maxP) { maxP = p; activeIdx = idx; }
      });
      setCurrentStage(activeIdx);

      const se = document.scrollingElement || document.documentElement;
      const maxScroll = se.scrollHeight - se.clientHeight;
      const y = window.scrollY || se.scrollTop || 0;
      setScrollProgress(maxScroll > 0 ? y / maxScroll : 0);

      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      style={{
        direction: 'rtl',
        color: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background: '#fafafa',
        minHeight: '100vh',
        scrollSnapType: 'y proximity',
      }}
    >
      <div style={{
        position: 'fixed', inset: 0,
        background:
          'radial-gradient(1400px 700px at 50% 0%, rgba(16,185,129,.04), transparent 70%), ' +
          'radial-gradient(1400px 700px at 50% 100%, rgba(5,150,105,.04), transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16,185,129,.15)', borderRadius: 999, padding: '10px 20px',
          boxShadow: '0 12px 32px rgba(2,6,23,.08), 0 0 0 1px rgba(16,185,129,.05)',
        }}>
          <img src={LOGO} alt="Logo" style={{ width: 90, height: 90, objectFit: 'contain' }} />
          <strong style={{ fontSize: 25, letterSpacing: '0.3px' }}>النبض الأخضر</strong>
        </div>
        <AnimatedPath pathRef={pathRef} d={pathD} progress={scrollProgress} pathLength={pathLength} />
      </div>

      <div ref={containerRef} style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 32px 120px' }}>
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', scrollSnapAlign: 'center', padding: '20px 0' }}>
          <div style={{ maxWidth: 720 }}>
            <h1 style={{ fontSize: 64, fontWeight: 900, marginBottom: 20, lineHeight: 1.1, color: '#0f172a' }}>رحلة الوعي الكربوني</h1>
            <p style={{ color: '#475569', fontSize: 20, lineHeight: 1.7, marginBottom: 32, fontWeight: 500 }}>
              انضم إلينا في رحلة ملهمة نحو مستقبل أكثر استدامة. اكتشف كيف نصنع الفرق معاً.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 16, fontWeight: 700, animation: 'bounce 2s infinite' }}>
              <span>ابدأ الرحلة</span><span style={{ fontSize: 24 }}>↓</span>
            </div>
          </div>
        </section>

        {CHAPTERS.map((chapter, idx) => (
          <ChapterSection
            key={idx}
            chapter={chapter}
            isActive={currentStage === idx + 1}
            isImageRight={idx % 2 === 0}
          />
        ))}

        <ActivitiesSection images={activities} />

        <VideosSection />

        <LoginSection currentStage={currentStage} totalStages={CHAPTERS.length + 3} />
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media (max-width: 900px) {
          .chapter-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          section { padding: 36px 0 !important; }
        }
      `}</style>
    </div>
  );
}
