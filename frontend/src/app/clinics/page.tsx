'use client';

import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Map from '@/components/map/Map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Info, ArrowRight, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClinicsPage() {
  const [clinics, setClinics] = React.useState<any[]>([]);
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [selectedClinicId, setSelectedClinicId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const router = useRouter();

  const fetchClinics = async (lat?: number, lng?: number) => {
    try {
      setIsLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/clinics`;
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách phòng khám');
      
      setClinics(data.clinics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchClinics(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation denied or failed:', error.message);
          fetchClinics();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      fetchClinics();
    }
  }, []);

  const selectedClinic = clinics.find(c => c._id === selectedClinicId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar for clinic list */}
        <div className="w-full md:w-[400px] h-1/2 md:h-full bg-background border-r border-surface/50 flex flex-col overflow-hidden shrink-0 z-10 shadow-lg">
          <div className="p-4 border-b border-surface/50 bg-white">
            <h1 className="font-outfit text-2xl font-bold text-text flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Tìm phòng khám
            </h1>
            <p className="text-sm text-text-light mt-1">
              {userLocation ? 'Đã sắp xếp theo vị trí gần bạn nhất' : 'Hiển thị tất cả phòng khám'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && <div className="text-center text-sm text-text-light py-8">Đang tải...</div>}
            
            {error && (
              <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-sm flex items-start gap-2">
                <Info className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {!isLoading && clinics.map(clinic => (
              <Card 
                key={clinic._id} 
                className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${selectedClinicId === clinic._id ? 'border-primary ring-1 ring-primary' : ''}`}
                onClick={() => setSelectedClinicId(clinic._id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-outfit font-bold text-lg text-text mb-1">{clinic.name}</h3>
                  <p className="text-sm text-text-light mb-3">{clinic.address}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-primary">
                      {clinic.distance ? `${clinic.distance.toFixed(1)} km` : ''}
                    </span>
                    <Button size="sm" variant={selectedClinicId === clinic._id ? "default" : "outline"} className="gap-2 rounded-xl">
                      <Navigation className="h-4 w-4" />
                      Chỉ đường
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel: Map + Details */}
        <div className="flex-1 flex flex-col h-1/2 md:h-full relative bg-slate-50">
          <div className={`transition-all duration-300 w-full relative ${selectedClinic ? 'h-[60%]' : 'flex-1'}`}>
            <Map 
              userLocation={userLocation} 
              clinics={clinics} 
              selectedClinicId={selectedClinicId} 
            />
          </div>
          
          {selectedClinic && (
            <div className="h-[40%] bg-white border-t border-surface shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] overflow-y-auto p-6 animate-in slide-in-from-bottom-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-outfit text-2xl font-bold text-text mb-2">{selectedClinic.name}</h2>
                    <p className="text-text-light flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedClinic.address}
                    </p>
                  </div>
                  <Button onClick={() => router.push(`/doctors?clinicId=${selectedClinic._id}`)}>
                    Xem tất cả bác sĩ
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Các chuyên khoa (Nhấn để tìm bác sĩ)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedClinic.specialties?.map((spec: string) => (
                      <button
                        key={spec}
                        onClick={() => router.push(`/doctors?clinicId=${selectedClinic._id}&specialty=${encodeURIComponent(spec)}`)}
                        className="flex items-center justify-between p-3 rounded-xl border border-surface hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      >
                        <span className="font-medium text-text group-hover:text-primary transition-colors">{spec}</span>
                        <ArrowRight className="h-4 w-4 text-text-light group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
