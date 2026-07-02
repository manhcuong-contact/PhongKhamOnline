'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-outfit text-4xl font-bold text-text mb-8 text-center">Về Chúng Tôi</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-surface/50 space-y-6">
          <section>
            <h2 className="font-outfit text-2xl font-bold text-primary mb-4">Tầm nhìn và Sứ mệnh</h2>
            <p className="text-text-light leading-relaxed">
              PhongKhamOnline ra đời với sứ mệnh mang đến giải pháp y tế số toàn diện, 
              kết nối bệnh nhân và bác sĩ một cách nhanh chóng, tiện lợi và minh bạch nhất. 
              Chúng tôi tin rằng việc chăm sóc sức khỏe không nên là một trải nghiệm khó khăn hay mất nhiều thời gian chờ đợi.
            </p>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-primary mb-4">Giá trị cốt lõi</h2>
            <ul className="list-disc pl-5 space-y-2 text-text-light">
              <li><strong>Tận tâm:</strong> Luôn đặt sức khỏe và trải nghiệm của bệnh nhân lên hàng đầu.</li>
              <li><strong>Minh bạch:</strong> Thông tin về bác sĩ, phòng khám và chi phí luôn được công khai rõ ràng.</li>
              <li><strong>Tiện ích:</strong> Tiết kiệm thời gian qua hệ thống đặt lịch tự động hóa và thông minh.</li>
              <li><strong>Chất lượng:</strong> Chỉ hợp tác với các phòng khám và bác sĩ có chuyên môn cao, được xác thực rõ ràng.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-primary mb-4">Liên hệ</h2>
            <p className="text-text-light leading-relaxed">
              Nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ, đừng ngần ngại liên hệ với đội ngũ của chúng tôi:
            </p>
            <div className="mt-4 p-4 bg-primary/5 rounded-xl text-text font-medium">
              <p>Email: support@phongkhamonline.vn</p>
              <p>Hotline: 1900 xxxx</p>
              <p>Địa chỉ: Hà Nội, Việt Nam</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
