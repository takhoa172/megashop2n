import api from "./api"
import {
  DashboardSummary,
  ChartDataPoint,
  InventoryChartItem,
  TopCategory,
} from "@/types"

export async function getSummary(month?: string, year?: string): Promise<DashboardSummary> {
  const params: Record<string, string> = {}
  if (month) params.month = month
  if (year) params.year = year
  const { data } = await api.get("/dashboard/summary", { params })
  return data
}

export async function getRevenue(year?: string): Promise<ChartDataPoint[]> {
  const params: Record<string, string> = {}
  if (year) params.year = year
  const { data } = await api.get("/dashboard/revenue", { params })
  return data
}

export async function getProfit(year?: string): Promise<ChartDataPoint[]> {
  const params: Record<string, string> = {}
  if (year) params.year = year
  const { data } = await api.get("/dashboard/profit", { params })
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
