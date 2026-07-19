import type { Metadata } from "next";
import AdminSidebar from "./_component/SideBar";

export const metadata: Metadata = {
  title: "KgLuxe — Editorial Fashion",
  description: "Elevating your everyday essentials through editorial minimalism and superior craftsmanship.",
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
