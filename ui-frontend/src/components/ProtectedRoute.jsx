'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (roles.length > 0 && !roles.includes(user?.role)) {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, user, roles, router]);

  // Show loading spinner while auth state is being determined
  if (loading) return <Loading />;

  // Not authenticated — show nothing, redirect is in progress
  if (!isAuthenticated) return <Loading />;

  // Wrong role — show nothing, redirect is in progress
  if (roles.length > 0 && !roles.includes(user?.role)) return <Loading />;

  // Authorized — render children
  return children;
}
