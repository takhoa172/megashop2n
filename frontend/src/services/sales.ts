import api from "./api"
import { Sale } from "@/types"

export async function getSales(params?: Record<string, string>) {
  const { data } = await api.get("/sales/", { params })
  return data
}

export async function createSale(saleData: Partial<Sale>) {
  const { data } = await api.post("/sales/", saleData)
  return data
}

export async function updateSale(id: string, saleData: Partial<Sale>) {
  const { data } = await api.put(`/sales/${id}/`, saleData)
  return data
}
