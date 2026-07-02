'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminClinicsPage() {
  const [clinics, setClinics] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clinics`)
      .then(r => r.json())
      .then(data => setClinics(data.clinics || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-outfit text-text">Quản lý Phòng khám</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng khám</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-text-light">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-light uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Tên phòng khám</th>
                    <th className="px-6 py-3">Địa chỉ</th>
                    <th className="px-6 py-3">Chuyên khoa</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map(clinic => (
                    <tr key={clinic._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-text">{clinic.name}</td>
                      <td className="px-6 py-4 text-text-light">{clinic.address}</td>
                      <td className="px-6 py-4 text-text-light">
                        {clinic.specialties?.join(', ')}
                      </td>
                    </tr>
                  ))}
                  {clinics.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-text-light">
                        Chưa có phòng khám nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
