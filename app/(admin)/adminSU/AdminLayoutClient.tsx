'use client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/(admin)/services/auth/auth';
import { toast } from "@/components/toast/use-toast";
import { UserProvider } from '@/app/(admin)/context/UserContext';

import AuthRefresher from '@/components/admin/AuthRefresher';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // UPDATE: Include 'id', 'email', 'profileImage', and 'account_type' in the state type definition
  const [user, setUser] = useState<{ id?: number; username: string; email: string; profileImage?: string | null; account_type: string } | null>(null);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // FIX: Add cache busting to ensure we get fresh data after an update
        const res = await fetch(`/api/auth/session?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (!data.user) {
            // If user data is null, the session is invalid. Redirect.
            window.location.href = '/adminSU';;
            return;
          }
          
          setUser({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email || '', // Fallback to empty string if missing
            profileImage: data.user.profileImage || null,
            account_type: data.user.account_type,
          });
        } else {
          // If the response is not OK (e.g., 401 Unauthorized from our getSession check),
          // the session is invalid. Redirect to login.
          setUser(null);
          window.location.href = '/adminSU';;
        }
      } catch (error) {
        console.error('Failed to fetch session', error);
        setUser(null);
        window.location.href = '/adminSU';; // Also redirect on network error
      }
    };

    // Only run the session check if we are NOT on the login page.
    if (pathname !== '/adminSU') {
      fetchSession();
    }
  }, [pathname, router]); // Add router to dependency array

  const handleLogout = async () => {
      try {
          await logout();
      } catch (e) {
          console.error(e);
          const message = e instanceof Error ? e.message : 'Logout failed';
          toast({ variant: 'destructive', title: 'Logout failed', description: message });
      } finally {
          window.location.href = '/adminSU';;
      }
  };

  const noSidebarRoutes = ['/adminSU'];

  if (noSidebarRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-paper text-ink">
      {/* Real-time listener for session invalidation */}
      <AuthRefresher userId={user?.id} />

      {/* Backdrop for mobile */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 z-20 h-screen bg-ink/40 md:hidden"
        />
      )}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
        handleLogout={handleLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          user={user}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          handleLogout={handleLogout}
        />
        <main className="mx-auto w-full max-w-screen flex-1 overflow-y-auto p-3 text-ink sm:p-5 md:overflow-y-hidden md:px-10 md:py-8">
            {/* Pass the updated user object (with email) to the Provider */}
            <UserProvider user={user}>
                {children}
            </UserProvider>
        </main>
      </div>
    </div>
  );
}