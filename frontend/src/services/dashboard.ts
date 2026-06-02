import api from "./api"
import {
  DashboardSummary,
  ChartDataPoint,
  InventoryChartItem,
  TopCategory,
} from "@/types"

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/dashboard/summary")
  return data
}

export async function getRevenue(): Promise<ChartDataPoint[]> {
  const { data } = await api.get("/dashboard/revenue")
  return data
}

export async function getProfit(): Promise<ChartDataPoint[]> {
  const { data } = await api.get("/dashboard/profit")
  return data
}

export async function getInventory(): Promise<InventoryChartItem[]> {
  const { data } = await api.get("/dashboard/inventory")
  return data
}

export async function getTopCategories(): Promise<TopCategory[]> {
  const { data } = await api.get("/dashboard/top-categories")
  return data
}
