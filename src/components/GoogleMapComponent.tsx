'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner@2.0.3';

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

interface GoogleMapComponentProps {
  locations: Location[];
  center: { lat: number; lng: number };
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  className?: string;
}

export default function GoogleMapComponent({
  locations,
  center,
  onLocationSelect,
  selectedLocation,
  className = ''
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      try {
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            },
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        googleMapRef.current = map;
        
        // إنشاء نافذة معلومات واحدة قابلة لإعادة الاستخدام
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 300
        });

        updateMarkers();
        setMapLoaded(true);
        
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('خطأ في تحميل الخريطة');
      }
    };

    // التحقق من تحميل Google Maps
    if (window.google?.maps) {
      initializeMap();
    } else {
      // انتظار تحميل Google Maps
      const checkGoogleMaps = () => {
        if (window.google?.maps) {
          initializeMap();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }

    return () => {
      // تنظيف العلامات عند إلغاء تحميل المكون
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [center]);

  useEffect(() => {
    if (googleMapRef.current && mapLoaded) {
      updateMarkers();
    }
  }, [locations, mapLoaded]);

  useEffect(() => {
    // التركيز على الموقع المختار
    if (selectedLocation && googleMapRef.current) {
      googleMapRef.current.panTo(selectedLocation.coordinates);
      googleMapRef.current.setZoom(18);
    }
  }, [selectedLocation]);

  const updateMarkers = () => {
    if (!googleMapRef.current || !window.google?.maps) return;

    // إزالة العلامات السابقة
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: location.coordinates,
        map: googleMapRef.current,
        title: location.name,
        icon: {
          url: getMarkerIcon(location.type),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        },
        animation: google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        onLocationSelect(location);
        showInfoWindow(marker, location);
      });

      // إضافة تأثير hover
      marker.addListener('mouseover', () => {
        marker.setIcon({
          url: getMarkerIcon(location.type),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36)
        });
      });

      marker.addListener('mouseout', () => {
        marker.setIcon({
          url: getMarkerIcon(location.type),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        });
      });

      markersRef.current.push(marker);
    });
  };

  const getMarkerIcon = (type: string) => {
    const color = getMarkerColor(type);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
          ${getMarkerSymbol(type)}
        </text>
      </svg>
    `)}`;
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'recycling': return '#059669';
      case 'bike': return '#2563eb';
      case 'charging': return '#eab308';
      default: return '#dc2626';
    }
  };

  const getMarkerSymbol = (type: string) => {
    switch (type) {
      case 'recycling': return '♻';
      case 'bike': return '🚲';
      case 'charging': return '⚡';
      default: return '📍';
    }
  };

  const showInfoWindow = (marker: google.maps.Marker, location: Location) => {
    if (!infoWindowRef.current) return;

    const content = `
      <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 280px;">
        <div style="padding: 8px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600; line-height: 1.3;">
            ${location.name}
          </h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.4;">
            ${location.address}
          </p>
          
          <div style="display: flex; align-items: center; gap: 12px; margin: 8px 0; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #fbbf24; font-size: 14px;">⭐</span>
              <span style="color: #374151; font-size: 13px; font-weight: 500;">${location.rating}</span>
            </div>
            <span style="color: ${location.isOpen ? '#059669' : '#dc2626'}; font-size: 12px; padding: 2px 8px; background: ${location.isOpen ? '#dcfce7' : '#fee2e2'}; border-radius: 12px; font-weight: 500;">
              ${location.isOpen ? 'مفتوح الآن' : 'مغلق'}
            </span>
            <span style="color: #6b7280; font-size: 12px;">📍 ${location.distance}</span>
          </div>
          
          ${location.features && location.features.length > 0 ? `
            <div style="margin: 12px 0 0 0;">
              <div style="font-size: 12px; color: #374151; font-weight: 500; margin-bottom: 6px;">المميزات المتاحة:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${location.features.slice(0, 4).map(feature => `
                  <span style="font-size: 10px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #374151; border: 1px solid #e5e7eb;">
                    ${feature}
                  </span>
                `).join('')}
                ${location.features.length > 4 ? `
                  <span style="font-size: 10px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; color: #6b7280;">
                    +${location.features.length - 4} المزيد
                  </span>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          ${location.phone ? `
            <div style="margin: 12px 0 0 0; padding: 8px; background: #f9fafb; border-radius: 6px; border-right: 3px solid ${getMarkerColor(location.type)};">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">📞</span>
                <span style="font-size: 12px; color: #374151; direction: ltr;">${location.phone}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(googleMapRef.current, marker);
  };

  const focusOnLocation = (location: Location) => {
    if (!googleMapRef.current) return;
    
    googleMapRef.current.panTo(location.coordinates);
    googleMapRef.current.setZoom(18);
    
    // العثور على العلامة المقابلة وإظهار نافذة المعلومات
    const marker = markersRef.current.find((m, index) => 
      locations[index]?.id === location.id
    );
    
    if (marker) {
      showInfoWindow(marker, location);
    }
  };

  // تعريض الدوال للاستخدام الخارجي
  useEffect(() => {
    if (googleMapRef.current) {
      (googleMapRef.current as any).focusOnLocation = focusOnLocation;
    }
  }, [mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="font-semibold text-gray-700">جارٍ تحميل الخريطة...</h3>
              <p className="text-sm text-gray-500">
                يتم تحميل خرائط جوجل للحرم الجامعي
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}