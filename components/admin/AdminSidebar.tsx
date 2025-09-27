"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/adminSU/dashboard", label: "Dashboard" },
    { href: "/adminSU/bookings", label: "Manage Bookings" },
    { href: "/adminSU/cars", label: "Manage Cars" },
    { href: "/adminSU/reviews", label: "See Reviews" },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href} className="mb-2">
              <Link
                href={link.href}
                className={`block p-2 rounded hover:bg-gray-700 ${
                  pathname === link.href ? "bg-blue-500" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;