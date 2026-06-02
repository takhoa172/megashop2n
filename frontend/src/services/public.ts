import api from "./api"

export async function getPublicProducts(params?: Record<string, string>) {
  const { data } = await api.get("/products/", { params })
  return data
}

export async function getPublicProduct(id: string) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function getPublicCategories() {
  const { data } = await api.get("/categories/")
  return data.results || data
}

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

export async function getPublicBlogs() {
  const { data } = await api.get("/blogs/")
  return data.results || data
}

export async function getPublicBlog(slug: string) {
  const { data } = await api.get(`/blogs/${slug}`)
  return data
}

export async function getPublicSliders() {
  const { data } = await api.get("/sliders/")
  return data.results || data
}

export async function getSiteSettings() {
  const { data } = await api.get("/settings/site")
  return data
}

export async function getPublicFooter() {
  const { data } = await api.get("/settings/footer")
  return data
}

export async function getActiveNotification() {
  const { data } = await api.get("/notifications/active")
  return data
}
