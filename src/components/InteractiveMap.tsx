'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Recycle, 
  Bike, 
  Zap, 
  Navigation,
  Filter,
  Clock,
  Phone,
  Star,
  ExternalLink,
  RefreshCw,
  Maximize
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import GoogleMapComponent from './GoogleMapComponent';
import MapInstructions from './MapInstructions';

interface Location {
  id: number;
  name: string;
  type: 'recycling' | 'bike' | 'charging';
  address: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  phone?: string;
  features?: string[];
  coordinates: { lat: number; lng: number };
}

// إحداثيات جامعة السلطان قابوس
const SQU_CENTER = { lat: 23.5967, lng: 58.1737 };

const locations: Location[] = [
  {
    id: 1,
    name: 'محطة إعادة التدوير المركزية',
    type: 'recycling',
    address: 'مبنى الخدمات الجامعية - جامعة السلطان قابوس',
    distance: '0.2 كم',
    rating: 4.8,
    isOpen: true,
    phone: '+968 2414 1234',
    features: ['ورق', 'بلاستيك', 'معادن', 'زجاج'],
    coordinates: { lat: 23.5975, lng: 58.1745 }
  },
  {
    id: 2,
    name: 'موقف الدراجات الهوائية - كلية الهندسة',
    type: 'bike',
    address: 'مدخل كلية الهندسة - جامعة السلطان قابوس',
    distance: '0.1 كم',
    rating: 4.5,
    isOpen: true,
    features: ['50 مكان', 'آمن', 'مراقب'],
    coordinates: { lat: 23.5955, lng: 58.1750 }
  },
  {
    id: 3,
    name: 'محطة شحن السيارات الكهربائية',
    type: 'charging',
    address: 'موقف السيارات الرئيسي - جامعة السلطان قابوس',
    distance: '0.3 كم',
    rating: 4.6,
    isOpen: true,
    phone: '+968 2414 5678',
    features: ['شحن سريع', '4 نقاط شحن', '24 ساعة'],
    coordinates: { lat: 23.5960, lng: 58.1725 }
  },
  {
    id: 4,
    name: 'محطة إعادة التدوير - المكتبة',
    type: 'recycling',
    address: 'مبنى المكتبة المركزية - جامعة السلطان قابوس',
    distance: '0.4 كم',
    rating: 4.3,
    isOpen: false,
    features: ['ورق', 'أجهزة إلكترونية'],
    coordinates: { lat: 23.5980, lng: 58.1740 }
  },
  {
    id: 5,
    name: 'موقف الدراجات - السكن الجامعي',
    type: 'bike',
    address: 'مجمع السكن الجامعي - جامعة السلطان قابوس',
    distance: '0.8 كم',
    rating: 4.2,
    isOpen: true,
    features: ['30 مكان', 'مضاء'],
    coordinates: { lat: 23.5950, lng: 58.1720 }
  },
  {
    id: 6,
    name: 'محطة شحن كهربائية - مركز الطلاب',
    type: 'charging',
    address: 'مركز الأنشطة الطلابية - جامعة السلطان قابوس',
    distance: '0.5 كم',
    rating: 4.7,
    isOpen: true,
    features: ['شحن عادي', '2 نقاط شحن'],
    coordinates: { lat: 23.5985, lng: 58.1755 }
  },
  {
    id: 7,
    name: 'محطة إعادة التدوير - كلية الطب',
    type: 'recycling',
    address: 'كلية الطب والعلوم الصحية - جامعة السلطان قابوس',
    distance: '0.6 كم',
    rating: 4.4,
    isOpen: true,
    features: ['نفايات طبية آمنة', 'ورق', 'بلاستيك'],
    coordinates: { lat: 23.5945, lng: 58.1760 }
  },
  {
    id: 8,
    name: 'موقف الدراجات - كلية العلوم',
    type: 'bike',
    address: 'كلية العلوم - جامعة السلطان قابوس',
    distance: '0.3 كم',
    rating: 4.6,
    isOpen: true,
    features: ['40 مكان', 'مظلل', 'قريب من المدخل'],
    coordinates: { lat: 23.5970, lng: 58.1730 }
  }
];

export default function InteractiveMap() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openInGoogleMaps = (location: Location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const getDirections = (location: Location) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = `${location.coordinates.lat},${location.coordinates.lng}`;
          const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
          window.open(url, '_blank');
        },
        () => {
          // إذا فشل الحصول على الموقع، استخدم موقع الجامعة كنقطة انطلاق
          const origin = `${SQU_CENTER.lat},${SQU_CENTER.lng}`;
          const destination = `${location.coordinates.lat},${location.coordinates.lng}`;
          const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
          window.open(url, '_blank');
        }
      );
    } else {
      // fallback إذا لم يكن الموقع متاحاً
      const destination = `${location.coordinates.lat},${location.coordinates.lng}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
      window.open(url, '_blank');
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'recycling':
        return <Recycle className="w-5 h-5 text-green-600" />;
      case 'bike':
        return <Bike className="w-5 h-5 text-blue-600" />;
      case 'charging':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'recycling':
        return 'bg-green-100 border-green-300';
      case 'bike':
        return 'bg-blue-100 border-blue-300';
      case 'charging':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const filteredLocations = locations.filter(location => {
    if (selectedFilter === 'all') return true;
    return location.type === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">الخريطة التفاعلية</h2>
          <p className="text-muted-foreground">
            اعثر على المرافق البيئية في الحرم الجامعي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المواقع</SelectItem>
              <SelectItem value="recycling">محطات إعادة التدوير</SelectItem>
              <SelectItem value="bike">مواقف الدراجات</SelectItem>
              <SelectItem value="charging">محطات الشحن الكهربائية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Google Map */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {/* Map Header */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-sm">جامعة السلطان قابوس</h3>
                  <p className="text-xs text-muted-foreground">مسقط، سلطنة عُمان</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white/90 backdrop-blur-sm"
                    onClick={() => {
                      setSelectedLocation(null);
                      toast.info('تم إعادة تعيين الخريطة');
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-white/90 backdrop-blur-sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Google Map Container */}
              <GoogleMapComponent
                locations={filteredLocations}
                center={SQU_CENTER}
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
                className={`transition-all duration-300 ${
                  isFullscreen ? 'fixed inset-4 z-50 rounded-lg shadow-2xl' : 'relative h-96'
                }`}
              />

              {/* Map Legend - يظهر فوق الخريطة */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2 text-sm">دليل الخريطة:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>إعادة التدوير</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>مواقف الدراجات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>شحن كهربائي</span>
                  </div>
                </div>
              </div>

              {/* Fullscreen Close Button */}
              {isFullscreen && (
                <Button
                  className="absolute top-4 right-4 z-50"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                >
                  إغلاق العرض الكامل
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          {selectedLocation ? (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {getLocationIcon(selectedLocation.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedLocation.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedLocation.rating}</span>
                  </div>
                  <Badge variant={selectedLocation.isOpen ? "default" : "secondary"}>
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedLocation.isOpen ? 'مفتوح' : 'مغلق'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{selectedLocation.distance}</span>
                </div>

                {selectedLocation.features && (
                  <div>
                    <h4 className="font-medium mb-2">المميزات:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{selectedLocation.phone}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => getDirections(selectedLocation)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    الاتجاهات
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => openInGoogleMaps(selectedLocation)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    خرائط جوجل
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center space-y-3">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="font-semibold">اختر موقعاً على الخريطة</h3>
                <p className="text-sm text-muted-foreground">
                  انقر على أي علامة على الخريطة لعرض التفاصيل
                </p>
              </div>
            </Card>
          )}

          {/* Locations List */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">المواقع المتاحة</h3>
              <Badge variant="outline">{filteredLocations.length} موقع</Badge>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location);
                  }}
                  className={`w-full text-right p-3 rounded-lg border transition-colors hover:bg-accent ${
                    selectedLocation?.id === location.id ? 'bg-accent border-primary' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getLocationIcon(location.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{location.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{location.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{location.distance}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{location.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={location.isOpen ? "default" : "secondary"} className="text-xs">
                      {location.isOpen ? 'مفتوح' : 'مغلق'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-semibold text-green-600">
                    {locations.filter(l => l.type === 'recycling').length}
                  </div>
                  <div className="text-xs text-muted-foreground">إعادة تدوير</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-600">
                    {locations.filter(l => l.type === 'bike').length}
                  </div>
                  <div className="text-xs text-muted-foreground">مواقف دراجات</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-600">
                    {locations.filter(l => l.type === 'charging').length}
                  </div>
                  <div className="text-xs text-muted-foreground">شحن كهربائي</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* معلومات إضافية وتعليمات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* معلومات عن الخريطة */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">معلومات عن الخريطة</h4>
              <p className="text-sm text-blue-800 mb-2">
                هذه الخريطة التفاعلية تظهر المواقع البيئية المهمة في حرم جامعة السلطان قابوس. 
                يمكنك النقر على أي علامة للحصول على مزيد من المعلومات والاتجاهات.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  <Clock className="w-3 h-3 mr-1" />
                  آخر تحديث: اليوم
                </Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  <Star className="w-3 h-3 mr-1" />
                  دقة عالية
                </Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  <Navigation className="w-3 h-3 mr-1" />
                  مربوط بخرائط جوجل
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* تعليمات الإعداد */}
        <MapInstructions />
      </div>
    </div>
  );
}

// إضافة دعم TypeScript لـ Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}