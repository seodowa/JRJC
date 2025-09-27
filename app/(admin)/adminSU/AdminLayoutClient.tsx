'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const noSidebarRoutes = ['/adminSU'];

  if (noSidebarRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 min-h-screen">
      <AdminHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex flex-grow">
        <AdminSidebar isCollapsed={isCollapsed} />
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
}