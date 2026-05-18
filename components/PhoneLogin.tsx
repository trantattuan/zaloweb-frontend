'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function PhoneLogin({ onLoggedIn }: { onLoggedIn: (username: string) => void }) {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('logged_in', ({ username }: { username: string }) => onLoggedIn(username));
    return () => { socket.off('logged_in'); };
  }, [onLoggedIn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Đăng nhập thất bại');
    } catch {
      setError('Không kết nối được backend');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6">
      <div className="text-2xl font-bold text-blue-600">Zaloweb</div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 w-80"
      >
        <h2 className="text-lg font-semibold text-gray-700 text-center">Đăng nhập Zalo</h2>

        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
