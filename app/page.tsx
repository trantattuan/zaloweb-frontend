'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRLogin from '@/components/QRLogin';
import { fetchStatus } from '@/lib/api';

export default function HomePage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStatus()
      .then(({ loggedIn }) => {
        if (loggedIn) router.replace('/chat');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return <QRLogin onLoggedIn={() => router.replace('/chat')} />;
}
