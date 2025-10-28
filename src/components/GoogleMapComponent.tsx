'use client';
import type { FC, ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

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

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
  borderRadius: '0.5rem',
  overflow: 'hidden'
};

const mapOptions = {
  mapTypeId: 'hybrid',
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
    style: 2, // HORIZONTAL_BAR
    position: 1, // TOP_CENTER
  },
  zoomControlOptions: {
    position: 9 // RIGHT_BOTTOM
  }
};

export default function GoogleMapComponent({
  locations,
  center,
  onLocationSelect,
  selectedLocation,
  className = ''
}: GoogleMapComponentProps) {

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ['marker'],
  });

  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    googleMapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 300 });
  }, []);

  const onMapUnmount = useCallback(() => {
    googleMapRef.current = null;
    infoWindowRef.current = null;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (loadError) {
      console.error('Error loading map scripts:', loadError);
      toast.error('خطأ في تحميل الخريطة. يرجى التحقق من مفتاح API.');
    }
  }, [loadError]);

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
    if (!infoWindowRef.current || !googleMapRef.current) return;

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
      </div>
    </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(googleMapRef.current, marker);
  };

  useEffect(() => {
    if (isLoaded && googleMapRef.current) {
      // Clear previous markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Create new markers
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
        
        markersRef.current.push(marker);
      });
    }
  }, [isLoaded, locations, onLocationSelect]);

  useEffect(() => {
    if (selectedLocation && googleMapRef.current) {
      googleMapRef.current.panTo(selectedLocation.coordinates);
      googleMapRef.current.setZoom(18);
      
      const marker = markersRef.current.find(
        (m) => m.getTitle() === selectedLocation.name
      );
      if (marker) {
        showInfoWindow(marker, selectedLocation);
      }
    }
  }, [selectedLocation]);

  if (loadError) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-red-50 text-red-700 p-4 rounded-lg`}>
        حدث خطأ أثناء تحميل الخريطة. يرجى المحاولة مرة أخرى لاحقًا.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={16}
          options={mapOptions}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
        />
      ) : (
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
