'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {BookingsIcon, CarsIcon, DashboardIcon, ReviewsIcon} from "@/components/icons/AdminSidebarIcons";
import {LogoutIcon, SettingsIcon} from "@/components/icons/AdminHeaderIcons";
import AsyncButton from "@/components/AsyncButton";

import LoadingSpinner from "./LoadingSpinner";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  user: { username: string } | null;
  handleLogout: () => Promise<void>;
}

const AdminSidebar = ({ isCollapsed, user, handleLogout }: AdminSidebarProps) => {
  const pathname = usePathname();

  const navLinks = [
      { href: '/adminSU/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { href: '/adminSU/bookings', label: 'Manage Bookings', icon: <BookingsIcon /> },
      { href: '/adminSU/cars', label: 'Manage Cars', icon: <CarsIcon /> },
      { href: '/adminSU/reviews', label: 'See Reviews', icon: <ReviewsIcon /> },
      {href: '/adminSU/settings', label: 'Settings', icon: <SettingsIcon />},
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-300 text-[#333333] h-screen p-2 fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 md:w-60 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
    >
    <div className="flex flex-col h-full ">
        <div className="flex flex-col items-center my-8">
            <div className="w-36 h-36 rounded-full bg-gray-300 mb-4"></div>
            <div>
                {user ? (
                    <span className="font-bold text-2xl justify-self-center">{user.username}</span>
                ) : (
                    <LoadingSpinner />
                )}
            </div>
        </div>
      <nav className="flex-grow">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="mb-2">
                <Link
                  href={link.href}
                  className={`flex items-center p-4 rounded-xl hover:bg-[#A1E3F9]/60 ${
                    pathname === link.href ? 'bg-[#A1E3F9] text-white [&_path]:fill-white' : ''
                  }`}
                >
                  <span className="flex-shrink-0">{link.icon}</span>
                  <span className="ml-3 whitespace-nowrap">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Desktop Expanded User Menu */}
        <div className="hidden md:block border-t border-gray-200">
            <AsyncButton
                onClick={handleLogout}
                className="w-full text-left flex items-center p-4 text-sm rounded-xl hover:bg-black/30"
            >
                <LogoutIcon />
                <span className="ml-3 text-[#FF6565] font-semibold">Logout</span>
            </AsyncButton>
        </div>
    </div>
    </aside>
  );
};

export default AdminSidebar;