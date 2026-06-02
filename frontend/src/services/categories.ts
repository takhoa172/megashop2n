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
