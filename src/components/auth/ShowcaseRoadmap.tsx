'use client';

import { useMemo } from 'react';
import '../styles/showcase-roadmap.css';

/* صور */
import logo from '@/assets/logo.png';
import who from '@/assets/photos/who_are_we.jpg';
import vission from '@/assets/photos/our_vission.jpg';
import massage from '@/assets/photos/our_massage.jpg';
import a1 from '@/assets/photos/activities/activity_1.jpg';
import a2 from '@/assets/photos/activities/activity_2.jpg';
import a3 from '@/assets/photos/activities/activity_3.jpg';
import a4 from '@/assets/photos/activities/activity_4.jpg';
import a5 from '@/assets/photos/activities/activity_5.jpg';

type Props = {
  onLogin: () => void;
  onSignup: () => void;
};

/** Showcase بشكل خريطة: خط متعرّج + نقاط + معرض + CTA */
export default function ShowcaseRoadmap({ onLogin, onSignup }: Props){
  // مسار SVG: نقاط Bezier لتعرّج ناعم (نسبة مئوية كنقاط داخل viewBox 100x100)
  const d = useMemo(()=>[
    'M 12 8',
    'C 26 16, 18 30, 30 36',
    'S 52 52, 44 62',
    'S 58 74, 70 68',
    'S 86 58, 88 78'
  ].join(' '), []);

  return (
    <div className="roadmap-wrap">
      {/* الشعار كبادج بداية المسار */}
      <div className="logo-badge">
        <img src={logo} alt="logo" />
        <span>النبض الأخضر</span>
      </div>

      {/* لوحة SVG بكامل الحاوية */}
      <svg className="roadmap-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="roadmap-path" d={d} />
      </svg>

      {/* نقاط المسار (من نحن / رؤيتنا / رسالتنا) بمواقع تقريبية على المسار */}
      <div className="node" style={{ left:'28%', top:'34%' }}>
        <img src={who} alt="من نحن" />
        <div className="k">من نحن</div>
      </div>

      <div className="node" style={{ left:'46%', top:'58%' }}>
        <img src={vission} alt="رؤيتنا" />
        <div className="k">رؤيتنا</div>
      </div>

      <div className="node" style={{ left:'66%', top:'70%' }}>
        <img src={massage} alt="رسالتنا" />
        <div className="k">رسالتنا</div>
      </div>

      {/* معرض النشاطات قرب نهاية المسار */}
      <div className="gallery">
        <img src={a1} alt="نشاط" />
        <img src={a2} alt="نشاط" />
        <img src={a3} alt="نشاط" />
        <img src={a4} alt="نشاط" />
        <img src={a5} alt="نشاط" />
      </div>

      {/* نهايات المسار: CTA */}
      <div className="cta">
        <button className="primary" onClick={onLogin}>ادخل</button>
        <button className="outline" onClick={onSignup}>انضمّ إلينا</button>
      </div>
    </div>
  );
}
