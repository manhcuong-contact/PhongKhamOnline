import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/me`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { user, isLoading };
}
