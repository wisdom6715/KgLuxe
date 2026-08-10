import type { Metadata } from "next";
import AdminSidebar from "./_component/SideBar";
import AuthGuard from "./_component/AuthGuard";

export const metadata: Metadata = {
  title: "KgLuxee — Luxury in every deatil",
  description: "Luxury in every deatil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col lg:flex-row min-h-screen">
        <AuthGuard>
          <AdminSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}