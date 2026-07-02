'use client';

import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Stethoscope, AlertCircle } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; type: string }> = {
  pending:   { label: 'Chờ xác nhận', type: 'warning' },
  confirmed: { label: 'Đang khám',    type: 'default' },
  completed: { label: 'Đã khám',       type: 'available' },
  cancelled: { label: 'Đã hủy',        type: 'booked' },
};

export default function HistoryPage() {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments`, { credentials: 'include' });
      if (res.status === 401) {
        setError('Vui lòng đăng nhập để xem lịch sử khám');
        return;
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      setError('Không thể tải lịch sử khám');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch khám này không?')) return;
    
    setCancellingId(appointmentId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Cập nhật trạng thái trong UI (không cần fetch lại)
      setAppointments(prev =>
        prev.map(a => a._id === appointmentId ? { ...a, status: 'cancelled' } : a)
      );
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-outfit text-3xl font-bold text-text mb-6 flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          Lịch sử khám bệnh
        </h1>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20 text-text-light">Đang tải lịch sử...</div>
        )}

        {!isLoading && appointments.length === 0 && !error && (
          <div className="text-center py-20 text-text-light">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Bạn chưa có lịch khám nào.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/doctors'}>
              Đặt lịch ngay
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {appointments.map(appointment => {
            const dt = new Date(appointment.datetime);
            const dateStr = dt.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = `${dt.getHours().toString().padStart(2, '0')}:00 - ${(dt.getHours() + 1).toString().padStart(2, '0')}:00`;
            const status = STATUS_LABELS[appointment.status] || { label: appointment.status, type: 'warning' };
            
            // Tính giờ còn lại để kiểm tra khả năng hủy
            const hoursLeft = (dt.getTime() - Date.now()) / (1000 * 60 * 60);
            const canCancel = (appointment.status === 'pending' || appointment.status === 'confirmed') && hoursLeft > 24;

            return (
              <Card key={appointment._id} className="overflow-hidden">
                <div className={`h-1 ${appointment.status === 'cancelled' ? 'bg-rose-400' : appointment.status === 'completed' ? 'bg-primary' : 'bg-yellow-400'}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-outfit font-bold text-xl text-text">
                        {appointment.doctorId?.name || 'Bác sĩ'}
                      </p>
                      <p className="text-primary text-sm font-medium">{appointment.doctorId?.specialty}</p>
                    </div>
                    <Badge variant={status.type as any}>{status.label}</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-text-light mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>{timeStr}</span>
                    </div>
                    {appointment.clinicId?.name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>{appointment.clinicId.name}</span>
                      </div>
                    )}
                  </div>

                  {appointment.symptoms && (
                    <p className="text-sm bg-surface rounded-xl px-3 py-2 mb-4 text-text-light italic">
                      "{appointment.symptoms}"
                    </p>
                  )}

                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-500 border-rose-200 hover:bg-rose-50"
                      isLoading={cancellingId === appointment._id}
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Hủy lịch khám
                    </Button>
                  )}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && hoursLeft <= 24 && hoursLeft > 0 && (
                    <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Không thể hủy vì còn dưới 24 giờ trước giờ khám
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
