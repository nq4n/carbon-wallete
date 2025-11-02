'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Lightbulb,
  Zap,
  ArrowRight,
  Car,
  Recycle,
  GlassWater,
  Smartphone,
} from 'lucide-react';

type AIRecommendationsProps = {
  disabled?: boolean; // ← تشغيل/إيقاف شاشة "قريباً"
};

// بيانات تجريبية
const mockRecommendations = [
  {
    id: 1,
    title: 'جرّب استخدام الحافلة الجامعية بدلاً من السيارة',
    description:
      'بناءً على أنشطتك الأخيرة في النقل، يمكنك توفير ما يقارب 1.5 كجم من ثاني أكسيد الكربون أسبوعياً.',
    category: 'transport',
    potential: '1.5 كجم/أسبوع',
  },
  {
    id: 2,
    title: 'تقليل استخدام الطابعة في المكتبة المركزية',
    description:
      'لقد لاحظنا أنك تطبع بشكل متكرر. حاول مراجعة المستندات رقمياً لتوفير الورق والطاقة.',
    category: 'waste',
    potential: '0.8 كجم/أسبوع',
  },
  {
    id: 3,
    title: 'إطفاء الأنوار عند مغادرة القاعة الدراسية',
    description:
      'هذا الإجراء البسيط يمكن أن يساهم في تقليل استهلاك الكهرباء بشكل ملحوظ على مستوى الجامعة.',
    category: 'energy',
    potential: '0.5 كجم/أسبوع',
  },
  {
    id: 4,
    title: 'استخدم زجاجة مياه ذكية قابلة لإعادة الاستخدام',
    description:
      'بدلاً من شراء عبوات المياه البلاستيكية، استخدم زجاجة ذكية للحفاظ على مشروباتك باردة أو ساخنة وتقليل النفايات البلاستيكية.',
    category: 'cups',
    potential: '1.2 كجم/أسبوع',
  },
  {
    id: 5,
    title: 'اشحن أجهزتك باستخدام بنك طاقة شمسي',
    description:
      'استغل الطاقة الشمسية لشحن هاتفك وأجهزتك الأخرى أثناء تنقلك في الحرم الجامعي، مما يقلل من اعتمادك على شبكة الكهرباء.',
    category: 'tech',
    potential: '0.9 كجم/أسبوع',
  },
];

const getCategoryIcon = (category: string) => {
  const className = 'w-6 h-6';
  switch (category) {
    case 'transport':
      return <Car className={`${className} text-blue-500`} />;
    case 'waste':
      return <Recycle className={`${className} text-green-500`} />;
    case 'energy':
      return <Zap className={`${className} text-yellow-500`} />;
    case 'cups':
      return <GlassWater className={`${className} text-cyan-500`} />;
    case 'tech':
      return <Smartphone className={`${className} text-gray-500`} />;
    default:
      return <Lightbulb className={`${className} text-gray-400`} />;
  }
};

export default function AIRecommendations({ disabled = true }: AIRecommendationsProps) {
  return (
    <section dir="rtl" className="max-w-7xl mx-auto">
      {/* وعاء القسم: isolate يضمن أن أي z-index خارجي ما يأثر */}
      <div className="relative isolate z-0 rounded-xl overflow-hidden">
        {/* رأس القسم */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">توصيات الذكاء الاصطناعي</h2>
              <p className="text-muted-foreground">
                نصائح مخصصة لك لتقليل بصمتك الكربونية
              </p>
            </div>
            <Button variant="outline" disabled={disabled}>
              تحديث التوصيات
            </Button>
          </div>

          {/* الشبكة */}
          <div
            className={[
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
              disabled ? 'opacity-40 select-none pointer-events-none' : '',
            ].join(' ')}
          >
            {mockRecommendations.map((rec) => (
              <Card key={rec.id} className="relative z-0 flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {getCategoryIcon(rec.category)}
                    <h3 className="font-semibold text-lg">{rec.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{rec.description}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <Badge variant="secondary">توفير محتمل</Badge>
                    <p className="font-bold text-green-600 mt-1">{rec.potential}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex gap-1">
                    التفاصيل <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ===== Overlay عند التعطيل ===== */}
        {disabled && (
          <>
            {/* قناع يغطي كامل الوعاء — أعلى من كل المحتوى */}
            <div
              className="pointer-events-none absolute inset-0 z-[90] bg-background/85 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* بطاقة الرسالة */}
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
              <Card className="pointer-events-auto p-8 text-center bg-background/95 shadow-lg">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">✨ قريباً! ✨</h3>
                <p className="text-muted-foreground leading-relaxed">
                  نحن حالياً نعمل على تطوير هذا القسم.
                  <br />
                  انتظر النسخة القادمة!
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
