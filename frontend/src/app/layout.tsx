import type { Metadata } from 'next';
import { Outfit, Roboto } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { ChatBot } from '@/components/chat/ChatBot';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'PhongKhamOnline - Đặt lịch khám nhanh chóng',
  description: 'Hệ thống đặt lịch khám bệnh trực tuyến tiện lợi, uy tín.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${outfit.variable} ${roboto.variable} font-roboto bg-background text-text antialiased`}
      >
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
