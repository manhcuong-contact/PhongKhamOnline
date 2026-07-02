'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix Leaflet default icon issue in Next.js
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

interface MapComponentProps {
  userLocation: { lat: number; lng: number } | null;
  clinics: any[];
  selectedClinicId: string | null;
}

// Component to handle routing
const RoutingMachine = ({ userLocation, destination }: { userLocation: any, destination: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !destination) return;

    try {
      // @ts-ignore - Leaflet Routing Machine types are sometimes incomplete
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(destination.lat, destination.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#059669', opacity: 0.8, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        }
      }).addTo(map);

      return () => {
        try { 
          if (routingControl) {
            const plan = routingControl.getPlan();
            if (plan && typeof plan.setWaypoints === 'function') {
              try { plan.setWaypoints([]); } catch (e) {}
            }
            try { map.removeControl(routingControl); } catch (e) {}
          }
        } catch (e) {
          console.warn('Leaflet routing cleanup error:', e);
        }
      };
    } catch (error) {
      console.error("OSRM Routing failed:", error);
    }
  }, [map, userLocation, destination]);

  return null;
};

// Component to handle map resizing when layout changes
const ResizeMap = ({ selectedClinicId }: { selectedClinicId: string | null }) => {
  const map = useMap();
  useEffect(() => {
    // Wait for CSS transition to finish (300ms) before invalidating size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [map, selectedClinicId]);
  return null;
};

export default function MapComponent({ userLocation, clinics, selectedClinicId }: MapComponentProps) {
  // Default to Hanoi center if no user location
  const defaultCenter = { lat: 21.0285, lng: 105.8542 };
  const center = userLocation || defaultCenter;
  
  const selectedClinic = clinics.find(c => c._id === selectedClinicId);

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={13} 
      scrollWheelZoom={true} 
      className="absolute inset-0 z-0"
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ResizeMap selectedClinicId={selectedClinicId} />
      
      {/* User Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
      )}

      {/* Clinic Markers */}
      {clinics.map(clinic => (
        <Marker key={clinic._id} position={[clinic.location.lat, clinic.location.lng]}>
          <Popup>
            <div className="font-outfit font-bold">{clinic.name}</div>
            <div className="text-xs mt-1">{clinic.address}</div>
            {clinic.distance && (
              <div className="text-xs text-primary mt-1 font-medium">
                Cách {clinic.distance.toFixed(2)} km
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Draw route if a clinic is selected */}
      {userLocation && selectedClinic && (
        <RoutingMachine 
          userLocation={userLocation} 
          destination={selectedClinic.location} 
        />
      )}
    </MapContainer>
  );
}
