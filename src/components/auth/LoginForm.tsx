'use client'

import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useAuthContext } from './AuthProvider'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Briefcase,
  Loader2,
  AlertCircle,
  Leaf,
  Users,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import greenPulseLogo from 'figma:asset/2c1ec6a90a7fc9cfca4f45b98c3e9ac1918a1565.png'
import GrowingTreeBackground from "./GrowingTreeBackground";

interface LoginData {
  email: string
  password: string
}

interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  name: string
  user_type: 'student' | 'employee'
  university_id: string
  department: string
}

export default function LoginForm() {
  const { signIn, signUp } = useAuthContext()
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAnimating, setIsAnimating] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  })

  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    user_type: 'student',
    university_id: '',
    department: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (isSubmitting) return;
    setError('')
    setIsAnimating(false);

    try {
      const { error } = await signIn(loginData.email, loginData.password)
      
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'بيانات تسجيل الدخول غير صحيحة'
          : 'حدث خطأ في تسجيل الدخول'
        )
        setIsAnimating(true);
      } else {
        toast.success('تم تسجيل الدخول بنجاح!')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      console.error('Login error:', err)
      setIsAnimating(true);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (isSubmitting) return; 
    setError('')
    setIsAnimating(false);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setIsSubmitting(false)
      setIsAnimating(true);
      return
    }

    if (signUpData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setIsSubmitting(false)
      setIsAnimating(true);
      return
    }

    try {
      const { data, error } = await signUp(
        signUpData.email,
        signUpData.password,
        {
          name: signUpData.name,
          user_type: signUpData.user_type,
          university_id: signUpData.university_id,
          department: signUpData.department
        }
      )

      if (error) {
        setError(error.message.includes('already registered')
          ? 'هذا البريد الإلكتروني مسجل مسبقاً'
          : 'حدث خطأ في إنشاء الحساب'
        )
        setIsAnimating(true);
      } else if (data.user) {
        toast.success('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...')

        // Automatically sign in the user
        const { error: signInError } = await signIn(signUpData.email, signUpData.password)
        if (signInError) {
          setError('حدث خطأ أثناء تسجيل الدخول التلقائي');
          setIsAnimating(true);
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      console.error('SignUp error:', err)
      setIsAnimating(true);
    } finally {
      setIsSubmitting(false)
    }
  }

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
      'قسم تقنية المعلومات',
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
  }

  return (
    <>
    <GrowingTreeBackground
        isAnimating={isAnimating}
        color="rgba(21,128,61,0.75)"
        hoverColor="rgba(34, 197, 94, 0.8)"
        lineWidth={1.3}
        speed={1.1}
        density={12}
        fade={0.06}
      />
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2" dir="rtl">
      <div className="bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 lg:p-8 shadow-2xl border-none">
          <div className="text-center mb-6 lg:hidden">
            <ImageWithFallback 
              src={greenPulseLogo} 
              alt="Green Pulse Logo" 
              className="w-16 h-16 object-contain mx-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">المحفظة الكربونية</h1>
            <p className="text-sm text-gray-600">جامعة السلطان قابوس</p>
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="text-red-800">{error}</div>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@squ.edu.om"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع المستخدم</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={signUpData.user_type === 'student' ? 'default' : 'outline'}
                      onClick={() => setSignUpData(prev => ({ 
                        ...prev, 
                        user_type: 'student',
                        department: '',
                        university_id: ''
                      }))}
                      className="flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      طالب
                    </Button>
                    <Button
                      type="button"
                      variant={signUpData.user_type === 'employee' ? 'default' : 'outline'}
                      onClick={() => setSignUpData(prev => ({ 
                        ...prev, 
                        user_type: 'employee',
                        department: '',
                        university_id: ''
                      }))}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      موظف
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university_id">
                    {signUpData.user_type === 'student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}
                  </Label>
                  <Input
                    id="university_id"
                    type="text"
                    placeholder={signUpData.user_type === 'student' ? '202301234' : 'E789456'}
                    value={signUpData.university_id}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, university_id: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    {signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}
                  </Label>
                  <Select 
                    value={signUpData.department} 
                    onValueChange={(value) => setSignUpData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`اختر ${signUpData.user_type === 'student' ? 'الكلية' : 'القسم'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments[signUpData.user_type].map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@squ.edu.om"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة المرور (6 أحرف على الأقل)"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="أعد كتابة كلمة المرور"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 text-sm mb-2">حساب تجريبي:</h4>
            <p className="text-xs text-blue-700">
              البريد: demo@squ.edu.om<br />
              كلمة المرور: demo123
            </p>
          </div>
        </Card>
      </div>
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 p-12 text-white">
        <div className="max-w-md text-center">
          <ImageWithFallback 
              src={greenPulseLogo} 
              alt="Green Pulse Logo" 
              className="w-24 h-24 object-contain mx-auto mb-6"
            />
          <h1 className="text-4xl font-bold mb-4">المحفظة الرقمية الكربونية</h1>
          <p className="text-lg mb-8 text-green-100">جامعة السلطان قابوس</p>

          <div className="space-y-6 text-right">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-full"><Leaf className="w-6 h-6 text-white"/></div>
              <div>
                <h3 className="font-semibold">تعزيز الوعي البيئي</h3>
                <p className="text-sm text-green-200">زيادة الوعي بأهمية تقليل البصمة الكربونية.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-full"><Users className="w-6 h-6 text-white"/></div>
              <div>
                <h3 className="font-semibold">تشجيع المشاركة المجتمعية</h3>
                <p className="text-sm text-green-200">تحفيز الطلاب والموظفين على تبني ممارسات صديقة للبيئة.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-full"><Award className="w-6 h-6 text-white"/></div>
              <div>
                <h3 className="font-semibold">مكافأة السلوكيات الإيجابية</h3>
                <p className="text-sm text-green-200">كسب النقاط والمكافآت من خلال المشاركة في الأنشطة البيئية.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
