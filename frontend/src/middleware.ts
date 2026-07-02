import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ bảo vệ các route dưới /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken');
    // Nếu không có token -> redirect login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Lưu ý: Kiểm tra role 'admin' đầy đủ nên thực hiện ở server component
    // vì middleware Edge Runtime không thể verify JWT secret an toàn
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
