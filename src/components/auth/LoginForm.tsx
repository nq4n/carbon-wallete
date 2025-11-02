import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, Loader2, AlertCircle } from 'lucide-react';

/* ---------- Configuration ---------- */
const LOGO = '/assets/logo.png';
const CHAPTERS = [
  { title: 'من نحن', src: '/assets/photos/who_are_we.jpg', subtitle: 'رحلة النبض الأخضر تبدأ من هنا' },
  { title: 'رؤيتنا', src: '/assets/photos/our_vission.jpg', subtitle: 'نحو مستقبل مستدام للأجيال القادمة' },
  { title: 'رسالتنا', src: '/assets/photos/our_massage.jpg', subtitle: 'نشر الوعي البيئي في كل مكان' },
  { title: 'نشاط 1', src: '/assets/photos/activity_1.jpg', subtitle: 'مبادرات تحدث الفرق' },
  { title: 'نشاط 2', src: '/assets/photos/activity_2.jpg', subtitle: 'معاً نحو التغيير الإيجابي' },
  { title: 'نشاط 3', src: '/assets/photos/activity_3.jpg', subtitle: 'خطوات عملية نحو الاستدامة' },
  { title: 'نشاط 4', src: '/assets/photos/activity_4.jpg', subtitle: 'تأثير حقيقي في المجتمع' },
  { title: 'نشاط 5', src: '/assets/photos/activity_5.jpg', subtitle: 'ابتكارات خضراء للمستقبل' },
];

/* ---------- Subcomponents ---------- */
const AnimatedPath = ({ pathRef, d, progress }) => {
  const pathLength = pathRef.current?.getTotalLength() || 1;
  const dashOffset = (1 - Math.min(progress * 1.05, 1)) * pathLength;

  return (
    <svg
      viewBox="0 0 100 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ shapeRendering: 'geometricPrecision' }}
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#059669" stopOpacity="1" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
        </linearGradient>

        {/* بديل للغلو بدون هالات بيضاء */}
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.35" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10b981" floodOpacity="0.18" />
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
          mixBlendMode: 'normal'
        }}
      />
    </svg>
  );
};

const StageIndicator = ({ stage, isActive, isPassed }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      top: stage.top,
      background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#fff',
      border: isPassed ? '2px solid #10b981' : '2px solid rgba(2,6,23,.1)',
      boxShadow: isActive 
        ? '0 12px 32px rgba(16,185,129,.4), 0 0 0 8px rgba(16,185,129,.1)' 
        : '0 8px 24px rgba(2,6,23,.08)',
      borderRadius: 999,
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      opacity: isPassed ? 1 : 0.4,
      transition: 'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: `translateX(-50%) scale(${isActive ? 1.05 : 1})`,
      zIndex: isActive ? 10 : 5,
    }}
  >
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: isActive ? '#fff' : isPassed ? '#10b981' : '#cbd5e1',
        boxShadow: isActive ? '0 0 12px rgba(255,255,255,.8)' : 'none',
        transition: 'all .3s ease',
      }}
    />
    <span style={{ 
      fontWeight: 800, 
      fontSize: 15,
      color: isActive ? '#fff' : '#1f2937',
      letterSpacing: '0.3px'
    }}>
      {stage.label}
    </span>
  </div>
);

/* ---------- Login Section Component ---------- */
const LoginSection = ({ currentStage, totalStages }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: 'male',
    user_type: 'student',
    university_id: '',
    department: ''
  });

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
      'كلية التمريض'
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
      'العلاقات العامة'
    ]
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    
    // Simulating API call - Replace with actual authentication
    try {
      // Demo account check
      if (loginData.email === 'demo@squ.edu.om' && loginData.password === 'demo123') {
        setTimeout(() => {
          alert('تم تسجيل الدخول بنجاح! (Demo Account)');
          setIsSubmitting(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setError('بيانات تسجيل الدخول غير صحيحة');
          setIsSubmitting(false);
        }, 1000);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsSubmitting(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.department) {
      setError('يرجى اختيار الكلية أو القسم');
      setIsSubmitting(false);
      return;
    }

    // Simulating API call - Replace with actual registration
    try {
      setTimeout(() => {
        alert(`تم إنشاء الحساب بنجاح!\nالاسم: ${signUpData.name}\nالنوع: ${signUpData.user_type === 'student' ? 'طالب' : 'موظف'}\nالجنس: ${signUpData.gender === 'male' ? 'ذكر' : 'أنثى'}`);
        setIsSubmitting(false);
        // Switch to login tab after successful signup
        setActiveTab('login');
      }, 1500);
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      setIsSubmitting(false);
    }
  };

  const isActive = currentStage === totalStages;

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
          opacity: 1,
          transform: 'none',
          transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img 
            src={LOGO} 
            alt="Logo" 
            style={{ 
              width: 64, 
              height: 64, 
              objectFit: 'contain', 
              margin: '0 auto 16px',
              filter: 'drop-shadow(0 4px 8px rgba(16,185,129,.2))'
            }} 
          />
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 900, 
            marginBottom: 8,
            background: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            المحفظة الكربونية
          </h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>جامعة السلطان قابوس</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
            <span style={{ color: '#991b1b', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8,
          background: '#f1f5f9',
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
        }}>
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

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="example@squ.edu.om"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
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
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* User Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                نوع المستخدم
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSignUpData(prev => ({ ...prev, user_type: 'student', department: '', university_id: '' }))}
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
                  onClick={() => setSignUpData(prev => ({ ...prev, user_type: 'employee', department: '', university_id: '' }))}
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
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                الاسم الكامل
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                الجنس
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSignUpData(prev => ({ ...prev, gender: 'male' }))}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: signUpData.gender === 'male' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: signUpData.gender === 'male' ? '#ecfdf5' : '#fff',
                    color: signUpData.gender === 'male' ? '#065f46' : '#64748b',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpData(prev => ({ ...prev, gender: 'female' }))}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: signUpData.gender === 'female' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: signUpData.gender === 'female' ? '#ecfdf5' : '#fff',
                    color: signUpData.gender === 'female' ? '#065f46' : '#64748b',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                >
                  أنثى
                </button>
              </div>
            </div>

            {/* University ID */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {signUpData.user_type === 'student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}
              </label>
              <input
                type="text"
                placeholder={signUpData.user_type === 'student' ? '202301234' : 'E789456'}
                value={signUpData.university_id}
                onChange={(e) => setSignUpData(prev => ({ ...prev, university_id: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}
              </label>
              <select
                value={signUpData.department}
                onChange={(e) => setSignUpData(prev => ({ ...prev, department: e.target.value }))}
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
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">اختر {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}</option>
                {departments[signUpData.user_type].map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="example@squ.edu.om"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                تأكيد كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="أعد كتابة كلمة المرور"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
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
          </form>
        )}

        {/* Demo Account Info */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#eff6ff',
          borderRadius: 12,
          border: '1px solid #bfdbfe',
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
            حساب تجريبي:
          </h4>
          <p style={{ fontSize: 12, color: '#1e3a8a', margin: 0 }}>
            البريد: demo@squ.edu.om<br />
            كلمة المرور: demo123
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

const ChapterSection = ({ chapter, index, isActive, isImageRight }) => {
  const scale = isActive ? 1 : 0.92;
  const opacity = isActive ? 1 : 0.3;

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
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isImageRight ? '1fr 600px' : '600px 1fr',
          gap: 48,
          alignItems: 'center',
          opacity,
          transform: `scale(${scale}) translateY(${isActive ? 0 : 30}px)`,
          transition: 'all .6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!isImageRight && <ChapterText title={chapter.title} subtitle={chapter.subtitle} />}
        
        <div
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)',
            border: '1px solid rgba(2,6,23,.06)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: isActive 
              ? '0 32px 80px rgba(2,6,23,.18), 0 0 0 1px rgba(16,185,129,.1)' 
              : '0 16px 40px rgba(2,6,23,.1)',
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
            {/* Image overlay gradient */}
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
  );
};

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
    <p style={{ 
      color: '#334155', 
      lineHeight: 1.8, 
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 8,
    }}>
      {subtitle}
    </p>
    <p style={{ 
      color: '#475569', 
      lineHeight: 1.75, 
      fontSize: 16,
      fontWeight: 500,
    }}>
      نص تفصيلي يمكن إضافته لاحقاً لشرح هذه المرحلة بشكل أوسع وأعمق، مع التركيز على القيمة المضافة والتأثير الإيجابي.
    </p>
  </div>
);

/* ---------- Main Component ---------- */
export default function PreAuthShowcaseCentered() {
  const pathRef = useRef(null);
  const containerRef = useRef(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Professional curved path with smoother transitions
  const pathD = useMemo(
    () =>
      [
        'M 50 8',
        // Gentle wave to right
        'C 65 25, 70 45, 50 65',
        // Smooth transition to left
        'C 30 85, 28 105, 50 125',
        // Wave to right
        'C 72 145, 75 165, 50 185',
        // Final gentle curve
        'C 25 205, 50 218, 50 215',
      ].join(' '),
    []
  );

  const stages = useMemo(
    () => [
      { top: 60, label: 'البداية', progress: 0 },
      ...CHAPTERS.map((ch, i) => ({
        top: 140 + i * 120,
        label: ch.title,
        progress: (i + 1) / (CHAPTERS.length + 1),
      })),
      { top: 140 + CHAPTERS.length * 120, label: 'النهاية', progress: 1 },
    ],
    []
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const sections = container.querySelectorAll('section');
    
    let maxProgress = 0;
    let activeIdx = 0;

    sections.forEach((section, idx) => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh / 2 - rect.top) / (vh / 2)));
      
      if (progress > maxProgress) {
        maxProgress = progress;
        activeIdx = idx;
      }
    });

    setCurrentStage(activeIdx);
    
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const currentScroll = doc.scrollTop;
    setScrollProgress(maxScroll > 0 ? currentScroll / maxScroll : 0);
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

        <AnimatedPath pathRef={pathRef} d={pathD} progress={scrollProgress} />


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
      `}</style>
    </div>
  );
}