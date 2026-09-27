'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarRange, CarFront, LayoutGrid, LogOut, Settings, Star } from 'lucide-react';
import AsyncButton from "@/components/AsyncButton";

import LoadingSpinner from "./LoadingSpinner";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  user: { username: string; profileImage?: string | null } | null;
  handleLogout: () => Promise<void>;
}

const ICON = { size: 18, strokeWidth: 1.6 };

const AdminSidebar = ({ isCollapsed, user, handleLogout }: AdminSidebarProps) => {
  const pathname = usePathname();

  const navLinks = [
      { href: '/adminSU/dashboard', label: 'Dashboard', icon: <LayoutGrid {...ICON} /> },
      { href: '/adminSU/manageBookings', label: 'Bookings', icon: <CalendarRange {...ICON} /> },
      { href: '/adminSU/manageCars', label: 'Cars', icon: <CarFront {...ICON} /> },
      { href: '/adminSU/adminReviews', label: 'Reviews', icon: <Star {...ICON} /> },
      { href: '/adminSU/settings', label: 'Settings', icon: <Settings {...ICON} /> },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-screen w-64 shrink-0 flex-col bg-ink text-paper transition-transform duration-200 ease-out md:sticky md:top-0 md:translate-x-0 md:w-60 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
    >
      <div className="flex flex-col gap-0.5 px-7 pt-7 pb-8">
        <span className="font-display text-[1.65rem] leading-none font-semibold tracking-tight">JRJC</span>
        <span className="num text-[11px] tracking-[0.12em] text-gray-400 uppercase">Admin</span>
      </div>

      <nav className="flex-grow" aria-label="Admin">
        <ul>
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 border-l-[3px] py-3 pr-6 pl-[25px] text-[15px] transition-colors ${
                    active
                      ? 'border-forest bg-white/[0.07] font-medium text-paper'
                      : 'border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-paper'
                  }`}
                >
                  <span className={active ? 'text-paper' : 'text-gray-400'}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-3 border-t border-white/10 px-7 pt-5 pb-6">
        <div className="flex items-center gap-3">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/10" />
          )}
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-gray-400">Signed in as</span>
            {user ? <span className="truncate text-sm">{user.username}</span> : <LoadingSpinner />}
          </div>
        </div>
        <AsyncButton
          onClick={handleLogout}
          className="flex items-center gap-2 self-start text-sm text-red-300 hover:text-red-200"
        >
          <LogOut size={16} strokeWidth={1.6} />
          Log out
        </AsyncButton>
      </div>
    </aside>
  );
};

export default AdminSidebar;
