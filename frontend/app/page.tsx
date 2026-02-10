'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthPage from '@/components/AuthPage';
import { useAuth } from '@/lib/authContext';
import { LoadingScreen } from '@/components/UIComponents';
import MVP1ApiClient from '@/lib/graphqlApiClient';

export default function Home() {
  const { isAuthenticated, token, setToken } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      MVP1ApiClient.setAuthToken(storedToken);
      setToken(storedToken);
      router.push('/game');
    } else {
      setIsChecking(false);
    }
  }, [router, setToken]);

  const handleAuthSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(user));
    MVP1ApiClient.setAuthToken(newToken);
    router.push('/game');
  };

  if (isChecking || isAuthenticated) {
    return <LoadingScreen message="Đang chuyển hướng đến Đất Việt..." />;
  }

  return (
    <AuthPage onAuthSuccess={handleAuthSuccess} />
  );
}