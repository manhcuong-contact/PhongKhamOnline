'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          throw new Error(data.errors.map((err: any) => err.message).join(', '));
        }
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-primary text-3xl mb-2">Đăng Ký</CardTitle>
          <CardDescription>
            Tạo tài khoản để đặt lịch khám dễ dàng hơn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-sm border border-rose-200">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Họ và tên</label>
              <Input 
                name="name" 
                type="text" 
                placeholder="Nguyễn Văn A" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Email</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Mật khẩu</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Xác nhận mật khẩu</label>
              <Input 
                name="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Đăng ký
            </Button>
            <p className="text-sm text-text-light text-center">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
