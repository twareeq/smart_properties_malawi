'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically update map center when coordinates change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapPreviewProps {
  latitude: number | null;
  longitude: number | null;
  height?: string;
  zoom?: number;
}

export default function MapPreview({ latitude, longitude, height = '300px', zoom = 15 }: MapPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height }} className="bg-gray-100 rounded-lg animate-pulse" />;
  if (latitude == null || longitude == null) return null;

  const position: [number, number] = [latitude, longitude];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200 z-0">
      {/* @ts-ignore */}
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={position} />
        {/* @ts-ignore */}
        <Marker position={position} icon={customIcon}>
          {/* @ts-ignore */}
          <Popup>Property Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
