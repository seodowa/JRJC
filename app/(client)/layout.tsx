import NavigationBar from '@/components/NavigationBar';
import "@/app/globals.css";
import Head from 'next/head';

export const metadata = {
    title: "JRJC Rent-a-Car",
    description: "Car rental service in Bukidnon",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body>
        <NavigationBar />
        {children}
      </body>
    </html>
  );
}