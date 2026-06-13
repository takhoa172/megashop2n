import api from "./api"
import { BlogPost } from "@/types"

export async function getBlogPosts(params?: Record<string, string>) {
  const { data } = await api.get("/blogs/", { params })
  return data
}

export async function getBlogPost(slug: string) {
  const { data } = await api.get(`/blogs/${slug}`)
  return data
}

export async function createBlogPost(formData: FormData) {
  const { data } = await api.post("/blogs/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateBlogPost(id: string, formData: FormData) {
  const { data } = await api.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateBlogPostVisibility(id: string, is_visible: boolean) {
  const { data } = await api.patch(`/blogs/${id}`, { is_visible })
  return data
}

export async function deleteBlogPost(id: string) {
  await api.delete(`/blogs/${id}`)
}

export async function getBlogCategories() {
  const { data } = await api.get("/blogs/categories")
  return data.results || data
}

export async function createBlogCategory(name: string) {
  const { data } = await api.post("/blogs/categories", { name })
  return data
}

export async function uploadBlogImage(slug: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const { data } = await api.post(`/blogs/${slug}/upload-image`, formData)
  return data
}
