import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/provider";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kgluxee.com'),
  title: {
    default: 'KgLuxee — Editorial Fashion',
    template: '%s | KgLuxee'
  },
  description:
    'Luxury in every detail. Shop KgLuxee\'s curated edit of contemporary fashion, crafted for those who dress with intention.',
  keywords: [
    'Luxury fashion',
    'Editorial fashion',
    'KgLuxee',
    'Designer clothing',
    'Luxury e-commerce',
    'Fashion boutique',
    'Contemporary fashion',
    'Luxury accessories',
    'Online fashion store',
    'Premium apparel'
  ],
  openGraph: {
    title: 'KgLuxee — Editorial Fashion',
    description:
      'Luxury in every detail. Shop KgLuxee\'s curated edit of contemporary fashion, crafted for those who dress with intention.',
    type: 'website',
    url: 'https://www.kgluxee.com',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KgLuxee — Editorial Fashion',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KgLuxee — Editorial Fashion',
    description:
      'Luxury in every detail. Shop KgLuxee\'s curated edit of contemporary fashion.',
    images: ['/logo.png'],
  }
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