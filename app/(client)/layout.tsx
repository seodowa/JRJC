import NavigationBar from '@/components/NavigationBar';
import "@/app/globals.css";
// Removed Head import as it's not standard in App Router for metadata
import { fetchCMSContent } from '@/lib/supabase/queries/cms';
import { CMSProvider } from './context/CMSContext';

export async function generateMetadata() {
  const cmsContent = await fetchCMSContent();
  const metadataMap = cmsContent.reduce((acc, item) => {
    if (item.section === 'metadata') {
      acc[item.key] = item.value || item.image_url;
    }
    return acc;
  }, {} as Record<string, string | null>);

  return {
    title: metadataMap.site_title || "JRJC Rent-a-Car",
    description: metadataMap.site_description || "Car rental service in Bukidnon",
    // You can add more metadata fields here if defined in CMS
    // For example, an icon or other meta tags
    icons: {
      icon: metadataMap.icon || '/images/jrjc_logo.png', // assuming 'icon' key for favicon
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cmsContent = await fetchCMSContent(); // Fetch all CMS content once

  return (
    <html lang="en" className="h-full w-full scroll-smooth">
      <body>
        <CMSProvider initialContent={cmsContent}>
          <NavigationBar />
          {children}
        </CMSProvider>
      </body>
    </html>
  );
}