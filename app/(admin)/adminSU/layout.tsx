import "@/app/globals.css";
import Toaster from "@/components/toast/toaster";
import AdminLayoutClient from "./AdminLayoutClient";
import { fetchCMSContent } from '@/lib/supabase/queries/cms';
import { CMSProvider } from '@/app/(client)/context/CMSContext';

export async function generateMetadata() {
  const cmsContent = await fetchCMSContent();
  const metadataMap = cmsContent.reduce((acc, item) => {
    if (item.section === 'metadata') {
      acc[item.key] = item.value || item.image_url;
    }
    return acc;
  }, {} as Record<string, string | null>);

  return {
    title: "JRJC Admin",
    description: "Admin Superuser Layout",
    icons: {
      icon: metadataMap.icon || '/images/jrjc_logo.png', // Dynamic icon with fallback
    },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cmsContent = await fetchCMSContent();

    return (
        <html lang="en">
            <body>
                <CMSProvider initialContent={cmsContent}>
                    <AdminLayoutClient>{children}</AdminLayoutClient>
                    {/* Toasts for admin route group */}
                    <Toaster />
                </CMSProvider>
            </body>
        </html>
    );
}