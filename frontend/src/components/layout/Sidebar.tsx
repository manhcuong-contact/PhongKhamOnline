'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Building2, Calendar } from 'lucide-react';

const adminLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Phòng khám', href: '/admin/clinics', icon: Building2 },
  { name: 'Bác sĩ', href: '/admin/doctors', icon: Users },
  { name: 'Lịch hẹn', href: '/admin/appointments', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-surface/50 bg-surface shadow-sm h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-surface/50">
        <Link href="/admin" className="font-outfit text-xl font-bold text-primary">
          Admin Panel
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-text-light hover:bg-surface/50 hover:text-text'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-surface/50">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
