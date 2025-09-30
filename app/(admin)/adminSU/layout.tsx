import "@/app/globals.css";
import Toaster from "@/components/toast/toaster";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
    title: "JRJC Admin",
    description: "Admin Superuser Layout",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AdminLayoutClient>{children}</AdminLayoutClient>
                {/* Toasts for admin route group */}
                <Toaster />
            </body>
        </html>
    );
}