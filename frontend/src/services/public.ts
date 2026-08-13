// Re-exports with backward-compatible signatures
import { getProducts, getProduct } from "./products"
import { getCategories } from "./categories"
import { getBlogPosts, getBlogPost } from "./blogs"
import { getSliders } from "./sliders"
import { getFooter } from "./settings"
import { getActiveNotification as getActiveNotif } from "./notifications"

export const getPublicProducts = (params?: Record<string, string>) => getProducts(params)
export const getPublicProduct = (id: string) => getProduct(id)
export const getPublicCategories = () => getCategories()
export const getPublicBlogs = async (params?: Record<string, string>) => {
  const data = await getBlogPosts(params)
  return data.results || data
}
export const getPublicBlog = (slug: string) => getBlogPost(slug)
export const getPublicSliders = () => getSliders()
export const getPublicFooter = () => getFooter()
export const getActiveNotification = () => getActiveNotif()

// Unique public-only endpoints
import api from "./api"

export async function getSuggested() {
  const { data } = await api.get("/products/suggested")
  return data
}

export async function getMostViewed() {
  const { data } = await api.get("/products/most-viewed")
  return data
}

export async function getPriceZero() {
  const { data } = await api.get("/products/price-zero")
  return data
}

export async function getSiteSettings() {
  const { data } = await api.get("/settings/site")
  return data
}
