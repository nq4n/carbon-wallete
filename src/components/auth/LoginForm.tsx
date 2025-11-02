import greenPulseLogo from '../../assets/logo.png'
// الصور داخل photos
import whoImg       from '../../assets/photos/who_are_we.jpg'
import visionImg    from '../../assets/photos/our_vission.jpg'
import messageImg   from '../../assets/photos/our_massage.jpg'
import activity1Img from '../../assets/photos/activity_1.jpg'
import activity2Img from '../../assets/photos/activity_2.jpg'
import activity3Img from '../../assets/photos/activity_3.jpg'
import activity4Img from '../../assets/photos/activity_4.jpg'
import activity5Img from '../../assets/photos/activity_5.jpg'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, Loader2, AlertCircle } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { toast } from 'sonner'



/* ---------- Configuration ---------- */
const LOGO = greenPulseLogo;
const CHAPTERS = [
  { title: 'من نحن',   src: whoImg,       subtitle: 'رحلة النبض الأخضر تبدأ من هنا' },
  { title: 'رؤيتنا',   src: visionImg,    subtitle: 'نحو مستقبل مستدام للأجيال القادمة' },
  { title: 'رسالتنا',  src: messageImg,   subtitle: 'نشر الوعي البيئي في كل مكان' },
  { title: 'نشاط 1',   src: activity1Img, subtitle: 'مبادرات تحدث الفرق' },
  { title: 'نشاط 2',   src: activity2Img, subtitle: 'معاً نحو التغيير الإيجابي' },
  { title: 'نشاط 3',   src: activity3Img, subtitle: 'خطوات عملية نحو الاستدامة' },
  { title: 'نشاط 4',   src: activity4Img, subtitle: 'تأثير حقيقي في المجتمع' },
  { title: 'نشاط 5',   src: activity5Img, subtitle: 'ابتكارات خضراء للمستقبل' },
];

/* ---------- Subcomponents ---------- */
const AnimatedPath = ({ pathRef, d, progress, pathLength }) => {
  const dashOffset = (1 - Math.min(progress * 1.05, 1)) * (pathLength || 1)

  return (
    <svg
      viewBox="0 0 100 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ shapeRendering: 'geometricPrecision' }}
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="50%" stopColor="#059669" stopOpacity="1" />
          <stop offset="100%" stopColor="#047857" stopOpacity="1" />
        </linearGradient>

        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="1" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10b981" floodOpacity="1" />
        </filter>
      </defs>

      {/* ظل ناعم خلف المسار */}
      <path
        d={d}
        stroke="rgba(16,185,129,.10)"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathGlow)"
      />

      {/* المسار المتحرك الوحيد */}
      <path
        ref={pathRef}
        d={d}
        stroke="url(#pathGradient)"
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          paintOrder: 'stroke',
          strokeDasharray: pathLength,
          strokeDashoffset: dashOffset,
          transition: 'stroke-dashoffset 100ms ease-out',
          mixBlendMode: 'normal',
        }}
      />
    </svg>
  )
}

/* ---------- Login Section (موصول بـ AuthProvider) ---------- */
const LoginSection = ({ currentStage, totalStages }) => {
  const { signIn, signUp } = useAuthContext()

  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAnimating, setIsAnimating] = useState(true)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: 'male',
    user_type: 'student',
    university_id: '',
    department: '',
  })

  const departments = {
    student: [
      'كلية الهندسة',
      'كلية العلوم',
      'كلية الطب والعلوم الصحية',
      'كلية العلوم الزراعية والبحرية',
      'كلية الاقتصاد والعلوم السياسية',
      'كلية الآداب والعلوم الاجتماعية',
      'كلية التربية',
      'كلية الحقوق',
      'كلية التمريض',
    ],
    employee: [
      'كلية الهندسة',
      'كلية العلوم',
      'كلية الطب والعلوم الصحية',
      'كلية العلوم الزراعية والبحرية',
      'كلية الاقتصاد والعلوم السياسية',
      'كلية الآداب والعلوم الاجتماعية',
      'كلية التربية',
      'كلية الحقوق',
      'كلية التمريض',
      'الشؤون الأكاديمية',
      'الموارد البشرية',
      'الشؤون المالية',
      'شؤون الطلاب',
      'المكتبة',
      'الصيانة والخدمات',
      'الأمن والسلامة',
      'البحث العلمي',
      'العلاقات العامة',
    ],
  }

  const isActive = currentStage === totalStages

  const handleLogin = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')
    setIsAnimating(false)

    try {
      const email = loginData.email.trim().toLowerCase()
      const password = loginData.password

      const { error } = await signIn(email, password)

      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'بيانات تسجيل الدخول غير صحيحة'
            : 'حدث خطأ في تسجيل الدخول'
        )
        setIsAnimating(true)
      } else {
        toast.success('تم تسجيل الدخول بنجاح!')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ غير متوقع')
      setIsAnimating(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')
    setIsAnimating(false)

    const email = signUpData.email.trim().toLowerCase()
    const password = signUpData.password
    const confirm = signUpData.confirmPassword

    if (password !== confirm) {
      setError('كلمات المرور غير متطابقة')
      setIsSubmitting(false)
      setIsAnimating(true)
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setIsSubmitting(false)
      setIsAnimating(true)
      return
    }
    if (!signUpData.department) {
      setError('يرجى اختيار الكلية أو القسم')
      setIsSubmitting(false)
      setIsAnimating(true)
      return
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
        setError(
          (error.message || '').toLowerCase().includes('already')
            ? 'هذا البريد الإلكتروني مسجل مسبقاً'
            : 'حدث خطأ في إنشاء الحساب'
        )
        setIsAnimating(true)
      } else if (data?.user) {
        toast.success('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...')
        const { error: signInError } = await signIn(email, password)
        if (signInError) {
          setError('حدث خطأ أثناء تسجيل الدخول التلقائي')
          setIsAnimating(true)
        } else {
          // الدخول تم بنجاح
        }
        // بعد النجاح ممكن توجّه إلى لوحة التحكم:
        // navigate('/dashboard')
      }
    } catch (err) {
      console.error('SignUp error:', err)
      setError('حدث خطأ غير متوقع')
      setIsAnimating(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'center',
        padding: '60px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: 32,
          padding: 48,
          boxShadow: '0 24px 64px rgba(2,6,23,.14), 0 0 0 1px rgba(16,185,129,.08)',
          border: '1px solid rgba(16,185,129,.1)',
          opacity: isActive ? 1 : 1,
          transform: `translateY(${isActive ? 0 : 8}px) scale(${isActive ? 1 : 0.99})`,
          transition: 'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src={LOGO}
            alt="Logo"
            style={{
              width: 64,
              height: 64,
              objectFit: 'contain',
              margin: '0 auto 12px',
              filter: 'drop-shadow(0 4px 8px rgba(16,185,129,.2))',
            }}
          />
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              marginBottom: 6,
              background: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            المحفظة الكربونية
          </h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>جامعة السلطان قابوس</p>
        </div>

        {/* تبويب بسيط (أزرار) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            background: '#f1f5f9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'login' ? '#fff' : 'transparent',
              color: activeTab === 'login' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all .2s ease',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
            }}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'signup' ? '#fff' : 'transparent',
              color: activeTab === 'signup' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all .2s ease',
              boxShadow: activeTab === 'signup' ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
            }}
          >
            إنشاء حساب
          </button>
        </div>

        {/* Alert */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
            <span style={{ color: '#991b1b', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="example@squ.edu.om"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border .2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border .2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#94a3b8',
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all .2s ease',
                boxShadow: '0 4px 12px rgba(16,185,129,.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* User Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                نوع المستخدم
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() =>
                    setSignUpData((p) => ({ ...p, user_type: 'student', department: '', university_id: '' }))
                  }
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: signUpData.user_type === 'student' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: signUpData.user_type === 'student' ? '#ecfdf5' : '#fff',
                    color: signUpData.user_type === 'student' ? '#065f46' : '#64748b',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all .2s ease',
                  }}
                >
                  <GraduationCap style={{ width: 16, height: 16 }} />
                  طالب
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSignUpData((p) => ({ ...p, user_type: 'employee', department: '', university_id: '' }))
                  }
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: signUpData.user_type === 'employee' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: signUpData.user_type === 'employee' ? '#ecfdf5' : '#fff',
                    color: signUpData.user_type === 'employee' ? '#065f46' : '#64748b',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all .2s ease',
                  }}
                >
                  <Briefcase style={{ width: 16, height: 16 }} />
                  موظف
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                الاسم الكامل
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData((p) => ({ ...p, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            {/* University ID */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {signUpData.user_type === 'student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}
              </label>
              <input
                type="text"
                placeholder={signUpData.user_type === 'student' ? '202301234' : 'E789456'}
                value={signUpData.university_id}
                onChange={(e) => setSignUpData((p) => ({ ...p, university_id: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}
              </label>
              <select
                value={signUpData.department}
                onChange={(e) => setSignUpData((p) => ({ ...p, department: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              >
                <option value="">اختر {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}</option>
                {departments[signUpData.user_type].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="example@squ.edu.om"
                  autoComplete="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData((p) => ({ ...p, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  autoComplete="new-password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData((p) => ({ ...p, password: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#94a3b8',
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                تأكيد كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="أعد كتابة كلمة المرور"
                  autoComplete="new-password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#94a3b8',
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: 16, height: 16 }} />
                  ) : (
                    <Eye style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all .2s ease',
                boxShadow: '0 4px 12px rgba(16,185,129,.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </button>

            {/* Demo Account Info */}
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: '#eff6ff',
                borderRadius: 12,
                border: '1px solid #bfdbfe',
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>حساب تجريبي:</h4>
              <p style={{ fontSize: 12, color: '#1e3a8a', margin: 0 }}>
                البريد: demo@squ.edu.om
                <br />
                كلمة المرور: demo123
              </p>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

/* ---------- Chapter Section ---------- */
const ChapterSection = ({ chapter, index, isActive, isImageRight }) => {
  const scale = isActive ? 1 : 0.92
  const opacity = isActive ? 1 : 1

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 0',
        scrollSnapAlign: 'center',
      }}
    >
      <div
        className="chapter-grid"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isImageRight ? 'minmax(0,1fr) 560px' : '560px minmax(0,1fr)',
          gap: 48,
          alignItems: 'center',
          opacity,
          transform: `scale(${scale}) translateY(${isActive ? 0 : 30}px)`,
          transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, opacity',
        }}
      >
        {!isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}

        <div
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)',
            border: '1px solid rgba(2,6,23,.06)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: isActive ? '0 32px 80px rgba(2,6,23,.18), 0 0 0 1px rgba(16,185,129,.1)' : '0 16px 40px rgba(2,6,23,.1)',
            transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `scale(${isActive ? 1 : 0.96})`,
          }}
        >
          <div style={{ position: 'relative', paddingTop: '75%' }}>
            <img
              src={chapter.src}
              alt={chapter.title}
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,.2) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}
      </div>
    </section>
  )
}

const ChapterText = ({ title, subtitle }) => (
  <div style={{ maxWidth: 540 }}>
    <div
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        color: '#047857',
        padding: '6px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 16,
        border: '1px solid #a7f3d0',
        letterSpacing: '0.5px',
      }}
    >
      مرحلة جديدة
    </div>
    <h3
      style={{
        fontSize: 42,
        fontWeight: 900,
        marginBottom: 12,
        lineHeight: 1.2,
        color: '#1e293b',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: '#334155',
        lineHeight: 1.8,
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 8,
      }}
    >
      {subtitle}
    </p>
    <p
      style={{
        color: '#475569',
        lineHeight: 1.75,
        fontSize: 16,
        fontWeight: 500,
      }}
    >
      نص تفصيلي يمكن إضافته لاحقاً لشرح هذه المرحلة بشكل أوسع وأعمق، مع التركيز على القيمة المضافة والتأثير الإيجابي.
    </p>
  </div>
)

/* ---------- Main Component ---------- */
export default function PreAuthShowcaseCentered() {
  const pathRef = useRef(null)
  const containerRef = useRef(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pathLength, setPathLength] = useState(1)
  const ticking = useRef(false)

  // Professional curved path
  const pathD = useMemo(
    () =>
      ['M 50 8', 'C 65 25, 70 45, 50 65', 'C 30 85, 28 105, 50 125', 'C 72 145, 75 165, 50 185', 'C 25 205, 50 218, 50 215'].join(
        ' '
      ),
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
      if (!containerRef.current) {
        ticking.current = false
        return
      }
      const container = containerRef.current
      const sections = container.querySelectorAll('section')
      let maxProgress = 0
      let activeIdx = 0
      const vh = window.innerHeight

      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, (vh / 2 - rect.top) / (vh / 2)))
        if (p > maxProgress) {
          maxProgress = p
          activeIdx = idx
        }
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
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  return (
    <div
      style={{
        direction: 'rtl',
        color: '#0f172a',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background: '#fafafa',
        minHeight: '100vh',
        scrollSnapType: 'y proximity',
      }}
    >
      {/* Animated background gradients */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(1400px 700px at 50% 0%, rgba(16,185,129,.04), transparent 70%), ' +
            'radial-gradient(1400px 700px at 50% 100%, rgba(5,150,105,.04), transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Fixed SVG Path Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {/* Logo Badge */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(16,185,129,.15)',
            borderRadius: 999,
            padding: '10px 20px',
            boxShadow: '0 12px 32px rgba(2,6,23,.08), 0 0 0 1px rgba(16,185,129,.05)',
          }}
        >
          <img src={LOGO} alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <strong style={{ fontSize: 18, letterSpacing: '0.3px' }}>النبض الأخضر</strong>
        </div>

        <AnimatedPath pathRef={pathRef} d={pathD} progress={scrollProgress} pathLength={pathLength} />
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 32px 120px',
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            scrollSnapAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 900,
                marginBottom: 20,
                lineHeight: 1.1,
                color: '#0f172a',
              }}
            >
              رحلة الوعي الكربوني
            </h1>
            <p style={{ color: '#475569', fontSize: 20, lineHeight: 1.7, marginBottom: 32, fontWeight: 500 }}>
              انضم إلينا في رحلة ملهمة نحو مستقبل أكثر استدامة. اكتشف كيف نصنع الفرق معاً.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#10b981',
                fontSize: 16,
                fontWeight: 700,
                animation: 'bounce 2s infinite',
              }}
            >
              <span>ابدأ الرحلة</span>
              <span style={{ fontSize: 24 }}>↓</span>
            </div>
          </div>
        </section>

        {/* Chapters */}
        {CHAPTERS.map((chapter, idx) => (
          <ChapterSection
            key={idx}
            chapter={chapter}
            index={idx}
            isActive={currentStage === idx + 1}
            isImageRight={idx % 2 === 0}
          />
        ))}

        {/* Login Section */}
        <LoginSection currentStage={currentStage} totalStages={CHAPTERS.length + 2} />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (max-width: 900px) {
          .chapter-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
