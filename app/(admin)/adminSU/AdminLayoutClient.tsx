'use client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/(admin)/services/auth/auth';
import { toast } from "@/components/toast/use-toast";
import { UserProvider } from '@/app/(admin)/context/UserContext';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true); // Sidebar is collapsed by default on mobile
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          console.log('User data from session:', data.user);
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch session', error);
        setUser(null);
      }
    };
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
      try {
          await logout();
      } catch (e) {
          console.error(e);
          const message = e instanceof Error ? e.message : 'Logout failed';
          toast({ variant: 'destructive', title: 'Logout failed', description: message });
      } finally {
          router.push('/adminSU');
      }
  };

  const noSidebarRoutes = ['/adminSU'];

  if (noSidebarRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-gray-100 h-screen">
      {/* Backdrop for mobile */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed h-screen inset-0 bg-black opacity-50 z-20 md:hidden"
        />
      )}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
        handleLogout={handleLogout}
      />
      <div className="flex flex-col flex-1">
        <AdminHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          user={user}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          handleLogout={handleLogout}
        />
        <main className="flex-1 w-full max-w-screen mx-auto sm:p-4 md:p-8 text-gray-800 md:overflow-y-hidden sm:overflow-y-auto">
            <UserProvider user={user}>
                {children}
            </UserProvider>
        </main>
      </div>
    </div>
  );
}