import React, { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, Loader2, AlertCircle
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { toast } from 'sonner';
import greenPulseLogo from '../../assets/logo.png';

// figures beside login card (your filenames)
import manFigure from '../../assets/photos/man_figure.png';
import womanFigure from '../../assets/photos/women_figure.png';

const LOGO = greenPulseLogo;

export const LoginSection = ({ currentStage, totalStages }: { currentStage: number; totalStages: number }) => {
  const { signIn, signUp } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: 'male' as 'male' | 'female',
    user_type: 'student' as 'student' | 'employee',
    university_id: '',
    department: '',
  });

  const departments = {
    student: [
      'كلية الهندسة', 'كلية العلوم', 'كلية الطب والعلوم الصحية', 'كلية العلوم الزراعية والبحرية',
      'كلية الاقتصاد والعلوم السياسية', 'كلية الآداب والعلوم الاجتماعية', 'كلية التربية', 'كلية الحقوق', 'كلية التمريض',
    ],
    employee: [
      'كلية الهندسة', 'كلية العلوم', 'كلية الطب والعلوم الصحية', 'كلية العلوم الزراعية والبحرية', 'كلية الاقتصاد والعلوم السياسية',
      'كلية الآداب والعلوم الاجتماعية', 'كلية التربية', 'كلية الحقوق', 'كلية التمريض', 'الشؤون الأكاديمية', 'الموارد البشرية',
      'الشؤون المالية', 'شؤون الطلاب', 'المكتبة', 'الصيانة والخدمات', 'الأمن والسلامة', 'البحث العلمي', 'العلاقات العامة',
    ],
  };

  const isActive = currentStage === totalStages;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const email = loginData.email.trim().toLowerCase();
      const password = loginData.password;
      const { error } = await signIn(email, password);
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'بيانات تسجيل الدخول غير صحيحة'
            : 'حدث خطأ في تسجيل الدخول'
        );
      } else {
        toast.success('تم تسجيل الدخول بنجاح!');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const email = signUpData.email.trim().toLowerCase();
    const password = signUpData.password;
    const confirm = signUpData.confirmPassword;

    if (password !== confirm) {
      setError('كلمات المرور غير متطابقة');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsSubmitting(false);
      return;
    }
    if (!signUpData.department) {
      setError('يرجى اختيار الكلية أو القسم');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await signUp(email, password, {
        name: signUpData.name.trim(),
        user_type: signUpData.user_type,
        university_id: signUpData.university_id.trim(),
        department: signUpData.department,
        gender: signUpData.gender,
      });
      if (error) {
        setError(
          (error.message || '').toLowerCase().includes('already')
            ? 'هذا البريد الإلكتروني مسجل مسبقاً'
            : 'حدث خطأ في إنشاء الحساب'
        );
      } else if (data?.user) {
        toast.success('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...');
        const { error: signInError } = await signIn(email, password);
        if (signInError) setError('حدث خطأ أثناء تسجيل الدخول التلقائي');
      }
    } catch (err) {
      console.error('SignUp error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'center',
        padding: '48px 16px',
      }}
    >
      <div
        className="login-grid"
        style={{
          width: '100%',
          maxWidth: 1160,
          display: 'grid',
          // side columns are flexible, card keeps a good min/max width
          gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 520px) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {/* Left figure (woman) */}
        <button
          type="button"
          onClick={() =>
            activeTab === 'signup' &&
            setSignUpData((p) => ({ ...p, gender: 'female' }))
          }
          aria-label="أنثى"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: activeTab === 'signup' ? 'pointer' : 'default',
            justifySelf: 'end',
          }}
        >
          <img
            src={womanFigure}
            alt="شكل امرأة"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 450,
              maxWidth: 260,
              objectFit: 'contain',
              display: 'block',
              transform: 'translateY(8px)',
              filter:
                activeTab === 'login' || signUpData.gender === 'female'
                  ? 'none'
                  : 'grayscale(1) brightness(0.65)',
            }}
          />
        </button>

        {/* Card */}
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            background: '#fff',
            borderRadius: 32,
            padding: 28,
            boxShadow:
              '0 24px 64px rgba(2,6,23,.14), 0 0 0 1px rgba(16,185,129,.08)',
            border: '1px solid rgba(16,185,129,.1)',
            opacity: isActive ? 1 : 1,
            transform: `translateY(${isActive ? 0 : 8}px) scale(${
              isActive ? 1 : 0.99
            })`,
            transition: 'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <img
              src={LOGO}
              alt="Logo"
              style={{
                width: 64,
                height: 64,
                objectFit: 'contain',
                margin: '0 auto 10px',
                filter: 'drop-shadow(0 4px 8px rgba(16,185,129,.2))',
              }}
            />
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                marginBottom: 4,
                background:
                  'linear-gradient(135deg,#0f172a 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              المحفظة الكربونية
            </h2>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              جامعة السلطان قابوس
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              background: '#f1f5f9',
              borderRadius: 12,
              padding: 4,
              marginBottom: 12,
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
                boxShadow:
                  activeTab === 'login'
                    ? '0 2px 8px rgba(0,0,0,.08)'
                    : 'none',
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
                boxShadow:
                  activeTab === 'signup'
                    ? '0 2px 8px rgba(0,0,0,.08)'
                    : 'none',
              }}
            >
              إنشاء حساب
            </button>
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle
                style={{
                  width: 16,
                  height: 16,
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#991b1b', fontSize: 14 }}>{error}</span>
            </div>
          )}

          {activeTab === 'login' && (
            <form
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  البريد الإلكتروني
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="example@squ.edu.om"
                    autoComplete="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  كلمة المرور
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((p) => ({ ...p, password: e.target.value }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
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
                      color: '#94a3b8',
                    }}
                  >
                    {showPassword ? (
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
                  background: isSubmitting
                    ? '#94a3b8'
                    : 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      style={{
                        width: 16,
                        height: 16,
                        animation: 'spin 1s linear infinite',
                      }}
                    />{' '}
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <form
              onSubmit={handleSignUp}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  نوع المستخدم
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData((p) => ({
                        ...p,
                        user_type: 'student',
                        department: '',
                        university_id: '',
                      }))
                    }
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border:
                        signUpData.user_type === 'student'
                          ? '2px solid #10b981'
                          : '1px solid #e2e8f0',
                      background:
                        signUpData.user_type === 'student'
                          ? '#ecfdf5'
                          : '#fff',
                      color:
                        signUpData.user_type === 'student'
                          ? '#065f46'
                          : '#64748b',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <GraduationCap style={{ width: 16, height: 16 }} /> طالب
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData((p) => ({
                        ...p,
                        user_type: 'employee',
                        department: '',
                        university_id: '',
                      }))
                    }
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border:
                        signUpData.user_type === 'employee'
                          ? '2px solid #10b981'
                          : '1px solid #e2e8f0',
                      background:
                        signUpData.user_type === 'employee'
                          ? '#ecfdf5'
                          : '#fff',
                      color:
                        signUpData.user_type === 'employee'
                          ? '#065f46'
                          : '#64748b',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Briefcase style={{ width: 16, height: 16 }} /> موظف
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  الجنس
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData((p) => ({ ...p, gender: 'male' }))
                    }
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border:
                        signUpData.gender === 'male'
                          ? '2px solid #10b981'
                          : '1px solid #e2e8f0',
                      background:
                        signUpData.gender === 'male' ? '#ecfdf5' : '#fff',
                      color:
                        signUpData.gender === 'male'
                          ? '#065f46'
                          : '#64748b',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData((p) => ({ ...p, gender: 'female' }))
                    }
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border:
                        signUpData.gender === 'female'
                          ? '2px solid #10b981'
                          : '1px solid #e2e8f0',
                      background:
                        signUpData.gender === 'female' ? '#ecfdf5' : '#fff',
                      color:
                        signUpData.gender === 'female'
                          ? '#065f46'
                          : '#64748b',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    أنثى
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  الاسم الكامل
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={signUpData.name}
                    onChange={(e) =>
                      setSignUpData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  {signUpData.user_type === 'student'
                    ? 'الرقم الجامعي'
                    : 'الرقم الوظيفي'}
                </label>
                <input
                  type="text"
                  placeholder={
                    signUpData.user_type === 'student' ? '202301234' : 'E789456'
                  }
                  value={signUpData.university_id}
                  onChange={(e) =>
                    setSignUpData((p) => ({
                      ...p,
                      university_id: e.target.value,
                    }))
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = '#10b981')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = '#e2e8f0')
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}
                </label>
                <select
                  value={signUpData.department}
                  onChange={(e) =>
                    setSignUpData((p) => ({
                      ...p,
                      department: e.target.value,
                    }))
                  }
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = '#10b981')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = '#e2e8f0')
                  }
                >
                  <option value="">
                    اختر{' '}
                    {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}
                  </option>
                  {departments[signUpData.user_type].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  البريد الإلكتروني
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="example@squ.edu.om"
                    autoComplete="email"
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  كلمة المرور
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور (6 أحرف على الأقل)"
                    autoComplete="new-password"
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
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
                      color: '#94a3b8',
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: 16, height: 16 }} />
                    ) : (
                      <Eye style={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  تأكيد كلمة المرور
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      width: 16,
                      height: 16,
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد كتابة كلمة المرور"
                    autoComplete="new-password"
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      setSignUpData((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#10b981')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#e2e8f0')
                    }
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
                  background: isSubmitting
                    ? '#94a3b8'
                    : 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      style={{
                        width: 16,
                        height: 16,
                        animation: 'spin 1s linear infinite',
                      }}
                    />{' '}
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  'إنشاء حساب'
                )}
              </button>

              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  background: '#eff6ff',
                  borderRadius: 12,
                  border: '1px solid #bfdbfe',
                }}
              >
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e40af',
                    marginBottom: 6,
                  }}
                >
                المنصة قيد التطوير 
                </h4>
                <p
                  style={{
                    fontSize: 12,
                    color: '#1e3a8a',
                    margin: 0,
                  }}
                >
                 سيتم إعلامك عند الإطلاق
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right figure (man) */}
        <button
          type="button"
          onClick={() =>
            activeTab === 'signup' &&
            setSignUpData((p) => ({ ...p, gender: 'male' }))
          }
          aria-label="ذكر"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: activeTab === 'signup' ? 'pointer' : 'default',
            justifySelf: 'start',
          }}
        >
          <img
            src={manFigure}
            alt="شكل رجل"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: 260,
              maxHeight:450,
              objectFit: 'contain',
              display: 'block',
              transform: 'translateY(8px)',
              filter:
                activeTab === 'login' || signUpData.gender === 'male'
                  ? 'none'
                  : 'grayscale(1) brightness(0.65)',
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        /* tighter phone spacing */
        @media (max-width: 900px) {
          .login-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
};
