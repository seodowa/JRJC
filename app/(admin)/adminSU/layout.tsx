import "@/app/globals.css";

export const metadata = {
    title: "JRJC Admin",
    description: "Admin Superuser Layout",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
     <html lang="en">
        <body>
            <main>
            {children}
            </main>
        </body>
    </html>
    );
}