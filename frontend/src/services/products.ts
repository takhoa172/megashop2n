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

export async function updateProductVisibility(id: string, is_visible: boolean) {
  const { data } = await api.patch(`/products/${id}`, { is_visible })
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

export async function addProductImageUrl(productId: string, imageUrl: string, isPrimary = true) {
  const { data } = await api.post(`/products/${productId}/add-image-url`, { image_url: imageUrl, is_primary: isPrimary })
  return data
}

export async function removeImage(productId: string, imageId: string) {
  await api.post(`/products/${productId}/remove-image`, {
    image_id: imageId,
  })
}

export async function replaceImage(productId: string, imageId: string, file: File) {
  const formData = new FormData()
  formData.append("image_id", imageId)
  formData.append("file", file)
  const { data } = await api.post(`/products/${productId}/replace-image`, formData)
  return data
}

export async function setPrimaryImage(productId: string, imageId: string) {
  const { data } = await api.post(`/products/${productId}/set-primary-image`, {
    image_id: imageId,
  })
  return data
}
