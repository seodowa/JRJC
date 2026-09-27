'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, Menu, Settings } from 'lucide-react';

interface AdminHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  user: { username: string } | null;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  handleLogout: () => Promise<void>;
}

const AdminHeader = ({ isCollapsed, setIsCollapsed, user, isUserMenuOpen, setIsUserMenuOpen, handleLogout }: AdminHeaderProps) => {
  return (
    <div className="md:hidden">
      <header className="flex h-14 items-center justify-between border-b border-line bg-paper px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Open navigation"
            className="-ml-2 rounded-md p-2 text-ink hover:bg-gray-200"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <span className="font-display text-xl font-semibold tracking-tight">JRJC</span>
        </div>
        <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-gray-200"
            >
              <span>{user?.username || 'Admin'}</span>
              <ChevronDown size={16} strokeWidth={1.75} />
            </button>
    
            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-line bg-surface py-1 shadow-lg">
                <Link href="/adminSU/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-gray-200">
                  <Settings size={16} strokeWidth={1.6} />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200"
                >
                  <LogOut size={16} strokeWidth={1.6} />
                  Log out
                </button>
              </div>
            )}
        </div>
      </header>
    </div>
  );
};

export default AdminHeader;
