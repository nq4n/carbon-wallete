'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle,
  Scan
} from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: any) => void;
}

interface QRActivityData {
  type: 'transport' | 'energy' | 'waste' | 'food';
  activity: string;
  location: string;
  amount: number;
  unit: string;
  carbonFactor: number;
  verified: boolean;
}

// Mock QR data examples that could be found on campus
const mockQRData: { [key: string]: QRActivityData } = {
  'BUS_STATION_01': {
    type: 'transport',
    activity: 'استخدام الحافلة الجامعية',
    location: 'محطة الحافلات - المبنى الرئيسي',
    amount: 1,
    unit: 'رحلة',
    carbonFactor: 2.1,
    verified: true
  },
  'RECYCLE_BIN_A1': {
    type: 'waste',
    activity: 'إعادة تدوير البلاستيك',
    location: 'صندوق إعادة التدوير - مبنى الهندسة',
    amount: 1,
    unit: 'عملية',
    carbonFactor: 0.8,
    verified: true
  },
  'ENERGY_SAVER_L1': {
    type: 'energy',
    activity: 'إطفاء الأنوار',
    location: 'مختبر الحاسوب - الطابق الأول',
    amount: 1,
    unit: 'ساعة',
    carbonFactor: 0.1,
    verified: true
  },
  'CAFETERIA_VEG': {
    type: 'food',
    activity: 'اختيار وجبة نباتية',
    location: 'الكافيتيريا الرئيسية',
    amount: 1,
    unit: 'وجبة',
    carbonFactor: 1.5,
    verified: true
  }
};

export default function QRScanner({ isOpen, onClose, onScanResult }: QRScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<QRActivityData | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      setScanning(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      // Start scanning simulation
      simulateQRScanning();
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن للتطبيق.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
    setScannedData(null);
    setError(null);
  };

  // Simulate QR code scanning (in real implementation, you'd use a QR library)
  const simulateQRScanning = () => {
    // Simulate finding a QR code after 3 seconds
    setTimeout(() => {
      if (scanning) {
        const randomCodes = Object.keys(mockQRData);
        const randomCode = randomCodes[Math.floor(Math.random() * randomCodes.length)];
        handleQRDetected(randomCode);
      }
    }, 3000);
  };

  const handleQRDetected = (qrData: string) => {
    setScanning(false);
    
    // Check if QR code exists in our database
    if (mockQRData[qrData]) {
      setScannedData(mockQRData[qrData]);
    } else {
      setError('رمز QR غير صالح أو غير مسجل في النظام');
    }
  };

  const handleManualInput = () => {
    if (manualCode.trim()) {
      handleQRDetected(manualCode.trim().toUpperCase());
      setManualCode('');
    }
  };

  const handleConfirmActivity = () => {
    if (scannedData) {
      const activityData = {
        type: scannedData.type,
        description: scannedData.activity,
        location: scannedData.location,
        amount: scannedData.amount.toString(),
        unit: scannedData.unit,
        carbonFactor: scannedData.carbonFactor,
        verified: scannedData.verified,
        qrScanned: true
      };
      
      onScanResult(activityData);
      onClose();
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'transport': return 'bg-blue-100 text-blue-700';
      case 'energy': return 'bg-yellow-100 text-yellow-700';
      case 'waste': return 'bg-green-100 text-green-700';
      case 'food': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityTypeName = (type: string) => {
    switch (type) {
      case 'transport': return 'النقل';
      case 'energy': return 'الطاقة';
      case 'waste': return 'النفايات';
      case 'food': return 'الطعام';
      default: return 'غير محدد';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            مسح رمز QR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!scannedData && !error && (
            <>
              {/* Camera View */}
              <div className="relative">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  
                  {/* Scanning overlay */}
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse" />
                        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-green-400" />
                        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-green-400" />
                        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-green-400" />
                        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-green-400" />
                      </div>
                    </div>
                  )}
                  
                  {!stream && !scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-center text-white">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>انتظار تشغيل الكاميرا...</p>
                      </div>
                    </div>
                  )}
                </div>

                {scanning && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Scan className="w-5 h-5 animate-pulse" />
                      <span>جاري البحث عن رمز QR...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Input Option */}
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="w-full"
                >
                  إدخال الرمز يدوياً
                </Button>
                
                {showManualInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="أدخل رمز QR"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button onClick={handleManualInput}>
                      تأكيد
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error State */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scanned Data Display */}
          {scannedData && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">تم اكتشاف النشاط بنجاح!</span>
                  </div>
                  <Badge className={getActivityTypeColor(scannedData.type)}>
                    {getActivityTypeName(scannedData.type)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{scannedData.activity}</p>
                    <p className="text-sm text-muted-foreground">{scannedData.location}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>الكمية: {scannedData.amount} {scannedData.unit}</span>
                    <span>توفير الكربون: {scannedData.carbonFactor} كجم CO₂</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>النقاط المكتسبة: +{Math.round(scannedData.carbonFactor * 10)}</span>
                    {scannedData.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        معتمد
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {scannedData ? (
              <>
                <Button onClick={handleConfirmActivity} className="flex-1">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تسجيل النشاط
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setScannedData(null);
                    setError(null);
                    startCamera();
                  }}
                >
                  مسح آخر
                </Button>
              </>
            ) : (
              <>
                {scanning && (
                  <Button 
                    variant="outline" 
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    إيقاف المسح
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4 ml-2" />
                  إغلاق
                </Button>
              </>
            )}
          </div>

          <canvas
            ref={canvasRef}
            className="hidden"
            width="640"
            height="480"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}