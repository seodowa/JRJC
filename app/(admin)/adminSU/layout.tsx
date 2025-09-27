import "@/app/globals.css";

export const metadata = {
    title: "JRJC Admin",
    description: "Admin Superuser Layout",
}

import Toaster from "@/components/ui/toaster";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
     <html lang="en">
        <body>
            <main>
            {children}
            </main>
            {/* Toasts for admin route group */}
            <Toaster />
        </body>
    </html>
    );
}