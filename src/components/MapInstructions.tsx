'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Key, 
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function MapInstructions() {
  return (
    <div className="space-y-4">
      {/* تعليمات الاستخدام */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>ملاحظة هامة:</strong> لاستخدام الخريطة التفاعلية الكاملة، يجب إضافة مفتاح Google Maps API الخاص بك.
        </AlertDescription>
      </Alert>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Key className="w-4 h-4" />
          كيفية إعداد خرائط جوجل
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">احصل على مفتاح Google Maps API</p>
              <p className="text-muted-foreground">
                اذهب إلى <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> وأنشئ مفتاح API
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">فعّل الخدمات المطلوبة</p>
              <div className="text-muted-foreground space-y-1">
                <p>• Maps JavaScript API</p>
                <p>• Places API</p>
                <p>• Geocoding API</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">استبدل المفتاح في الكود</p>
              <p className="text-muted-foreground">
                ابحث عن <code className="bg-gray-100 px-1 rounded">YOUR_GOOGLE_MAPS_API_KEY</code> واستبدله بمفتاحك
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">تحذير أمني</p>
              <p className="text-amber-700">
                تأكد من تقييد استخدام مفتاح API للنطاقات المصرح بها فقط لحماية حسابك من الاستخدام غير المصرح به.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* الميزات المتاحة */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          الميزات المتاحة في الخريطة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>عرض مواقع المرافق البيئية</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>معلومات تفصيلية لكل موقع</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>توجيهات GPS مباشرة</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>فلترة حسب نوع المرفق</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>عرض الصور الجوية للحرم</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
              ✓
            </Badge>
            <span>دعم اللغة العربية</span>
          </div>
        </div>
      </Card>

      {/* روابط مفيدة */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">روابط مفيدة</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://developers.google.com/maps/documentation" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              وثائق Google Maps API
            </a>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Cloud Console
            </a>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <a href="https://www.squ.edu.om" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              موقع جامعة السلطان قابوس
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}