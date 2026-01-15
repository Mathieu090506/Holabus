// ================== IMPORTS ==================
import './globals.css';

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import SiteHeader from '@/components/layout/site-header';
import HeaderWrapper from '@/components/layout/header-wrapper';
import LuckyMoneyEffect from '@/components/effects/lucky-money-effect';

import { Toaster } from 'sonner';

// ================== VIEWPORT (Next.js 14+) ==================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

// ================== METADATA ==================
export const metadata: Metadata = {
  metadataBase: new URL('https://holabus.com.vn'),
  title: {
    default: 'Hola Bus - Vé Xe Tết 2026 | Đặt Vé Xe Khách Giá Rẻ Uy Tín',
    template: '%s | Hola Bus',
  },

  description:
    'Đặt vé xe Tết 2026 uy tín tại Hola Bus. Hàng ngàn chuyến xe đi khắp các tỉnh thành: Hải Phòng, Quảng Ngãi, Hà Nội, Nam Định. Với hàng ngàn ưu đãi.',

  keywords: [
    'vé xe tết',
    'vé xe tết 2026',
    'vé xe khách',
    'hola bus',
    'đặt vé xe',
    'xe khách bắc nam',
    'xe tết về quê',
    'vé xe sinh viên',
  ],

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
    description:
      'Hệ thống đặt vé xe khách trực tuyến hàng đầu. Đặt vé nhanh chóng, thanh toán an toàn, hỗ trợ 24/7.',
    url: 'https://holabus.com.vn',
    siteName: 'Hola Bus',
    images: [
      {
        url: 'https://holabus.com.vn/anh-co.jpg',
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
    description:
      'Ưu đãi vé xe giảm tới 50% cho sinh viên, về nhà đón Tết sum vầy.',
    images: ['https://holabus.com.vn/anh-co.jpg'],
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

  alternates: {
    canonical: 'https://holabus.com.vn',
  },

  icons: {
    icon: '/anh-co.jpg',
    shortcut: '/anh-co.jpg',
    apple: '/anh-co.jpg',
  },

  manifest: '/site.webmanifest',
};

// ================== JSON-LD ==================
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Hola Bus',
  url: 'https://holabus.com.vn',
  image: 'https://holabus.com.vn/anh-co.png',
  description:
    'Nền tảng đặt vé xe khách trực tuyến uy tín hàng đầu Việt Nam.',
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

// ================== ROOT LAYOUT ==================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased text-slate-800">

        {/* HEADER */}
        <HeaderWrapper>
          <SiteHeader />
        </HeaderWrapper>

        {/* MAIN CONTENT */}
        {children}

        {/* EFFECTS */}
        <LuckyMoneyEffect />

        {/* TOAST */}
        <Toaster position="top-center" richColors />

        {/* JSON-LD */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
