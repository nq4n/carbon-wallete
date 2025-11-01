'use client'

import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useAuthContext } from './auth/AuthProvider'
import { 
  User, 
  GraduationCap, 
  Briefcase,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import greenPulseLogo from 'figma:asset/2c1ec6a90a7fc9cfca4f45b98c3e9ac1918a1565.png'

interface ProfileData {
  name: string
  user_type: 'student' | 'employee'
  university_id: string
  department: string
}

export default function ProfileSetup() {
  const { user, createProfile } = useAuthContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.user_metadata?.name || '',
    user_type: user?.user_metadata?.user_type || 'student',
    university_id: user?.user_metadata?.university_id || '',
    department: user?.user_metadata?.department || ''
  })

  const departments = {
    student: [
    'كلية الهندسة',
    'كلية العلوم',
    'كلية الطب والعلوم الصحية',
    'كلية التمريض',
    'كلية العلوم الزراعية والبحرية',
    'كلية الآداب والعلوم الاجتماعية',
    'كلية التربية',
    'كلية الحقوق',
    'كلية الاقتصاد والعلوم السياسية'],
    employee: [
       'كلية الهندسة',
    'كلية العلوم',
    'كلية الطب والعلوم الصحية',
    'كلية التمريض',
    'كلية العلوم الزراعية والبحرية',
    'كلية الآداب والعلوم الاجتماعية',
    'كلية التربية',
    'كلية الحقوق',
    'كلية الاقتصاد والعلوم السياسية',
    'عمادة القبول والتسجيل',
    'عمادة شؤون الطلبة',
    'عمادة الدراسات العليا',
    'عمادة البحث العلمي',
    'عمادة التعليم الإلكتروني',
    'مركز تقانة المعلومات (CIS)',
    'الموارد البشرية',
    'الشؤون المالية',
    'المكتبة الرئيسية',
    'الأمن والسلامة',
    'الصيانة والخدمات',
    'العلاقات العامة والإعلام',
    'مركز الخدمات الطبية',
    'مركز الدراسات التأسيسية (CPS)'
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!user) {
      setError('لم يتم العثور على المستخدم')
      setIsSubmitting(false)
      return
    }

    try {
      console.log('ProfileSetup: Starting profile creation for user:', user.id)
      
      const { data, error } = await createProfile({
        id: user.id,
        email: user.email!,
        name: profileData.name,
        user_type: profileData.user_type,
        university_id: profileData.university_id,
        department: profileData.department
      })

      console.log('ProfileSetup: Profile creation result:', { data, error })

      if (error) {
        setError('حدث خطأ في إنشاء الملف الشخصي')
        console.error('Profile creation error:', error)
      } else {
        toast.success('تم إنشاء الملف الشخصي بنجاح!')
        console.log('ProfileSetup: Profile created successfully')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      console.error('Profile setup error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src={greenPulseLogo} 
              alt="Green Pulse Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إتمام الملف الشخصي</h1>
          <p className="text-sm text-gray-600 mt-1">أكمل بياناتك لبدء استخدام التطبيق</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div className="space-y-2">
            <Label>نوع المستخدم</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={profileData.user_type === 'student' ? 'default' : 'outline'}
                onClick={() => setProfileData(prev => ({ 
                  ...prev, 
                  user_type: 'student',
                  department: ''
                }))}
                className="flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                طالب
              </Button>
              <Button
                type="button"
                variant={profileData.user_type === 'employee' ? 'default' : 'outline'}
                onClick={() => setProfileData(prev => ({ 
                  ...prev, 
                  user_type: 'employee',
                  department: ''
                }))}
                className="flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                موظف
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="pr-10"
                required
              />
            </div>
          </div>

          {/* University ID */}
          <div className="space-y-2">
            <Label htmlFor="university_id">
              {profileData.user_type === 'student' ? 'الرقم الجامعي' : 'الرقم الوظيفي'}
            </Label>
            <Input
              id="university_id"
              type="text"
              placeholder={profileData.user_type === 'student' ? '202301234' : 'E789456'}
              value={profileData.university_id}
              onChange={(e) => setProfileData(prev => ({ ...prev, university_id: e.target.value }))}
              required
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">
              {profileData.user_type === 'student' ? 'التخصص' : 'القسم'}
            </Label>
            <Select 
              value={profileData.department} 
              onValueChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`اختر ${profileData.user_type === 'student' ? 'التخصص' : 'القسم'}`} />
              </SelectTrigger>
              <SelectContent>
                {departments[profileData.user_type].map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Email Display */}
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">لا يمكن تعديل البريد الإلكتروني</p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || !profileData.name || !profileData.university_id || !profileData.department}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري إنشاء الملف...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                إنشاء الملف الشخصي
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}