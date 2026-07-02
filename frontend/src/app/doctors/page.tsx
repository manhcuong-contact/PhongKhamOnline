'use client';

import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { BookingModal } from '@/components/booking/BookingModal';
import { Search, Loader2, Building2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const COMMON_SYMPTOMS = [
  "đau đầu", "chóng mặt", "buồn nôn", "mệt mỏi", "sốt", "khó thở", "đau ngực",
  "chấn thương", "gãy xương", "đau cơ", "bong gân", "trật khớp", "vết thương hở",
  "biếng ăn", "quấy khóc", "ho ở trẻ", "nôn trớ", "phát ban ở trẻ", "sốt cao ở trẻ",
  "thai kỳ", "rong kinh", "đau bụng dưới", "khám thai", "viêm nhiễm phụ khoa",
  "nổi mụn", "mẩn ngứa", "phát ban", "viêm da", "rụng tóc", "dị ứng da"
];

function DoctorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [symptoms, setSymptoms] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestedSpecialties, setSuggestedSpecialties] = React.useState<string[]>([]);
  
  const initialSpecialty = searchParams.get('specialty') || '';
  const [selectedSpecialty, setSelectedSpecialty] = React.useState(initialSpecialty);
  
  const initialClinicId = searchParams.get('clinicId') || '';
  const [clinicId, setClinicId] = React.useState(initialClinicId);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null);

  const fetchDoctors = async (spec?: string, cId?: string) => {
    try {
      setIsLoading(true);
      let url = `${(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api')}/doctors?`;
      if (spec) url += `specialty=${encodeURIComponent(spec)}&`;
      if (cId) url += `clinicId=${encodeURIComponent(cId)}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDoctors(selectedSpecialty, clinicId);
  }, [selectedSpecialty, clinicId]);

  const clearClinicFilter = () => {
    setClinicId('');
    router.replace('/doctors' + (selectedSpecialty ? `?specialty=${encodeURIComponent(selectedSpecialty)}` : ''));
  };

  const handleSuggest = async () => {
    if (!symptoms.trim()) return;
    try {
      setIsSuggesting(true);
      const res = await fetch(`${(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api')}/doctors/suggest?symptoms=${encodeURIComponent(symptoms)}`);
      const data = await res.json();
      if (data.specialties && data.specialties.length > 0) {
        setSuggestedSpecialties(data.specialties);
        setSelectedSpecialty(data.specialties[0]); // Auto select first suggestion
      } else {
        alert('Không tìm thấy chuyên khoa phù hợp với triệu chứng này.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    symptoms.trim() && s.toLowerCase().includes(symptoms.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h1 className="font-outfit text-3xl font-bold text-text mb-4">Đội ngũ Bác sĩ</h1>
          <p className="text-text-light mb-6">
            Nhập triệu chứng của bạn để chúng tôi gợi ý bác sĩ chuyên khoa phù hợp nhất.
          </p>
          
          <div className="flex gap-2">
            <Select 
              value={selectedSpecialty} 
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-[180px] shrink-0"
            >
              <option value="">Tất cả chuyên khoa</option>
              <option value="Nội khoa">Nội khoa</option>
              <option value="Ngoại khoa">Ngoại khoa</option>
              <option value="Nhi khoa">Nhi khoa</option>
              <option value="Sản phụ khoa">Sản phụ khoa</option>
              <option value="Da liễu">Da liễu</option>
            </Select>

            <div className="relative flex-1">
              <Input 
                placeholder="VD: tôi bị đau đầu, ho và sốt..." 
                value={symptoms}
                onChange={e => { setSymptoms(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={e => e.key === 'Enter' && handleSuggest()}
                className="w-full"
              />
              {showSuggestions && filteredSymptoms.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-surface rounded-xl shadow-lg max-h-60 overflow-y-auto text-left">
                  {filteredSymptoms.map(s => (
                    <div 
                      key={s} 
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-text transition-colors"
                      onClick={() => {
                        setSymptoms(s);
                        setShowSuggestions(false);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSuggest} disabled={isSuggesting}>
              {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Tìm kiếm
            </Button>
          </div>

          {clinicId && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center items-center">
              <span className="text-sm text-text-light py-1 flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Đang lọc theo phòng khám cụ thể
              </span>
              <button 
                onClick={clearClinicFilter}
                className="px-3 py-1 text-sm text-rose-500 hover:text-rose-600 font-medium underline"
              >
                Xóa lọc phòng khám
              </button>
            </div>
          )}

          {suggestedSpecialties.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-text-light py-1">Gợi ý chuyên khoa:</span>
              {suggestedSpecialties.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSpecialty === spec 
                      ? 'bg-primary text-white' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {spec}
                </button>
              ))}
              <button 
                onClick={() => { setSelectedSpecialty(''); setSuggestedSpecialties([]); setSymptoms(''); }}
                className="px-3 py-1 text-sm text-text-light hover:text-text underline"
              >
                Xóa lọc
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-text-light">Đang tải danh sách bác sĩ...</div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-text-light">Không tìm thấy bác sĩ phù hợp.</div>
          ) : (
            doctors.map(doctor => (
              <Card key={doctor._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-outfit font-bold text-xl text-text">{doctor.name}</h3>
                      <p className="text-primary font-medium text-sm mt-1">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-text-light">
                      <span className="font-medium text-text">Phòng khám:</span> {doctor.clinicId?.name || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => setSelectedDoctor(doctor)}>
                    Đặt lịch hẹn
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <BookingModal 
        isOpen={!!selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
        doctor={selectedDoctor} 
      />
    </>
  );
}

export default function DoctorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <React.Suspense fallback={<div className="flex-1 flex justify-center items-center">Đang tải trang...</div>}>
        <DoctorsContent />
      </React.Suspense>
      <Footer />
    </div>
  );
}
