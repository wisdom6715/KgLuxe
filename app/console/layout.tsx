import type { Metadata } from "next";
import AdminSidebar from "./_component/SideBar";

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
        <body className=" antialiased flex flex-col lg:flex-row min-h-screen">
          <AdminSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </body>
    </html>
  );
}
