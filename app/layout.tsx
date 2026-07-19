import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/provider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "KgLuxee — Editorial Fashion",
  description: "Elevating your everyday essentials through editorial minimalism and superior craftsmanship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (    
    <html lang="en">
      <Providers>
        <body className="bg-white text-dark-brown font-sans antialiased overflow-x-hidden">
          {children}
          <Script src="https://checkout.flutterwave.com/v3.js" strategy="afterInteractive" />
        </body>
      </Providers>
    </html>
  );
}
