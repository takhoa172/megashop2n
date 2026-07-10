import type { MetadataRoute } from "next"

export const dynamic = "force-dynamic"

const API_URL = process.env.API_SERVER_URL || "http://django:8000"

async function fetchAll<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results || data
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vietshop.com"
  const today = new Date()

  const [products, blogs] = await Promise.all([
    fetchAll<{ id: number; updated_at: string }>("/api/products/?page_size=1000&is_visible=true"),
    fetchAll<{ slug: string; updated_at: string }>("/api/blogs/?page_size=1000&status=published"),
  ])

  return [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    {
      url: `${baseUrl}/blogs`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]
}
