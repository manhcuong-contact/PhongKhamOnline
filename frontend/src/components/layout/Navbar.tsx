'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-outfit text-2xl font-bold text-primary tracking-tight">
            PhongKhamOnline
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/doctors" className="text-sm font-medium text-text hover:text-primary transition-colors">
            Đội ngũ Bác sĩ
          </Link>
          <Link href="/clinics" className="text-sm font-medium text-text hover:text-primary transition-colors">
            Phòng khám
          </Link>
          <Link href="/about" className="text-sm font-medium text-text hover:text-primary transition-colors">
            Về chúng tôi
          </Link>
          {user && (
            <Link href="/history" className="text-sm font-medium text-text hover:text-primary transition-colors">
              Lịch sử khám
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text hidden sm:inline">Chào, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Đăng xuất</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
          )}
          <Link href="/doctors">
            <Button>Đặt lịch ngay</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
