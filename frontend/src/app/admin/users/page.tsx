'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-outfit text-text">Quản lý Người dùng</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-light">
            Chức năng đang được phát triển...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
