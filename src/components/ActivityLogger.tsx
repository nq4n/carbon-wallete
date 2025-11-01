'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import QRScanner from './QRScanner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { 
  Car, 
  Zap, 
  Trash2, 
  Utensils,
  Plus,
  Calculator,
  CheckCircle,
  QrCode,
  Scan
} from 'lucide-react';

interface ActivityForm {
  type: 'transport' | 'energy' | 'waste' | 'food' | '';
  description: string;
  amount: string;
  unit: string;
  location?: string;
  qrScanned?: boolean;
  verified?: boolean;
}

const activityTypes = [
  {
    id: 'transport',
    name: 'النقل والمواصلات',
    icon: Car,
    options: [
      { value: 'bus', label: 'الحافلة الجامعية', carbonFactor: 0.5, unit: 'km' },
      { value: 'walking', label: 'المشي', carbonFactor: 1.5, unit: 'km' },
      { value: 'carpooling', label: 'استخدام النقل العام', carbonFactor: 1.2, unit: 'km' }
    ]
  },
  {
    id: 'energy',
    name: 'استخدام الأجهزة',
    icon: Zap,
    options: [
      { value: 'printer_use', label: 'استخدام الطابعة', carbonFactor: 0.4, unit: 'items' },
      { value: 'computer_use', label: 'استخدام الكمبيوتر', carbonFactor: 0.6, unit: 'hours' }
    ]
  },
  {
    id: 'waste',
    name: 'إدارة النفايات',
    icon: Trash2,
    options: [
      { value: 'recycling', label: 'إعادة التدوير', carbonFactor: 0.8, unit: 'items' },
      { value: 'composting', label: 'التسميد العضوي', carbonFactor: 0.6, unit: 'kg' },
      { value: 'reuse', label: 'إعادة الاستخدام', carbonFactor: 0.4, unit: 'items' }
    ]
  },
  {
    id: 'food',
    name: 'الطعام والشراب',
    icon: Utensils,
    options: [
      { value: 'vegetarian_meal', label: 'وجبة نباتية', carbonFactor: 1.5, unit: 'meals' },
      { value: 'local_food', label: 'طعام محلي', carbonFactor: 0.8, unit: 'meals' },
      { value: 'personal_cup', label: 'استخدام الكوب الخاص', carbonFactor: 0.3, unit: 'items' },
      { value: 'food_composting', label: 'إعادة بقايا الطعام في صناديق التسميد العضوي', carbonFactor: 0.7, unit: 'kg' }
    ]
  }
];

const toNum = (v: any, d = 0) => {
  const x = Number(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(x) ? x : d;
};

export default function ActivityLogger({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [form, setForm] = useState<ActivityForm>({
    type: '',
    description: '',
    amount: '',
    unit: ''
  });
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [calculatedImpact, setCalculatedImpact] = useState<{
    carbonSaved: number;
    pointsEarned: number;
  } | null>(null);

  useEffect(() => {
    if (form.qrScanned) return;

    const amount = toNum(form.amount, 0);
    const factor = toNum(selectedOption?.carbonFactor, 0);

    if (selectedOption && form.amount) {
        if (amount > 0 && factor > 0) {
            const carbonSaved = amount * factor;
            const pointsEarned = Math.round(carbonSaved * 10);
            setCalculatedImpact({ carbonSaved, pointsEarned });
        } else {
            setCalculatedImpact({ carbonSaved: 0, pointsEarned: 0 });
        }
    } else {
        setCalculatedImpact(null);
    }
}, [form.amount, selectedOption, form.qrScanned]);


  const handleTypeChange = (type: string) => {
    setForm(prev => ({ ...prev, type: type as any, amount: '', unit: '' }));
    setSelectedOption(null);
  };

  const handleOptionChange = (optionValue: string) => {
    const currentType = activityTypes.find(t => t.id === form.type);
    const option = currentType?.options.find(o => o.value === optionValue);
    
    if (option) {
      setSelectedOption(option);
      setForm(prev => ({ ...prev, description: option.label, unit: option.unit }));
    }
  };

  const handleQRScanResult = (qrData: any) => {
    setForm({
      type: qrData.type,
      description: qrData.description,
      amount: String(qrData.amount),
      unit: qrData.unit,
      location: qrData.location,
      qrScanned: true,
      verified: qrData.verified
    });

    const carbonSaved = toNum(qrData.amount, 1) * toNum(qrData.carbonFactor, 0);
    const pointsEarned = Math.round(carbonSaved * 10);
    setCalculatedImpact({ carbonSaved, pointsEarned });

    setSelectedOption({
      label: qrData.description,
      carbonFactor: qrData.carbonFactor
    });

    setIsQRScannerOpen(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedImpact || !user) return;

    const { error } = await supabase.rpc("log_activity_and_earn", {
        p_user_id: user.id,
        p_kind: form.type,
        p_description: form.description,
        p_amount: toNum(form.amount) || 1,
        p_unit: form.unit || "unit",
        p_carbon_factor: toNum(selectedOption?.carbonFactor) || 0,
        p_points: calculatedImpact.pointsEarned || 0,
        p_location: form.location || null,
        p_catalog_id: null,
        p_verified: form.verified || false,
    });

    if (error) {
        toast.error(`حدث خطأ: ${error.message}`);
        return;
    }

    toast.success("تم تسجيل النشاط بنجاح!");
    onSaved();
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ type: '', description: '', amount: '', unit: '' });
    setSelectedOption(null);
    setCalculatedImpact(null);
  };

  return (
    <>
      <div className="flex gap-2">
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              سجل نشاط جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>سجل نشاطك البيئي</DialogTitle>
              <DialogDescription>
                سجل أنشطتك اليومية واحصل على نقاط لمساهمتك في حماية البيئة.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.qrScanned && (
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                    <QrCode className="w-5 h-5 ml-2" />
                    تم التحقق من النشاط عبر QR
                    {form.verified && (
                      <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    )}
                  </Badge>
                </div>
              )}

              {form.location && (
                <div className="space-y-2">
                  <Label>الموقع</Label>
                  <Input value={form.location} disabled className="bg-muted" />
                </div>
              )}

              {!form.qrScanned && (
                <div className="space-y-3">
                  <Label>نوع النشاط</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {activityTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Card 
                          key={type.id}
                          className={`p-4 cursor-pointer transition-all border-2 ${
                            form.type === type.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                          }`}
                          onClick={() => handleTypeChange(type.id)}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <IconComponent className="w-6 h-6" />
                            <span className="font-medium text-center text-sm">{type.name}</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.type && !form.qrScanned && (
                <div className="space-y-3">
                  <Label>تفاصيل النشاط</Label>
                  <Select onValueChange={handleOptionChange} value={selectedOption?.value ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النشاط المحدد" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.find(t => t.id === form.type)?.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.qrScanned && form.description && (
                <div className="space-y-2">
                  <Label>النشاط</Label>
                  <Input value={form.description} disabled className="bg-muted" />
                </div>
              )}

              {(selectedOption || form.qrScanned) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">الكمية</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="مثال: 5"
                      value={form.amount}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                      disabled={form.qrScanned}
                      className={form.qrScanned ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">الوحدة</Label>
                    <Input id="unit" value={form.unit} disabled className="bg-muted" />
                  </div>
                </div>
              )}

              {calculatedImpact && (
                <Card className="p-4 bg-green-50 border-green-200 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <span className="font-bold text-lg">الأثر البيئي المحسوب</span>
                        <div className="flex items-center gap-4 mt-1">
                           <Badge variant="secondary" className="text-base">
                            {calculatedImpact.carbonSaved.toFixed(2)} كجم CO₂
                          </Badge>
                          <Badge className="bg-green-600 text-base">
                            +{calculatedImpact.pointsEarned} نقطة
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {!form.qrScanned &&
                <div className="space-y-2">
                  <Label>ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    placeholder="أضف أي ملاحظات حول هذا النشاط..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              }

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={!calculatedImpact || calculatedImpact.pointsEarned === 0}
                  className="flex-1"
                >
                  تسجيل النشاط وكسب النقاط
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          onClick={() => setIsQRScannerOpen(true)}
        >
          <Scan className="w-4 h-4 ml-2" />
          مسح رمز QR
        </Button>
      </div>

      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanResult={handleQRScanResult}
      />
    </>
  );
}
