import React from 'react';

// sections media
import whoImg from '../../assets/photos/who_are_we.jpg';
import visionImg from '../../assets/photos/our_vission.jpg';
import messageImg from '../../assets/photos/our_massage.jpg';

export const CHAPTERS = [
  { title: 'من نحن',  src: whoImg,    subtitle: 'نحن فريق النبض الأخضر، فريق طلابي تطوعي بجامعة السلطان قابوس، يسعى إلى نشر الوعي البيئي وتقليل البصمة الكربونية داخل الجامعة.' },
  { title: 'رؤيتنا',  src: visionImg, subtitle: 'نحن فريق النبض الأخضر، فريق طلابي تطوعي بجامعة السلطان قابوس، يسعى إلى نشر الوعي البيئي وتقليل البصمة الكربونية داخل الجامعة. نؤمن أن التغيير يبدأ بخطوات صغيرة يومية، وأن الطالب قادر أن يكون صانع فرق في حماية البيئة وصون مواردها.'},
  { title: 'رسالتنا', src: messageImg,subtitle: 'الإسهام في تقليل البصمة الكربونية في الجامعة من خلال نشر الوعي البيئي، وتنفيذ مبادرات عملية، وتحفيز الطلبة على تبني ممارسات يومية صديقة للبيئة.' },
];

const ChapterText = ({ title, subtitle }:{title:string;subtitle:string}) => (
    <div style={{ maxWidth:540 }}>
      <div
        style={{
          display:'inline-block',
          background:'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)',
          color:'#047857',
          padding:'6px 16px',
          borderRadius:999,
          fontSize:13,
          fontWeight:700,
          marginBottom:16,
          border:'1px solid #a7f3d0',
          letterSpacing:'0.5px',
        }}
      >
        مرحلة جديدة
      </div>
      <h3 style={{ fontSize:42, fontWeight:900, marginBottom:12, lineHeight:1.2, color:'#1e293b' }}>{title}</h3>
      <p style={{ color:'#334155', lineHeight:1.8, fontSize:18, fontWeight:600, marginBottom:8 }}>{subtitle}</p>
      <p style={{ color:'#475569', lineHeight:1.75, fontSize:16, fontWeight:500 }}>
      </p>
    </div>
  )

export const ChapterSection = ({ chapter, isActive, isImageRight }: {
    chapter: { title: string; subtitle: string; src: string };
    isActive: boolean;
    isImageRight: boolean;
}) => {
    const scale = isActive ? 1 : 0.97;
    const opacity = isActive ? 1 : 1;

    return (
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '48px 0', scrollSnapAlign: 'center' }}>
            <div
                className="chapter-grid"
                style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: isImageRight ? 'minmax(0,1fr) 560px' : '560px minmax(0,1fr)',
                    gap: 40,
                    alignItems: 'center',
                    opacity,
                    transform: `scale(${scale}) translateY(${isActive ? 0 : 24}px)`,
                    transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform, opacity',
                }}
            >
                {!isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}

                <div
                    style={{
                        background: 'linear-gradient(135deg,#fff 0%,#f9fafb 100%)',
                        border: '1px solid rgba(2,6,23,.06)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: isActive ? '0 32px 80px rgba(2,6,23,.18), 0 0 0 1px rgba(16,185,129,.1)' : '0 16px 40px rgba(2,6,23,.1)',
                        transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `scale(${isActive ? 1 : 0.96})`,
                    }}
                >
                    <div style={{ position: 'relative', paddingTop: '75%' }}>
                        <img src={chapter.src} alt={chapter.title} loading="lazy"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.2) 0%, transparent 100%)' }} />
                    </div>
                </div>

                {isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}
            </div>
        </section>
    );
};
