'use client';

import Link from 'next/link';
import HamburgerIcon from "@/components/icons/HamburgerIcon";
import {ChevronDownIcon, LogoutIcon, SettingsIcon} from "@/components/icons/AdminHeaderIcons";

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
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-700 focus:outline-none"
        >
          <HamburgerIcon />
        </button>
        <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="flex items-center text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              <span>{user?.username || 'Admin'}</span>
              <ChevronDownIcon />
            </button>
    
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link href="/adminSU/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <SettingsIcon />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            )}
        </div>
      </header>
    </div>
  );
};

export default AdminHeader;
