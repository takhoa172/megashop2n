import api from "./api"
import { Product } from "@/types"

export async function getProducts(params?: Record<string, string>) {
  const { data } = await api.get("/products/", { params })
  return data
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function createProduct(formData: FormData): Promise<Product> {
  const { data } = await api.post("/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<Product> {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`)
}

export async function uploadImage(productId: string, file: File, isPrimary = false) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("is_primary", String(isPrimary))
  const { data } = await api.post(
    `/products/${productId}/upload-image`,
    formData
  )
  return data
}

export async function removeImage(productId: string, imageId: string) {
  await api.delete(`/products/${productId}/remove-image`, {
    data: { image_id: imageId },
  })
}
