import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-surface/50 bg-background py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-outfit text-xl font-bold text-primary mb-4">PhongKhamOnline</h3>
          <p className="text-sm text-text-light max-w-xs">
            Hệ thống đặt lịch khám bệnh trực tuyến tiện lợi, an toàn và nhanh chóng.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-text mb-4">Liên kết</h4>
          <ul className="space-y-2 text-sm text-text-light">
            <li><Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
            <li><Link href="/doctors" className="hover:text-primary transition-colors">Bác sĩ</Link></li>
            <li><Link href="/clinics" className="hover:text-primary transition-colors">Phòng khám</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-text mb-4">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-text-light">
            <li>Hotline: 1900 xxxx</li>
            <li>Email: support@phongkhamonline.vn</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-8 pt-8 border-t border-surface/50 text-center text-sm text-text-light">
        © {new Date().getFullYear()} PhongKhamOnline. All rights reserved.
      </div>
    </footer>
  );
}
