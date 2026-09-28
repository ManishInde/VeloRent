'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoadingState } from '@/components/ui/LoadingState';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'CUSTOMER':
        router.push('/customer');
        break;
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'FLEET_MANAGER':
        router.push('/fleet');
        break;
      case 'MAINTENANCE_STAFF':
        router.push('/maintenance');
        break;
      default:
        router.push('/login');
        break;
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingState label="Redirecting to dashboard..." />
    </div>
  );
}
