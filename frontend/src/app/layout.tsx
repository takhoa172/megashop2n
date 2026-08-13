import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "./providers"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vietshop.com"
const siteName = "VIETSHOP"
const defaultTitle = `${siteName} - Mua bán đồ cũ`
const defaultDescription = "Chợ đồ cũ online - Mua bán đồ secondhand chất lượng tại VIETSHOP"

export const metadata: Metadata = {
  title: { default: defaultTitle, template: `%s | ${siteName}` },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "1900 1234 5678",
      contactType: "customer service",
      availableLanguage: ["Vietnamese"],
    },
  ],
  sameAs: [
    "https://facebook.com/vietshop",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        <link rel="canonical" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
