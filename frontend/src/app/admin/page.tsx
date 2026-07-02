'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarDays, Hospital, Stethoscope, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => (
  <Card>
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-text-light text-sm">{label}</p>
        <p className="font-outfit text-3xl font-bold text-text">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const STATUS_LABELS: Record<string, string> = {
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Đã khám',
  cancelled: 'Đã hủy',
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-400',
  confirmed: 'bg-blue-400',
  completed: 'bg-emerald-500',
  cancelled: 'bg-rose-400',
};

export default function AdminDashboard() {
  const [data, setData] = React.useState<{ stats: any; breakdown: any } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="text-center py-20 text-text-light">Đang tải dữ liệu...</div>;

  const totalAppointments = data ? Object.values(data.breakdown as Record<string, number>).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Người dùng" value={data?.stats.totalUsers ?? 0} icon={Users} color="bg-blue-500" />
        <StatCard label="Lịch hẹn hôm nay" value={data?.stats.todayAppointments ?? 0} icon={CalendarDays} color="bg-primary" />
        <StatCard label="Phòng khám" value={data?.stats.totalClinics ?? 0} icon={Hospital} color="bg-purple-500" />
        <StatCard label="Bác sĩ" value={data?.stats.totalDoctors ?? 0} icon={Stethoscope} color="bg-orange-500" />
      </div>

      {/* Appointment breakdown */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-outfit font-bold text-lg text-text">Tổng quan lịch hẹn</h2>
            <span className="ml-auto text-text-light text-sm">{totalAppointments} tổng cộng</span>
          </div>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = (data?.breakdown?.[status] ?? 0) as number;
              const pct = totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text font-medium">{label}</span>
                    <span className="text-text-light">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${STATUS_COLORS[status]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
