'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarRoutes = ['/adminSU'];

  if (noSidebarRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}