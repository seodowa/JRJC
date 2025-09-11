import NavigationBar from '@/components/NavigationBar';
import "./globals.css";
import Head from 'next/head';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationBar/>
        {children}
      </body>
    </html>
  );
}
