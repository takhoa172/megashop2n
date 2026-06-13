import api from "./api"
import { Category } from "@/types"

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories/")
  return data.results || data
}

export async function createCategory(
  name: string,
  description?: string
): Promise<Category> {
  const { data } = await api.post("/categories/", { name, description })
  return data
}

export async function updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
  const { data } = await api.patch(`/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`)
}
