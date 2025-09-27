'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/app/(admin)/services/auth/auth';

export default function AdminSU() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
      // proceed to redirect even if API returns non-OK, to ensure user leaves protected area
    } finally {
      router.push('/adminSU');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative
                 bg-[url('/images/BG.webp')] bg-cover bg-center bg-no-repeat
                 overflow-hidden"
    >
      <div className="font-bold text-9xl mb-10">This is Admin Page</div>
      <button
        onClick={handleLogout}
        className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Log out
      </button>
    </div>
  );
}