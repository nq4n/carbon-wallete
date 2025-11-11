import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'

import greenPulseLogo from '../../assets/logo.png'

// sections media
import whoImg       from '../../assets/photos/who_are_we.jpg'
import visionImg    from '../../assets/photos/our_vission.jpg'
import messageImg   from '../../assets/photos/our_massage.jpg'
import video1 from "../../assets/videos/video1.mp4";
import video2 from "../../assets/videos/video2.mp4";
import video3 from "../../assets/videos/video3.mp4";
// activities (1..8)
import activity1Img from '../../assets/photos/activity_1.jpg'
import activity2Img from '../../assets/photos/activity_2.jpg'
import activity3Img from '../../assets/photos/activity_3.jpg'
import activity4Img from '../../assets/photos/activity_4.jpg'
import activity5Img from '../../assets/photos/activity_5.jpg'
import activity6Img from '../../assets/photos/activity_6.jpg'
import activity7Img from '../../assets/photos/activity_7.jpg'
import activity8Img from '../../assets/photos/activity_8.jpg'

// figures beside login card (your filenames)
import manFigure   from '../../assets/photos/man_figure.png'
import womanFigure from '../../assets/photos/women_figure.png'

import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, Loader2, AlertCircle } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { toast } from 'sonner'

/* ---------- Configuration ---------- */
const LOGO = greenPulseLogo

// Only the three core chapters (no activity chapters)
const CHAPTERS = [
  { title: 'من نحن',  src: whoImg,    subtitle: 'نحن فريق النبض الأخضر، فريق طلابي تطوعي بجامعة السلطان قابوس، يسعى إلى نشر الوعي البيئي وتقليل البصمة الكربونية داخل الجامعة.' },
  { title: 'رؤيتنا',  src: visionImg, subtitle: 'نحن فريق النبض الأخضر، فريق طلابي تطوعي بجامعة السلطان قابوس، يسعى إلى نشر الوعي البيئي وتقليل البصمة الكربونية داخل الجامعة. نؤمن أن التغيير يبدأ بخطوات صغيرة يومية، وأن الطالب قادر أن يكون صانع فرق في حماية البيئة وصون مواردها.'},
  { title: 'رسالتنا', src: messageImg,subtitle: 'الإسهام في تقليل البصمة الكربونية في الجامعة من خلال نشر الوعي البيئي، وتنفيذ مبادرات عملية، وتحفيز الطلبة على تبني ممارسات يومية صديقة للبيئة.' },
]

/* ---------- Shared subcomponents ---------- */
const AnimatedPath = ({ pathRef, d, progress, pathLength }:{
  pathRef: React.RefObject<SVGPathElement>,
  d: string,
  progress: number,
  pathLength: number
}) => {
  const dashOffset = (1 - Math.min(progress * 1.05, 1)) * (pathLength || 1)

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

      {/* soft shadow path */}
      <path
        d={d}
        stroke="rgba(16,185,129,.10)"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathGlow)"
      />

      {/* animated path */}
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
  )
}

/* ---------- Activities (swipeable cards) ---------- */
/* ---------- Activities (swipeable image cards, no captions) ---------- */
const ActivitiesSection = ({ images }:{ images:{src:string;alt:string}[] }) => {
  return (
    <section
      style={{
        minHeight: '64vh',
        scrollSnapAlign: 'center',
        padding: '40px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ textAlign:'center' }}>
        <div
          style={{
            display:'inline-block',
            background:'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)',
            color:'#047857',
            padding:'6px 16px',
            borderRadius:999,
            fontSize:13,
            fontWeight:800,
            border:'1px solid #a7f3d0',
            letterSpacing:'.4px',
          }}
        >
          الفعاليات
        </div>
      </div>

      <div
        className="acts-row"
        style={{
          display:'grid',
          gridAutoFlow:'column',
          gridAutoColumns:'78%',
          gap:16,
          overflowX:'auto',
          scrollSnapType:'x mandatory',
          padding:'12px 10px',
          scrollbarWidth:'none' as any,
          msOverflowStyle:'none',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%)',
        }}
      >
        <style>{`
          .acts-row::-webkit-scrollbar{ display:none; }
          .act-card:hover { transform: translateY(-6px); }
        `}</style>

        {images.map((img, i) => (
          <div
            key={i}
            className="act-card"
            style={{
              scrollSnapAlign:'center',
              background:'#fff',
              border:'1px solid rgba(2,6,23,.06)',
              borderRadius:22,
              overflow:'hidden',
              boxShadow:'0 22px 60px rgba(2,6,23,.12)',
              position:'relative',
              minHeight: 260,
              transition:'transform .25s ease',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              style={{
                width:'100%',
                height:'100%',
                display:'block',
                objectFit:'cover',
                aspectRatio: '16 / 10',
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .acts-row { grid-auto-columns: 32%; }
        }
      `}</style>
    </section>
  )
}

const FIXED_RATIO = false;

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
const CARD_ASPECT = "16 / 9";// "16 / 9" for landscape, "9 / 16" vertical
const VideosSection = () => {
  return (
    <section
      style={{
        minHeight: "60vh",
        scrollSnapAlign: "center",
        padding: "40px 0",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#ecfeff 0%,#cffafe 100%)",
              color: "#0369a1",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              border: "1px solid #bae6fd",
              letterSpacing: ".4px",
            }}
          >
            فيديوهات
          </div>
          <h3
            style={{
              fontSize: 36,
              fontWeight: 900,
              marginTop: 12,
              color: "#0f172a",
            }}
          >
            مشاهد قصيرة توضح رسالتنا
          </h3>
        </div>

        {/* ✅ Fixed grid (no nested grid anymore) */}
        <div
          className="videos-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
          }}
        >
          {[video1, video2, video3].map((src, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid rgba(2,6,23,.06)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(2,6,23,.12)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9", // ✅ all equal size
                  background: "#0b1220",
                }}
              >
                <video
  src={src}
  playsInline
  muted
  controls={false}
  preload="metadata"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  }}
  onClick={(e) => {
    const v = e.currentTarget;
    document.querySelectorAll("video").forEach((x) => x !== v && x.pause());
    v.paused ? v.play() : v.pause();
  }}
  onDoubleClick={(e) => {
    const v = e.currentTarget as HTMLVideoElement;
    if (!document.fullscreenElement) {
      v.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }}
/>

              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 900px) {
            .videos-grid { 
              grid-template-columns: 1fr; 
              gap: 14px; 
            }
          }
        `}</style>
      </div>
    </section>
  );
};

{/* ---------- Videos (three responsive players) ---------- */}
<section
  style={{
    minHeight: '0',
    scrollSnapAlign: 'auto',
    padding: '16px 0 8px',
    display: 'block',
  }}
>
  <div style={{ width: '100%' }}>
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <div
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg,#ecfeff 0%,#cffafe 100%)',
          color: '#0369a1',
          padding: '6px 16px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          border: '1px solid #bae6fd',
          letterSpacing: '.4px',
        }}
      >
        فيديوهات
      </div>
      <h3
        style={{
          fontSize: 24,
          fontWeight: 900,
          marginTop: 10,
          color: '#0f172a',
        }}
      >
        مشاهد قصيرة توضح رسالتنا
      </h3>
    </div>

    {/* same grid idea, just cleaned & extended to 3 cards */}
    <div
      className="videos-grid"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}
    >
      {/* Card 1 */}
      <div
        className="video-card"
        style={{
          background: '#fff',
          border: '1px solid rgba(2,6,23,.06)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(2,6,23,.12)',
        }}
      >
        <div className="video-frame">
          <video
            src={video1}
            playsInline
            muted
            preload="metadata"
            // no native controls
            controls={false}
            onClick={(e) => {
              const v = e.currentTarget as HTMLVideoElement;
              // pause others
              document
                .querySelectorAll<HTMLVideoElement>('.videos-grid video')
                .forEach((x) => x !== v && x.pause());
              v.paused ? v.play() : v.pause();
            }}
          />
        </div>
      </div>

      {/* Card 2 */}
      <div
        className="video-card"
        style={{
          background: '#fff',
          border: '1px solid rgba(2,6,23,.06)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(2,6,23,.12)',
        }}
      >
        <div className="video-frame">
          <video
            src={video2}
            playsInline
            muted
            preload="metadata"
            controls={false}
            onClick={(e) => {
              const v = e.currentTarget as HTMLVideoElement;
              document
                .querySelectorAll<HTMLVideoElement>('.videos-grid video')
                .forEach((x) => x !== v && x.pause());
              v.paused ? v.play() : v.pause();
            }}
          />
        </div>
      </div>

      {/* Card 3 */}
      <div
        className="video-card"
        style={{
          background: '#fff',
          border: '1px solid rgba(2,6,23,.06)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(2,6,23,.12)',
        }}
      >
        <div className="video-frame">
          <video
            src={video3}
            playsInline
            muted
            preload="metadata"
            controls={false}
            onClick={(e) => {
              const v = e.currentTarget as HTMLVideoElement;
              document
                .querySelectorAll<HTMLVideoElement>('.videos-grid video')
                .forEach((x) => x !== v && x.pause());
              v.paused ? v.play() : v.pause();
            }}
          />
        </div>
      </div>
    </div>

    {/* keep your inline CSS block, just adding what we need */}
    <style>{`
      .video-frame{
        aspect-ratio: 16 / 9;        /* 🔒 fixed shape for all */
        width: 100%;
        background:#0b1220;
      }
      .video-frame video{
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;           /* fits vertical & horizontal nicely */
        border-radius: 0;            /* card already has radius */
      }
      @media (max-width: 900px) {
        .videos-grid { grid-template-columns: 1fr; gap: 12px; }
      }
    `}</style>
  </div>
</section>

/* ---------- Chapter Section ---------- */
const ChapterSection = ({ chapter, isActive, isImageRight }:{
  chapter:{title:string; subtitle:string; src:string}
  isActive:boolean
  isImageRight:boolean
}) => {
  const scale = isActive ? 1 : 0.97
  const opacity = isActive ? 1 : 1

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'48px 0', scrollSnapAlign:'center' }}>
      <div
        className="chapter-grid"
        style={{
          width:'100%',
          display:'grid',
          gridTemplateColumns: isImageRight ? 'minmax(0,1fr) 560px' : '560px minmax(0,1fr)',
          gap: 40,
          alignItems:'center',
          opacity,
          transform:`scale(${scale}) translateY(${isActive ? 0 : 24}px)`,
          transition:'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange:'transform, opacity',
        }}
      >
        {!isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}

        <div
          style={{
            background:'linear-gradient(135deg,#fff 0%,#f9fafb 100%)',
            border:'1px solid rgba(2,6,23,.06)',
            borderRadius:24,
            overflow:'hidden',
            boxShadow: isActive ? '0 32px 80px rgba(2,6,23,.18), 0 0 0 1px rgba(16,185,129,.1)' : '0 16px 40px rgba(2,6,23,.1)',
            transition:'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform:`scale(${isActive ? 1 : 0.96})`,
          }}
        >
          <div style={{ position:'relative', paddingTop:'75%' }}>
            <img src={chapter.src} alt={chapter.title} loading="lazy"
                 style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.2) 0%, transparent 100%)' }}/>
          </div>
        </div>

        {isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}
      </div>
    </section>
  )
}

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

/* ---------- Login Section (with figures at side) ---------- */
const LoginSection = ({ currentStage, totalStages }:{ currentStage:number; totalStages:number }) => {
  const { signIn, signUp } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'login'|'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [loginData, setLoginData] = useState({ email:'', password:'' })

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: 'male' as 'male'|'female',
    user_type: 'student',
    university_id: '',
    department: '',
  })

  const departments = {
    student: [
      'كلية الهندسة','كلية العلوم','كلية الطب والعلوم الصحية','كلية العلوم الزراعية والبحرية',
      'كلية الاقتصاد والعلوم السياسية','كلية الآداب والعلوم الاجتماعية','كلية التربية','كلية الحقوق','كلية التمريض',
    ],
    employee: [
      'كلية الهندسة','كلية العلوم','كلية الطب والعلوم الصحية','كلية العلوم الزراعية والبحرية','كلية الاقتصاد والعلوم السياسية',
      'كلية الآداب والعلوم الاجتماعية','كلية التربية','كلية الحقوق','كلية التمريض','الشؤون الأكاديمية','الموارد البشرية',
      'الشؤون المالية','شؤون الطلاب','المكتبة','الصيانة والخدمات','الأمن والسلامة','البحث العلمي','العلاقات العامة',
    ],
  }

  const isActive = currentStage === totalStages
  const isLogin = activeTab === 'login'
  const maleColored   = isLogin ? true : signUpData.gender === 'male'
  const femaleColored = isLogin ? true : signUpData.gender === 'female'

  const handleLogin = async (e:React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      const email = loginData.email.trim().toLowerCase()
      const password = loginData.password
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'بيانات تسجيل الدخول غير صحيحة' : 'حدث خطأ في تسجيل الدخول')
      } else {
        toast.success('تم تسجيل الدخول بنجاح!')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e:React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const email = signUpData.email.trim().toLowerCase()
    const password = signUpData.password
    const confirm = signUpData.confirmPassword

    if (password !== confirm) {
      setError('كلمات المرور غير متطابقة'); setIsSubmitting(false); return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); setIsSubmitting(false); return
    }
    if (!signUpData.department) {
      setError('يرجى اختيار الكلية أو القسم'); setIsSubmitting(false); return
    }

    try {
      const { data, error } = await signUp(email, password, {
        name: signUpData.name.trim(),
        user_type: signUpData.user_type,
        university_id: signUpData.university_id.trim(),
        department: signUpData.department,
        gender: signUpData.gender,
      })
      if (error) {
        setError((error.message || '').toLowerCase().includes('already') ? 'هذا البريد الإلكتروني مسجل مسبقاً' : 'حدث خطأ في إنشاء الحساب')
      } else if (data?.user) {
        toast.success('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...')
        const { error: signInError } = await signIn(email, password)
        if (signInError) setError('حدث خطأ أثناء تسجيل الدخول التلقائي')
      }
    } catch (err) {
      console.error('SignUp error:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      style={{
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        scrollSnapAlign:'center',
        padding:'48px 16px',
      }}
    >
      <div
  className="login-grid"
  style={{
    width: "100%",
    maxWidth: 1160,
    display: "grid",
    gridTemplateColumns: "160px minmax(0, 520px) 160px", // left figure | card | right figure
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  }}
>
  {/* LEFT FIGURE (FEMALE) */}
  <button
    type="button"
    onClick={() =>
      activeTab === "signup" &&
      setSignUpData((p) => ({ ...p, gender: "female" }))
    }
    aria-label="أنثى"
    style={{
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: activeTab === "signup" ? "pointer" : "default",
      justifySelf: "end",
    }}
  >
    <img
      src={womanFigure}
      alt="شكل امرأة"
      style={{
        width: "110%",          // Slightly larger width than the card height proportion
        height: "auto",
        maxWidth: 260,          // Prevent becoming too large on big screens
        objectFit: "contain",
        display: "block",
        transform: "translateY(8px)", // Brings them visually aligned with card
        filter:
          activeTab === "login" || signUpData.gender === "female"
            ? "none"
            : "grayscale(1) brightness(0.65)",
      }}
    />
  </button>


        {/* card */}
        <div
          style={{
            width:'100%',
            maxWidth:520,
            background:'#fff',
            borderRadius:32,
            padding:28,
            boxShadow:'0 24px 64px rgba(2,6,23,.14), 0 0 0 1px rgba(16,185,129,.08)',
            border:'1px solid rgba(16,185,129,.1)',
            opacity: isActive ? 1 : 1,
            transform:`translateY(${isActive ? 0 : 8}px) scale(${isActive ? 1 : 0.99})`,
            transition:'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* header */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <img src={LOGO} alt="Logo" style={{ width:64, height:64, objectFit:'contain', margin:'0 auto 10px', filter:'drop-shadow(0 4px 8px rgba(16,185,129,.2))' }}/>
            <h2 style={{ fontSize:26, fontWeight:900, marginBottom:4, background:'linear-gradient(135deg,#0f172a 0%, #10b981 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>المحفظة الكربونية</h2>
            <p style={{ color:'#64748b', fontSize:13 }}>جامعة السلطان قابوس</p>
          </div>

          {/* tabs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, background:'#f1f5f9', borderRadius:12, padding:4, marginBottom:12 }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                padding:'10px 16px', borderRadius:8, border:'none',
                background: activeTab==='login' ? '#fff' : 'transparent',
                color: activeTab==='login' ? '#0f172a' : '#64748b',
                fontWeight:700, fontSize:14, cursor:'pointer',
                boxShadow: activeTab==='login' ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
              }}
            >تسجيل الدخول</button>
            <button
              onClick={() => setActiveTab('signup')}
              style={{
                padding:'10px 16px', borderRadius:8, border:'none',
                background: activeTab==='signup' ? '#fff' : 'transparent',
                color: activeTab==='signup' ? '#0f172a' : '#64748b',
                fontWeight:700, fontSize:14, cursor:'pointer',
                boxShadow: activeTab==='signup' ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
              }}
            >إنشاء حساب</button>
          </div>

          {/* alert */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle style={{ width:16, height:16, color:'#dc2626', flexShrink:0 }} />
              <span style={{ color:'#991b1b', fontSize:14 }}>{error}</span>
            </div>
          )}

          {/* login form */}
          {activeTab==='login' && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>البريد الإلكتروني</label>
                <div style={{ position:'relative' }}>
                  <Mail style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type="email" placeholder="example@squ.edu.om" autoComplete="email"
                    value={loginData.email} onChange={(e)=>setLoginData(p=>({...p,email:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>كلمة المرور</label>
                <div style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type={showPassword ? 'text' : 'password'} placeholder="أدخل كلمة المرور" autoComplete="current-password"
                    value={loginData.password} onChange={(e)=>setLoginData(p=>({...p,password:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                  <button type="button" onClick={()=>setShowPassword(s=>!s)}
                          style={{ position:'absolute', left:12, top:12, background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                    {showPassword ? <EyeOff style={{ width:16, height:16 }}/> : <Eye style={{ width:16, height:16 }}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                      style={{ width:'100%', padding:'12px 24px', borderRadius:10, border:'none',
                               background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
                               color:'#fff', fontWeight:700, fontSize:15, cursor: isSubmitting?'not-allowed':'pointer',
                               boxShadow:'0 4px 12px rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {isSubmitting ? (<><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/> جاري تسجيل الدخول...</>) : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* signup form */}
          {activeTab==='signup' && (
            <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* user type */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>نوع المستخدم</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <button type="button" onClick={()=>setSignUpData(p=>({...p,user_type:'student',department:'',university_id:''}))}
                          style={{ padding:'10px 16px', borderRadius:10, border: signUpData.user_type==='student'?'2px solid #10b981':'1px solid #e2e8f0',
                                   background: signUpData.user_type==='student'?'#ecfdf5':'#fff', color: signUpData.user_type==='student'?'#065f46':'#64748b',
                                   fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <GraduationCap style={{ width:16, height:16 }}/> طالب
                  </button>
                  <button type="button" onClick={()=>setSignUpData(p=>({...p,user_type:'employee',department:'',university_id:''}))}
                          style={{ padding:'10px 16px', borderRadius:10, border: signUpData.user_type==='employee'?'2px solid #10b981':'1px solid #e2e8f0',
                                   background: signUpData.user_type==='employee'?'#ecfdf5':'#fff', color: signUpData.user_type==='employee'?'#065f46':'#64748b',
                                   fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <Briefcase style={{ width:16, height:16 }}/> موظف
                  </button>
                </div>
              </div>

              {/* gender selector (explicit) */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>الجنس</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <button type="button" onClick={()=>setSignUpData(p=>({...p,gender:'male'}))}
                          style={{ padding:'10px 16px', borderRadius:10, border: signUpData.gender==='male'?'2px solid #10b981':'1px solid #e2e8f0',
                                   background: signUpData.gender==='male'?'#ecfdf5':'#fff', color: signUpData.gender==='male'?'#065f46':'#64748b',
                                   fontWeight:600, fontSize:14, cursor:'pointer' }}>
                    ذكر
                  </button>
                  <button type="button" onClick={()=>setSignUpData(p=>({...p,gender:'female'}))}
                          style={{ padding:'10px 16px', borderRadius:10, border: signUpData.gender==='female'?'2px solid #10b981':'1px solid #e2e8f0',
                                   background: signUpData.gender==='female'?'#ecfdf5':'#fff', color: signUpData.gender==='female'?'#065f46':'#64748b',
                                   fontWeight:600, fontSize:14, cursor:'pointer' }}>
                    أنثى
                  </button>
                </div>
              </div>

              {/* name */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>الاسم الكامل</label>
                <div style={{ position:'relative' }}>
                  <User style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type="text" placeholder="أدخل اسمك الكامل" value={signUpData.name}
                    onChange={(e)=>setSignUpData(p=>({...p,name:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                </div>
              </div>

              {/* university id */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>
                  {signUpData.user_type==='student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}
                </label>
                <input
                  type="text" placeholder={signUpData.user_type==='student'?'202301234':'E789456'}
                  value={signUpData.university_id} onChange={(e)=>setSignUpData(p=>({...p,university_id:e.target.value}))} required
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                />
              </div>

              {/* department */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>
                  {signUpData.user_type==='student' ? 'الكلية' : 'القسم'}
                </label>
                <select
                  value={signUpData.department}
                  onChange={(e)=>setSignUpData(p=>({...p,department:e.target.value}))} required
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none', background:'#fff' }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                >
                  <option value="">اختر {signUpData.user_type==='student'?'الكلية':'القسم'}</option>
                  {departments[signUpData.user_type].map((dept)=>(
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* email */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>البريد الإلكتروني</label>
                <div style={{ position:'relative' }}>
                  <Mail style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type="email" placeholder="example@squ.edu.om" autoComplete="email"
                    value={signUpData.email} onChange={(e)=>setSignUpData(p=>({...p,email:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>كلمة المرور</label>
                <div style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type={showPassword?'text':'password'} placeholder="كلمة المرور (6 أحرف على الأقل)" autoComplete="new-password"
                    value={signUpData.password} onChange={(e)=>setSignUpData(p=>({...p,password:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                  <button type="button" onClick={()=>setShowPassword(s=>!s)}
                          style={{ position:'absolute', left:12, top:12, background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                    {showPassword ? <EyeOff style={{ width:16, height:16 }}/> : <Eye style={{ width:16, height:16 }}/>}
                  </button>
                </div>
              </div>

              {/* confirm password */}
              <div>
                <label style={{ display:'block', marginBottom:6, fontSize:14, fontWeight:600, color:'#1f2937' }}>تأكيد كلمة المرور</label>
                <div style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', right:12, top:12, width:16, height:16, color:'#94a3b8' }}/>
                  <input
                    type={showConfirmPassword?'text':'password'} placeholder="أعد كتابة كلمة المرور" autoComplete="new-password"
                    value={signUpData.confirmPassword} onChange={(e)=>setSignUpData(p=>({...p,confirmPassword:e.target.value}))} required
                    style={{ width:'100%', padding:'10px 40px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='#10b981'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                  <button type="button" onClick={()=>setShowConfirmPassword(s=>!s)}
                          style={{ position:'absolute', left:12, top:12, background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                    {showConfirmPassword ? <EyeOff style={{ width:16, height:16 }}/> : <Eye style={{ width:16, height:16 }}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                      style={{ width:'100%', padding:'12px 24px', borderRadius:10, border:'none',
                               background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
                               color:'#fff', fontWeight:700, fontSize:15, cursor: isSubmitting?'not-allowed':'pointer',
                               boxShadow:'0 4px 12px rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {isSubmitting ? (<><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/> جاري إنشاء الحساب...</>) : 'إنشاء حساب'}
              </button>

              <div style={{ marginTop:10, padding:12, background:'#eff6ff', borderRadius:12, border:'1px solid #bfdbfe' }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:'#1e40af', marginBottom:6 }}>حساب تجريبي:</h4>
                <p style={{ fontSize:12, color:'#1e3a8a', margin:0 }}>
                  البريد: demo@squ.edu.om<br/>كلمة المرور: demo123
                </p>
              </div>
            </form>
          )}
        </div>
        <button
    type="button"
    onClick={() =>
      activeTab === "signup" &&
      setSignUpData((p) => ({ ...p, gender: "male" }))
    }
    aria-label="ذكر"
    style={{
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: activeTab === "signup" ? "pointer" : "default",
      justifySelf: "start",
    }}
  >
    <img
      src={manFigure}
      alt="شكل رجل"
      style={{
        width: "130%",          // Slightly larger width than the card height proportion
        height: "auto",
        maxWidth: 260,          // Prevent becoming too large on big screens
        objectFit: "contain",
        display: "block",
        transform: "translateY(8px)", // Brings them visually aligned with card
        filter:
          activeTab === "login" || signUpData.gender === "male"
            ? "none"
            : "grayscale(1) brightness(0.65)",
      }}
    />
  </button>
      </div>
          
      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        /* tighter phone spacing */
        @media (max-width: 900px) {
          .login-grid { grid-template-columns: 1fr; gap: 14px; }
          .figures-area { padding: 10px; }
        }
      `}</style>
    </section>
  )
}

/* ---------- Main Component ---------- */
export default function PreAuthShowcaseCentered() {
  const pathRef = useRef<SVGPathElement|null>(null)
  const containerRef = useRef<HTMLDivElement|null>(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pathLength, setPathLength] = useState(1)
  const ticking = useRef(false)

  // center vertical smooth path
  const pathD = useMemo(
    () => ['M 50 8','C 65 25, 70 45, 50 65','C 30 85, 28 105, 50 125','C 72 145, 75 165, 50 185','C 25 205, 50 218, 50 215'].join(' '),
    []
  )

  useEffect(() => {
    if (!pathRef.current) return
    try {
      const len = pathRef.current.getTotalLength()
      if (Number.isFinite(len) && len > 0) setPathLength(len)
    } catch {}
  }, [])

  const handleScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      if (!containerRef.current) { ticking.current = false; return }
      const sections = containerRef.current.querySelectorAll('section')
      let maxP = 0, activeIdx = 0
      const vh = window.innerHeight
      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, (vh/2 - rect.top) / (vh/2)))
        if (p > maxP) { maxP = p; activeIdx = idx }
      })
      setCurrentStage(activeIdx)

      const se = document.scrollingElement || document.documentElement
      const maxScroll = se.scrollHeight - se.clientHeight
      const y = window.scrollY || se.scrollTop || 0
      setScrollProgress(maxScroll > 0 ? y / maxScroll : 0)

      ticking.current = false
    })
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive:true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  const activities = [
    { src: activity1Img, alt: 'Activity 1' },
    { src: activity2Img, alt: 'Activity 2' },
    { src: activity3Img, alt: 'Activity 3' },
    { src: activity4Img, alt: 'Activity 4' },
    { src: activity5Img, alt: 'Activity 5' },
    { src: activity6Img, alt: 'Activity 6' },
    { src: activity7Img, alt: 'Activity 7' },
    { src: activity8Img, alt: 'Activity 8' },
  ]

  return (
    <div
      style={{
        direction:'rtl',
        color:'#0f172a',
        fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background:'#fafafa',
        minHeight:'100vh',
        scrollSnapType:'y proximity',
      }}
    >
      {/* animated bg */}
      <div style={{
        position:'fixed', inset:0,
        background:
          'radial-gradient(1400px 700px at 50% 0%, rgba(16,185,129,.04), transparent 70%), ' +
          'radial-gradient(1400px 700px at 50% 100%, rgba(5,150,105,.04), transparent 70%)',
        zIndex:0, pointerEvents:'none',
      }}/>

      {/* fixed path layer */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }}>
        <div style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)', top:24,
          display:'flex', alignItems:'center', gap:12,
          background:'rgba(255,255,255,.95)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(16,185,129,.15)', borderRadius:999, padding:'10px 20px',
          boxShadow:'0 12px 32px rgba(2,6,23,.08), 0 0 0 1px rgba(16,185,129,.05)',
        }}>
          <img src={LOGO} alt="Logo" style={{ width:90, height:90, objectFit:'contain' }}/>
          <strong style={{ fontSize:25, letterSpacing:'0.3px' }}>النبض الأخضر</strong>
        </div>
        <AnimatedPath pathRef={pathRef} d={pathD} progress={scrollProgress} pathLength={pathLength}/>
      </div>

      {/* content */}
      <div ref={containerRef} style={{ position:'relative', zIndex:2, maxWidth:1200, margin:'0 auto', padding:'0 32px 120px' }}>
        {/* hero */}
        <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', scrollSnapAlign:'center', padding:'20px 0' }}>
          <div style={{ maxWidth:720 }}>
            <h1 style={{ fontSize:64, fontWeight:900, marginBottom:20, lineHeight:1.1, color:'#0f172a' }}>رحلة الوعي الكربوني</h1>
            <p style={{ color:'#475569', fontSize:20, lineHeight:1.7, marginBottom:32, fontWeight:500 }}>
              انضم إلينا في رحلة ملهمة نحو مستقبل أكثر استدامة. اكتشف كيف نصنع الفرق معاً.
            </p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#10b981', fontSize:16, fontWeight:700, animation:'bounce 2s infinite' }}>
              <span>ابدأ الرحلة</span><span style={{ fontSize:24 }}>↓</span>
            </div>
          </div>
        </section>

        {/* chapters */}
        {CHAPTERS.map((chapter, idx) => (
          <ChapterSection
            key={idx}
            chapter={chapter}
            isActive={currentStage === idx + 1}
            isImageRight={idx % 2 === 0}
          />
        ))}

        {/* activities single section */}
        <ActivitiesSection images={activities} />

        {/* videos */}
        <VideosSection />

        {/* login */}
        <LoginSection currentStage={currentStage} totalStages={CHAPTERS.length + 3} />
        {/* stages: hero(0) + chapters(3) + activities + videos + login */}
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media (max-width: 900px) {
          .chapter-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          section { padding: 36px 0 !important; }
        }
      `}</style>
    </div>
  )
}
