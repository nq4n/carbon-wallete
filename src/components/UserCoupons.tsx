'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './auth/AuthProvider';
import { Loader2, Ticket, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';

interface Coupon {
  id: number;
  order_code: string;
  reward: {
    name: string;
    description: string;
  } | null;
}

export default function UserCoupons() {
  const { user } = useAuthContext();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reward_orders')
      .select(`
        id,
        order_code,
        reward:rewards_catalog (name, description)
      `)
      .eq('user_id', user.id)
      .not('order_code', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      toast.error('حدث خطأ أثناء تحميل الكوبونات.');
    } else {
      setCoupons(data as Coupon[]);
    }
    setLoading(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('تم نسخ الكود بنجاح!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ms-2 text-muted-foreground">جاري تحميل الكوبونات...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
        <h3 className="font-semibold mb-4">كوبوناتك</h3>
      {coupons.length === 0 ? (
        <div className="text-center py-10 bg-gray-50/50 rounded-lg">
          <Ticket className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">ليس لديك أي كوبونات في الوقت الحالي.</p>
          <p className="text-sm text-muted-foreground/80">استمر في تجميع النقاط للحصول على مكافآت جديدة!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className='flex-grow'>
                <h4 className="font-semibold text-primary">{coupon.reward?.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{coupon.reward?.description}</p>
              </div>
              <div className="bg-gray-50 border-dashed border-2 border-gray-300 rounded-lg p-3 flex items-center justify-between gap-4 flex-shrink-0">
                <span className="text-lg font-mono font-semibold text-gray-700 select-all">
                  {coupon.order_code}
                </span>
                <button onClick={() => handleCopyCode(coupon.order_code)} className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  {copiedCode === coupon.order_code ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
