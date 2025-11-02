'use client';

import { useState } from 'react';
import { Card } from '<div styleName={} />
<div styleName={}></div>/components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from './AuthProvider';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import GrowingTreeBackground from './GrowingTreeBackground';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import logo from '@/assets/images/logo.png';

/* شخصيات يمين ويسار الكرت */
import man from '@/assets/images/characters/man_figure.png';
import woman from '@/assets/images/characters/women_figure.png';

/* الـShowcase بنمط الخريطة */
import ShowcaseRoadmap from './ShowcaseRoadmap';

type LoginData = { email:string; password:string; };
type SignUpData = {
  email:string; password:string; confirmPassword:string; name:string;
  user_type:'student'|'employee'; university_id:string; department:string;
};

export default function LoginForm(){
  const { signIn, signUp } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'login'|'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  const [loginData, setLoginData] = useState<LoginData>({ email:'', password:'' });
  const [signUpData, setSignUpData] = useState<SignUpData>({
    email:'', password:'', confirmPassword:'', name:'',
    user_type:'student', university_id:'', department:''
  });

  const departments = {
    student: [
      'كلية الهندسة','كلية العلوم','كلية الطب والعلوم الصحية','كلية العلوم الزراعية والبحرية',
      'كلية الاقتصاد والعلوم السياسية','كلية الآداب والعلوم الاجتماعية','كلية التربية','كلية الحقوق','كلية التمريض',
    ],
    employee: [
      'قسم تقنية المعلومات','الشؤون الأكاديمية','الموارد البشرية','الشؤون المالية',
      'شؤون الطلاب','المكتبة','الصيانة والخدمات','الأمن والسلامة','البحث العلمي','العلاقات العامة',
    ],
  };

  const handleLogin = async (e:React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setError(''); setIsAnimating(false);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) { setError(error.message === 'Invalid login credentials' ? 'بيانات تسجيل الدخول غير صحيحة' : 'حدث خطأ في تسجيل الدخول'); setIsAnimating(true); }
    else toast.success('تم تسجيل الدخول بنجاح!');
    setIsSubmitting(false);
  };

  const handleSignUp = async (e:React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setError(''); setIsAnimating(false);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('كلمات المرور غير متطابقة'); setIsSubmitting(false); setIsAnimating(true); return;
    }
    if (signUpData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); setIsSubmitting(false); setIsAnimating(true); return;
    }

    const { data, error } = await signUp(signUpData.email, signUpData.password, {
      name: signUpData.name,
      user_type: signUpData.user_type,
      university_id: signUpData.university_id,
      department: signUpData.department,
    });

    if (error) {
      setError(error.message?.includes('already registered') ? 'هذا البريد الإلكتروني مسجل مسبقاً' : 'حدث خطأ في إنشاء الحساب');
      setIsAnimating(true);
    } else if (data?.user) {
      toast.success('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...');
      const { error: autoErr } = await signIn(signUpData.email, signUpData.password);
      if (autoErr) setError('حدث خطأ أثناء تسجيل الدخول التلقائي');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <GrowingTreeBackground
        isAnimating={isAnimating}
        color="rgba(21,128,61,0.75)" hoverColor="rgba(34, 197, 94, 0.8)"
        lineWidth={1.1} speed={1.1} density={12} fade={0.06}
      />

      {/* تخطيط مصغّر جدًا ومقارب، ومحاذي من الأعلى */}
      <div className="min-h-screen w-full flex items-start justify-center px-0" dir="rtl">
        <div className="w-full max-w-[1120px] grid grid-cols-1 md:grid-cols-2 gap-0 items-start">

          {/* العمود الأيسر: Showcase Roadmap */}
          <div className="flex items-start justify-end pr-1 pt-8">
            <div className="w-full max-w-[520px]">
              <ShowcaseRoadmap
                onLogin={()=>setActiveTab('login')}
                onSignup={()=>setActiveTab('signup')}
              />
            </div>
          </div>

          {/* العمود الأيمن: بطاقة تسجيل الدخول / إنشاء حساب + الشخصيات على الجانبين */}
          <div className="relative flex items-start justify-start pl-1 pt-[80px]">

            {/* شخصيات يمين/يسار الكرت */}
            <img src={man} alt="man" className="hidden lg:block absolute -left-20 top-14 h-44 select-none pointer-events-none" />
            <img src={woman} alt="woman" className="hidden lg:block absolute -right-20 top-10 h-44 select-none pointer-events-none" />

            <Card className="w-full max-w-[520px] p-8 shadow-2xl border-none bg-white">

              {/* شعار أعلى البطاقة (غير الشعار في الـShowcase) */}
              <div className="text-center mb-6">
                <ImageWithFallback src={logo} alt="Green Pulse Logo" className="w-16 h-16 mx-auto" />
                <h1 className="text-2xl font-bold mt-2 text-gray-900">المحفظة الكربونية</h1>
                <p className="text-gray-600 text-sm">جامعة السلطان قابوس</p>
              </div>

              {/* رسالة خطأ */}
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="text-red-800">{error}</div>
                </Alert>
              )}

              {/* تبويب: تسجيل الدخول / إنشاء حساب */}
              <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-2 mb-5">
                  <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                </TabsList>

                {/* ====== تبويب تسجيل الدخول ====== */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email" type="email" placeholder="example@squ.edu.om"
                          value={loginData.email}
                          onChange={(e)=>setLoginData((p)=>({ ...p, email: e.target.value }))}
                          className="pr-10" required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password" type={showPassword ? 'text':'password'} placeholder="••••••"
                          value={loginData.password}
                          onChange={(e)=>setLoginData((p)=>({ ...p, password: e.target.value }))}
                          className="pr-10 pl-10" required
                        />
                        <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute left-3 top-3 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff/> : <Eye/>}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />جاري تسجيل الدخول...</>) : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </TabsContent>

                {/* ====== تبويب إنشاء الحساب ====== */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label>نوع المستخدم</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={signUpData.user_type === 'student' ? 'default':'outline'}
                          onClick={()=>setSignUpData(p=>({ ...p, user_type:'student', department:'', university_id:'' }))}
                          className="flex items-center gap-2"
                        >
                          <GraduationCap className="w-4 h-4" /> طالب
                        </Button>
                        <Button
                          type="button"
                          variant={signUpData.user_type === 'employee' ? 'default':'outline'}
                          onClick={()=>setSignUpData(p=>({ ...p, user_type:'employee', department:'', university_id:'' }))}
                          className="flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" /> موظف
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name" type="text" placeholder="أدخل اسمك الكامل"
                          value={signUpData.name}
                          onChange={(e)=>setSignUpData(p=>({ ...p, name: e.target.value }))}
                          className="pr-10" required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="university_id">{signUpData.user_type === 'student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}</Label>
                      <Input
                        id="university_id" type="text"
                        placeholder={signUpData.user_type === 'student' ? '202301234' : 'E789456'}
                        value={signUpData.university_id}
                        onChange={(e)=>setSignUpData(p=>({ ...p, university_id: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="department">{signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}</Label>
                      <Select value={signUpData.department} onValueChange={(v)=>setSignUpData(p=>({ ...p, department: v }))}>
                        <SelectTrigger><SelectValue placeholder={`اختر ${signUpData.user_type === 'student' ? 'الكلية':'القسم'}`} /></SelectTrigger>
                        <SelectContent>
                          {departments[signUpData.user_type].map((dept)=>(
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email" type="email" placeholder="example@squ.edu.om"
                          value={signUpData.email}
                          onChange={(e)=>setSignUpData(p=>({ ...p, email: e.target.value }))}
                          className="pr-10" required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password" type={showPassword ? 'text':'password'}
                          value={signUpData.password}
                          onChange={(e)=>setSignUpData(p=>({ ...p, password: e.target.value }))}
                          className="pr-10 pl-10" required
                        />
                        <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff/> : <Eye/>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password" type={showConfirmPassword ? 'text':'password'}
                          value={signUpData.confirmPassword}
                          onChange={(e)=>setSignUpData(p=>({ ...p, confirmPassword: e.target.value }))}
                          className="pr-10 pl-10" required
                        />
                        <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <EyeOff/> : <Eye/>}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />جاري إنشاء الحساب...</>) : 'إنشاء حساب'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* حساب تجريبي */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 text-sm mb-1">حساب تجريبي:</h4>
                <p className="text-xs text-blue-700">
                  البريد: demo@squ.edu.om<br/>كلمة المرور: demo123
                </p>
              </div>

            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
