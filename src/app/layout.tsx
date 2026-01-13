// ... imports
import SiteHeader from '@/components/layout/site-header'; // Import file mới
import HeaderWrapper from '@/components/layout/header-wrapper';
import LuckyMoneyEffect from '@/components/effects/lucky-money-effect';
import "./globals.css";

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Hola Bus - Vé Xe Tết 2026 | Đặt Vé Xe Khách Giá Rẻ Uy Tín',
    template: '%s | Hola Bus',
  },
  description: 'Đặt vé xe Tết 2026 giá rẻ, uy tín tại Hola Bus. Hàng ngàn chuyến xe đi khắp các tỉnh thành: Đà Nẵng, Quảng Ngãi, Hà Nội, Sài Gòn. Ưu đãi 50% cho sinh viên.',
  keywords: ['vé xe tết', 'vé xe khách', 'hola bus', 'đặt vé xe', 'xe khách bắc nam', 'vé xe tết 2026', 'xe tết về quê'],
  authors: [{ name: 'Hola Bus Team' }],
  creator: 'Hola Bus',
  publisher: 'Hola Bus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Hola Bus - Vé Xe Tết 2026 | Về Nhà Đón Tết Sum Vầy',
    description: 'Hệ thống đặt vé xe khách trực tuyến hàng đầu. Đặt vé nhanh chóng, thanh toán an toàn, hỗ trợ 24/7.',
    url: 'https://holabus.vn',
    siteName: 'Hola Bus',
    images: [
      {
        url: '/anh-co.jpg',
        width: 1200,
        height: 630,
        alt: 'Hola Bus - Vé Xe Tết 2026',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hola Bus - Vé Xe Tết 2026',
    description: 'Ưu đãi vé xe giảm tới 50% cho sinh viên, về nhà đón Tết sum vầy.',
    images: ['/anh-co.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
  icons: {
    icon: '/anh-co.jpg?v=2',
    shortcut: '/anh-co.jpg?v=2',
    apple: '/anh-co.jpg?v=2',
  },
  manifest: '/site.webmanifest',
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Hola Bus',
  image: 'https://holabus.vn/tet-atmosphere.png',
  description: 'Nền tảng đặt vé xe khách trực tuyến uy tín hàng đầu Việt Nam.',
  url: 'https://holabus.vn',
  telephone: '+84123456789',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Đường Xe Khách',
    addressLocality: 'Hồ Chí Minh',
    postalCode: '700000',
    addressCountry: 'VN',
  },
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
  ],
};
import { Toaster } from 'sonner';

// ... (existing imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased text-slate-800">

        {/* Đặt Header ở đây */}
        <HeaderWrapper>
          <SiteHeader />
        </HeaderWrapper>

        {children}
        <LuckyMoneyEffect />
        <Toaster position="top-center" richColors />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}