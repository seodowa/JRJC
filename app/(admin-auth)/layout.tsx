import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JRJC Auth",
  description: "Authentication for JRJC.",
};

export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
