
import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { toast } from 'sonner';

interface OtpFormProps {
  email: string;
  onSuccess: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ email, onSuccess }) => {
  const { verifyOtp } = useAuthContext();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await verifyOtp(email, otp);
      if (error) {
        setError('رمز التحقق غير صحيح أو منتهي الصلاحية');
      } else {
        toast.success('تم التحقق بنجاح! جاري تسجيل الدخول...');
        onSuccess();
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
          <span style={{ color: '#991b1b', fontSize: 14 }}>{error}</span>
        </div>
      )}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
          رمز التحقق (OTP)
        </label>
        <p style={{color: '#64748b', fontSize: 13, marginBottom: '1rem'}}>
            لقد أرسلنا رمزًا للتحقق إلى بريدك الإلكتروني.
        </p>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="أدخل الرمز"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.5rem'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          />
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
            <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />{' '}
            جاري التحقق...
          </>
        ) : (
          'تحقق'
        )}
      </button>
    </form>
  );
};
