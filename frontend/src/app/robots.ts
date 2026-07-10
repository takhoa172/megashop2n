import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vietshop.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/account", "/account/", "/cart", "/checkout", "/order/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
