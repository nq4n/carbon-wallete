'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import QRScanner from './QRScanner';
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
      { value: 'bus', label: 'الحافلة الجامعية', carbonFactor: 0.5 },
      { value: 'walking', label: 'المشي', carbonFactor: 0 },
      { value: 'carpooling', label: 'استخدام النقل العام', carbonFactor: 1.2 }
    ]
  },
  {
    id: 'energy',
    name: 'استخدام الأجهزة',
    icon: Zap,
    options: [
      { value: 'printer_use', label: 'استخدام الطابعة', carbonFactor: 0.4 },
      { value: 'computer_use', label: 'استخدام الكمبيوتر', carbonFactor: 0.6 }
    ]
  },
  {
    id: 'waste',
    name: 'إدارة النفايات',
    icon: Trash2,
    options: [
      { value: 'recycling', label: 'إعادة التدوير', carbonFactor: 0.8 },
      { value: 'composting', label: 'التسميد العضوي', carbonFactor: 0.6 },
      { value: 'reuse', label: 'إعادة الاستخدام', carbonFactor: 0.4 }
    ]
  },
  {
    id: 'food',
    name: 'الطعام والشراب',
    icon: Utensils,
    options: [
      { value: 'vegetarian_meal', label: 'وجبة نباتية', carbonFactor: 1.5 },
      { value: 'local_food', label: 'طعام محلي', carbonFactor: 0.8 },
      { value: 'personal_cup', label: 'استخدام الكوب الخاص', carbonFactor: 0.3 },
      { value: 'food_composting', label: 'إعادة بقايا الطعام في صناديق التسميد العضوي', carbonFactor: 0.7 }
    ]
  }
];

export default function ActivityLogger() {
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

  const handleTypeChange = (type: string) => {
    setForm(prev => ({ ...prev, type: type as any }));
    setSelectedOption(null);
    setCalculatedImpact(null);
  };

  const handleOptionChange = (optionValue: string) => {
    const currentType = activityTypes.find(t => t.id === form.type);
    const option = currentType?.options.find(o => o.value === optionValue);
    
    if (option) {
      setSelectedOption(option);
      setForm(prev => ({ ...prev, description: option.label }));
    }
  };

  const calculateImpact = () => {
    if (!selectedOption || !form.amount) return;
    
    const amount = parseFloat(form.amount);
    const carbonSaved = amount * selectedOption.carbonFactor;
    const pointsEarned = Math.round(carbonSaved * 10);
    
    setCalculatedImpact({ carbonSaved, pointsEarned });
  };

  const handleQRScanResult = (qrData: any) => {
    // Fill form with QR scan data
    setForm({
      type: qrData.type,
      description: qrData.description,
      amount: qrData.amount,
      unit: qrData.unit,
      location: qrData.location,
      qrScanned: true,
      verified: qrData.verified
    });

    // Set calculated impact directly from QR data
    const carbonSaved = qrData.carbonFactor;
    const pointsEarned = Math.round(carbonSaved * 10);
    setCalculatedImpact({ carbonSaved, pointsEarned });

    // Set selected option for consistency
    setSelectedOption({
      label: qrData.description,
      carbonFactor: qrData.carbonFactor
    });

    setIsQRScannerOpen(false);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedImpact) {
      // Here you would normally save to backend
      console.log('Activity logged:', { form, impact: calculatedImpact });
      setIsOpen(false);
      setForm({ type: '', description: '', amount: '', unit: '' });
      setSelectedOption(null);
      setCalculatedImpact(null);
    }
  };

  const resetForm = () => {
    setForm({ type: '', description: '', amount: '', unit: '' });
    setSelectedOption(null);
    setCalculatedImpact(null);
  };

  const getTypeIcon = (type: string) => {
    const typeData = activityTypes.find(t => t.id === type);
    if (!typeData) return null;
    const IconComponent = typeData.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Regular Activity Logger Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              سجل نشاط جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>سجل نشاطك البيئي</DialogTitle>
              <DialogDescription>
                سجل أنشطتك اليومية واحصل على نقاط لمساهمتك في حماية البيئة
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* QR Scanned Badge */}
              {form.qrScanned && (
                <div className="flex items-center justify-center">
                  <Badge className="bg-green-600 text-white px-4 py-2">
                    <QrCode className="w-4 h-4 ml-2" />
                    تم المسح بواسطة QR
                    {form.verified && (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                  </Badge>
                </div>
              )}

              {/* Location (if from QR) */}
              {form.location && (
                <div className="space-y-2">
                  <Label>الموقع</Label>
                  <Input
                    value={form.location}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              {/* Activity Type Selection - only show if not from QR */}
              {!form.qrScanned && (
                <div className="space-y-3">
                  <Label>نوع النشاط</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Card 
                          key={type.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            form.type === type.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => handleTypeChange(type.id)}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{type.name}</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Options - only show if not from QR */}
              {form.type && !form.qrScanned && (
                <div className="space-y-3">
                  <Label>تفاصيل النشاط</Label>
                  <Select onValueChange={handleOptionChange}>
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

              {/* Description (if from QR) */}
              {form.qrScanned && form.description && (
                <div className="space-y-2">
                  <Label>النشاط</Label>
                  <Input
                    value={form.description}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              {/* Amount Input */}
              {(selectedOption || form.qrScanned) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      placeholder="أدخل الكمية"
                      value={form.amount}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                      disabled={form.qrScanned}
                      className={form.qrScanned ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوحدة</Label>
                    {form.qrScanned ? (
                      <Input
                        value={form.unit}
                        disabled
                        className="bg-muted"
                      />
                    ) : (
                      <Select onValueChange={(value) => setForm(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الوحدة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">ساعات</SelectItem>
                          <SelectItem value="km">كيلومترات</SelectItem>
                          <SelectItem value="items">قطع</SelectItem>
                          <SelectItem value="meals">وجبات</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}

              {/* Calculate Impact Button - only for manual entries */}
              {selectedOption && form.amount && form.unit && !form.qrScanned && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={calculateImpact}
                  className="w-full"
                >
                  <Calculator className="w-4 h-4 ml-2" />
                  احسب الأثر البيئي
                </Button>
              )}

              {/* Calculated Impact Display */}
              {calculatedImpact && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">الأثر المحسوب</span>
                    </div>
                    <div className="flex gap-4">
                      <Badge variant="secondary">
                        {calculatedImpact.carbonSaved.toFixed(1)} كجم CO₂ موفرة
                      </Badge>
                      <Badge className="bg-green-600">
                        +{calculatedImpact.pointsEarned} نقطة
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label>ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  placeholder="أضف أي ملاحظات حول هذا النشاط..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={form.qrScanned}
                  className={form.qrScanned ? "bg-muted" : ""}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={!calculatedImpact}
                  className="flex-1"
                >
                  تسجيل النشاط
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

        {/* QR Scanner Button */}
        <Button 
          variant="outline"
          onClick={() => setIsQRScannerOpen(true)}
        >
          <Scan className="w-4 h-4 ml-2" />
          مسح QR
        </Button>
      </div>

      {/* QR Scanner Component */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanResult={handleQRScanResult}
      />
    </>
  );
}