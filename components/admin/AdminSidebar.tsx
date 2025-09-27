'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// SVG Icon Components
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
);

const BookingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);

const CarsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H3"></path></svg>
);

const ReviewsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
);

interface AdminSidebarProps {
  isCollapsed: boolean;
}

const AdminSidebar = ({ isCollapsed }: AdminSidebarProps) => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/adminSU/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/adminSU/bookings', label: 'Manage Bookings', icon: <BookingsIcon /> },
    { href: '/adminSU/cars', label: 'Manage Cars', icon: <CarsIcon /> },
    { href: '/adminSU/reviews', label: 'See Reviews', icon: <ReviewsIcon /> },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white min-h-screen p-4 transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="mt-12">
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="mb-2">
                <Link
                  href={link.href}
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    pathname === link.href ? 'bg-blue-500' : ''
                  }`}
                >
                  <span className="flex-shrink-0">{link.icon}</span>
                  {!isCollapsed && <span className="ml-3">{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
