'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Search, CheckCircle, XCircle } from 'lucide-react';

const STATUS_BADGE: Record<string, any> = {
  pending:   { label: 'Chờ xác nhận', type: 'warning' },
  confirmed: { label: 'Đang khám',    type: 'default' },
  completed: { label: 'Đã khám',       type: 'available' },
  cancelled: { label: 'Đã hủy',        type: 'booked' },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const url = `${(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api')}/admin/appointments`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { fetchAppointments(); }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setUpdating(appointmentId);
    try {
      await fetch(`${(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api')}/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      setAppointments(prev =>
        prev.map(a => a._id === appointmentId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const historyAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  const renderTable = (data: any[], type: 'pending' | 'confirmed' | 'history') => {
    if (data.length === 0) {
      return <div className="text-center py-10 text-text-light">Không có lịch hẹn nào.</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {['Bệnh nhân', 'Bác sĩ', 'Phòng khám', 'Thời gian', 'Triệu chứng', 'Trạng thái', 'Hành động'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-text-light text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map(app => {
              const dt = new Date(app.datetime);
              const status = STATUS_BADGE[app.status] || { label: app.status, type: 'warning' };
              return (
                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">{app.userId?.name}</div>
                    <div className="text-text-light text-xs">{app.userId?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">{app.doctorId?.name}</div>
                    <div className="text-primary text-xs">{app.doctorId?.specialty}</div>
                  </td>
                  <td className="px-4 py-3 text-text-light">{app.clinicId?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text">
                    <div>{dt.toLocaleDateString('vi-VN')}</div>
                    <div className="text-text-light text-xs">{dt.getHours().toString().padStart(2,'0')}:00</div>
                  </td>
                  <td className="px-4 py-3 max-w-[150px]">
                    <p className="text-text-light text-xs truncate" title={app.symptoms}>{app.symptoms}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.type as any}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {type === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(app._id, 'confirmed')} disabled={updating === app._id} className="h-8 bg-primary hover:bg-primary-hover text-white">Xác nhận</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(app._id, 'cancelled')} disabled={updating === app._id} className="h-8">Hủy</Button>
                        </>
                      )}
                      {type === 'confirmed' && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(app._id, 'completed')} disabled={updating === app._id} className="h-8 bg-blue-600 hover:bg-blue-700 text-white">Hoàn thành</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(app._id, 'cancelled')} disabled={updating === app._id} className="h-8">Hủy</Button>
                        </>
                      )}
                      {type === 'history' && (
                        <span className="text-xs text-text-light italic">Không có</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="text-center py-20 text-text-light">Đang tải danh sách...</div>
      ) : (
        <>
          <Card>
            <CardHeader className="border-b border-surface/50 pb-4">
              <CardTitle className="text-lg text-text flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Lịch hẹn chờ xác nhận
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(pendingAppointments, 'pending')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-surface/50 pb-4">
              <CardTitle className="text-lg text-text flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                Đang khám (Đã xác nhận)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(confirmedAppointments, 'confirmed')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-surface/50 pb-4">
              <CardTitle className="text-lg text-text flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-slate-400" />
                Lịch sử (Đã hoàn thành / Đã hủy)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(historyAppointments, 'history')}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
