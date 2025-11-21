import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./providers/CartProvider";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cypvasai.org'),
  title: {
    default: 'Christian Youth in Power (CYP) Vasai',
    template: '%s | CYP Vasai',
  },
  description: 'Christian Youth in Power (CYP) Vasai - Empowering young Catholics through faith, community, and service. Join us every Monday at 7 PM at Jeevan Darshan Kendra, Giriz.',
  keywords: [
    'Christian Youth',
    'Catholic Youth',
    'CYP Vasai',
    'Christian Youth in Power',
    'Youth Ministry',
    'Catholic Community',
    'Vasai Church',
    'Young Catholics',
    'Faith Formation',
    'Youth Group',
    'Christian Events',
    'Prayer Group',
  ],
  authors: [{ name: 'Christian Youth in Power Vasai' }],
  creator: 'Christian Youth in Power Vasai',
  publisher: 'Christian Youth in Power Vasai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.cypvasai.org',
    siteName: 'Christian Youth in Power Vasai',
    title: 'Christian Youth in Power (CYP) Vasai',
    description: 'Empowering young Catholics through faith, community, and service. Join us every Monday at 7 PM.',
    images: [
      {
        url: '/cyplogo_circle.png',
        width: 512,
        height: 512,
        alt: 'CYP Vasai Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Christian Youth in Power (CYP) Vasai',
    description: 'Empowering young Catholics through faith, community, and service.',
    images: ['/cyplogo_circle.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://www.cypvasai.org',
  },
  category: 'Religion & Spirituality',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/cyplogo_circle.png" />
        <link rel="apple-touch-icon" href="/cyplogo_circle.png" />
        <meta name="theme-color" content="#FB923C" />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Christian Youth in Power Vasai',
              alternateName: 'CYP Vasai',
              url: 'https://www.cypvasai.org',
              logo: 'https://www.cypvasai.org/cyplogo_circle.png',
              description: 'Catholic youth organization empowering young people through faith, community, and service in Vasai',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Vasai',
                addressRegion: 'Maharashtra',
                addressCountry: 'IN',
              },
              event: {
                '@type': 'Event',
                name: 'CYP Weekly Meeting',
                startDate: '2024-01-01T19:00',
                endDate: '2024-01-01T21:00',
                eventSchedule: {
                  '@type': 'Schedule',
                  byDay: 'Monday',
                  startTime: '19:00',
                  endTime: '21:00',
                },
                location: {
                  '@type': 'Place',
                  name: 'Jeevan Darshan Kendra',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Giriz, Vasai',
                    addressRegion: 'Maharashtra',
                    addressCountry: 'IN',
                  },
                },
              },
              sameAs: [
                // Add your social media URLs here when available
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
