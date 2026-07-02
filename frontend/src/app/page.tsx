import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-emerald-50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-outfit font-bold text-slate-900 mb-6">
              Chăm sóc sức khỏe toàn diện <br className="hidden sm:block" />
              <span className="text-emerald-600">trong tầm tay bạn</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mb-10">
              Đặt lịch khám trực tuyến nhanh chóng, tiện lợi tại hệ thống phòng khám hàng đầu. 
              Lựa chọn bác sĩ, chọn giờ phù hợp và an tâm với dịch vụ chăm sóc tận tâm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/doctors">
                <Button size="lg" className="w-full sm:w-auto font-medium text-lg px-8 py-6 rounded-full group">
                  Đặt lịch khám ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/clinics">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium text-lg px-8 py-6 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                  Xem hệ thống phòng khám
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-outfit font-bold text-center text-slate-900 mb-12">Tại sao chọn chúng tôi?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Chủ động thời gian</h3>
                <p className="text-slate-600">
                  Không còn phải xếp hàng chờ đợi. Bạn hoàn toàn chủ động chọn giờ khám phù hợp với lịch trình của mình.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Bác sĩ chuyên môn cao</h3>
                <p className="text-slate-600">
                  Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm từ các bệnh viện lớn, sẵn sàng tư vấn và điều trị tốt nhất cho bạn.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Mạng lưới rộng khắp</h3>
                <p className="text-slate-600">
                  Hệ thống nhiều phòng khám với cơ sở vật chất hiện đại, dễ dàng tìm kiếm địa điểm gần bạn nhất.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-outfit font-bold mb-6">Sẵn sàng để được chăm sóc tốt nhất?</h2>
            <p className="text-slate-300 mb-10 text-lg">
              Tạo tài khoản miễn phí và bắt đầu hành trình chăm sóc sức khỏe của bạn cùng PhongKhamOnline ngay hôm nay.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-lg px-8 py-6 rounded-full">
                Tạo tài khoản ngay
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
