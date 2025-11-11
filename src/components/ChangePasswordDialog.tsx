'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './auth/AuthProvider';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Loader2, Mail } from 'lucide-react';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ChangePasswordDialog({ isOpen, onOpenChange }: ChangePasswordDialogProps) {
  const { user } = useAuthContext();
  const [step, setStep] = useState<'idle' | 'otp_sent'>('idle');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!user?.email) {
      toast.error('البريد الإلكتروني للمستخدم غير متوفر.');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: '#', // We don't need a redirect, but it's required by Supabase
    });

    setLoading(false);
    if (error) {
      setError(`فشل إرسال الرمز: ${error.message}`);
      toast.error('فشل إرسال رمز التحقق.');
    } else {
      setStep('otp_sent');
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني. الرجاء التحقق من صندوق الوارد الخاص بك.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      setError('رمز التحقق يجب أن يتكون من 6 أرقام.');
      return;
    }

    setLoading(true);
    if (!user?.email) return;

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otp,
        type: 'recovery',
    });

    if (verifyError || !verifyData || !verifyData.user) {
      setLoading(false);
      setError('رمز التحقق غير صالح أو منتهي الصلاحية.');
      toast.error('رمز التحقق غير صحيح.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (updateError) {
      setError(`حدث خطأ أثناء تحديث كلمة المرور: ${updateError.message}`);
      toast.error('فشل تغيير كلمة المرور.');
    } else {
      toast.success('تم تغيير كلمة المرور بنجاح! سيتم تسجيل خروجك الآن.');
      handleClose();
      setTimeout(() => {
        supabase.auth.signOut();
      }, 2000);
    }
  };

  const handleClose = () => {
    setStep('idle');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
          {step === 'idle' && (
            <DialogDescription>
              لأمان حسابك، سنرسل رمز تحقق إلى بريدك الإلكتروني المسجل.
            </DialogDescription>
          )}
          {step === 'otp_sent' && (
            <DialogDescription>
              أدخل الرمز الذي أرسلناه إلى بريدك الإلكتروني وكلمة المرور الجديدة.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {step === 'otp_sent' ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">رمز التحقق (OTP)</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تغيير كلمة المرور
                </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center pt-8 pb-4">
             <Mail className="w-16 h-16 text-muted-foreground/50 mb-4" />
             <p className="text-center text-muted-foreground mb-6">انقر أدناه لإرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني.</p>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <Button onClick={handleSendCode} disabled={loading} className="w-full">
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إرسال رمز التحقق
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
