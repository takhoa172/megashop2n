import api from "./api"
import { Purchase } from "@/types"

export async function getPurchases(params?: Record<string, string>) {
  const { data } = await api.get("/purchases/", { params })
  return data
}

export async function createPurchase(purchaseData: Partial<Purchase>) {
  const { data } = await api.post("/purchases/", purchaseData)
  return data
}

export async function updatePurchase(id: string, purchaseData: Partial<Purchase>) {
  const { data } = await api.put(`/purchases/${id}/`, purchaseData)
  return data
}
