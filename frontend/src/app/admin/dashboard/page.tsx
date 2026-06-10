"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSummary,
  getRevenue,
  getProfit,
  getInventory,
  getTopCategories,
} from "@/services/dashboard"
import { getAllOrders } from "@/services/orders"
import { getProducts } from "@/services/products"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { ProfitChart } from "@/components/charts/ProfitChart"
import { InventoryPieChart } from "@/components/charts/InventoryPieChart"
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart"
import { PageHeader } from "@/components/ui/page-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag,
  Package, CheckCircle, Clock,
  Plus, ListOrdered, FileBarChart, AlertTriangle,
  ShoppingCart, ExternalLink,
} from "lucide-react"
import Link from "next/link"

const statCards = [
  {
    key: "todayRevenue",
    title: "Doanh thu hôm nay",
    icon: DollarSign,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    key: "todayProfit",
    title: "Lợi nhuận hôm nay",
    icon: TrendingUp,
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    key: "todayCost",
    title: "Chi phí hôm nay",
    icon: TrendingDown,
    gradient: "from-red-500 to-red-600",
    iconBg: "bg-red-100 text-red-600",
  },
  {
    key: "todaySold",
    title: "Đã bán hôm nay",
    icon: ShoppingBag,
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 text-purple-600",
  },
]

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  pending: "Chờ XN",
  confirmed: "Đã XN",
  shipped: "Đang ship",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["dashboard", "summary", selectedYear, selectedMonth],
    queryFn: () => getSummary(selectedMonth, selectedYear),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["dashboard", "revenue", selectedYear],
    queryFn: () => getRevenue(selectedYear),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: profit } = useQuery({
    queryKey: ["dashboard", "profit", selectedYear],
    queryFn: () => getProfit(selectedYear),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: inventory } = useQuery({
    queryKey: ["dashboard", "inventory"],
    queryFn: getInventory,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: topCategories } = useQuery({
    queryKey: ["dashboard", "top-categories"],
    queryFn: getTopCategories,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: recentOrders } = useQuery({
    queryKey: ["dashboard", "recent-orders"],
    queryFn: () => getAllOrders(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: allProducts } = useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: () => getProducts({ page_size: "200" }),
    staleTime: 30_000,
  })

  const products = Array.isArray(allProducts) ? allProducts : allProducts?.results || []
  const lowStockProducts = products.filter(
    (p: { quantity?: number }) => (p.quantity ?? 0) <= 5
  ).slice(0, 5)

  const recentOrdersList = (recentOrders || []).slice(0, 5)

  const getStatValue = (key: string) => {
    if (!summary) return null
    switch (key) {
      case "todayRevenue": return formatCurrency(summary.today.revenue)
      case "todayProfit": return formatCurrency(summary.today.profit)
      case "todayCost": return formatCurrency(summary.today.cost)
      case "todaySold": return String(summary.today.products_sold)
      default: return null
    }
  }

  const getStatSubtitle = (key: string) => {
    if (!summary) return ""
    switch (key) {
      case "todayRevenue": return `Tháng ${selectedMonth}: ${formatCurrency(summary.monthly.revenue)}`
      case "todayProfit": return `Tháng ${selectedMonth}: ${formatCurrency(summary.monthly.profit)}`
      case "todayCost": return `Tháng ${selectedMonth}: ${formatCurrency(summary.monthly.cost)}`
      case "todaySold": return `Tổng tồn kho: ${summary.inventory.in_stock}`
      default: return ""
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Tổng quan cửa hàng của bạn"
        action={
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="text-lg">↻</span>
            Làm mới
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-sm font-medium text-slate-700">Lọc theo:</span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={String(m)}>Tháng {m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 6 + i).map((y) => (
            <option key={y} value={String(y)}>Năm {y}</option>
          ))}
        </select>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg">↻</span>
          Áp dụng
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/products"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="rounded-xl p-2.5 bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Plus size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Thêm sản phẩm</p>
            <p className="text-xs text-slate-500">Quản lý kho hàng</p>
          </div>
        </Link>
        <Link href="/admin/orders"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group"
        >
          <div className="rounded-xl p-2.5 bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <ListOrdered size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Đơn hàng</p>
            <p className="text-xs text-slate-500">Quản lý đơn hàng</p>
          </div>
        </Link>
        <Link href="/admin/sales"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="rounded-xl p-2.5 bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <ShoppingCart size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Bán hàng</p>
            <p className="text-xs text-slate-500">Ghi nhận bán</p>
          </div>
        </Link>
        <Link href="/admin/reports"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="rounded-xl p-2.5 bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FileBarChart size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Báo cáo</p>
            <p className="text-xs text-slate-500">Phân tích chi tiết</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = getStatValue(card.key)
          const subtitle = getStatSubtitle(card.key)
          return (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg`}
            >
              <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/80">{card.title}</span>
                  <div className={`rounded-xl p-2 ${card.iconBg}`}>
                    <Icon size={18} className="text-inherit" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">
                  {sumLoading ? (
                    <span className="inline-block w-24 h-7 rounded bg-white/20 animate-pulse" />
                  ) : (
                    value
                  )}
                </p>
                {subtitle && (
                  <p className="text-xs text-white/60 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue || []} isLoading={revLoading} />
        <ProfitChart data={profit || []} isLoading={revLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Tồn kho</h3>
            <div className="space-y-3 mb-4">
              {[
                { key: "inStock", title: "Còn hàng", icon: CheckCircle, color: "text-green-600 bg-green-100" },
                { key: "sold", title: "Đã bán", icon: Package, color: "text-blue-600 bg-blue-100" },
                { key: "pendingPrice", title: "Chờ định giá", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
              ].map((card) => {
                const Icon = card.icon
                const val = summary?.[card.key === "pendingPrice" ? "inventory" : "inventory"]?.[
                  card.key === "inStock" ? "in_stock" :
                  card.key === "sold" ? "sold" :
                  "pending_price"
                ]
                return (
                  <div key={card.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${card.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{card.title}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {sumLoading ? (
                        <span className="inline-block w-10 h-5 rounded bg-slate-200 animate-pulse" />
                      ) : (
                        val ?? "..."
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
            <InventoryPieChart data={inventory || []} />
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg p-2 bg-amber-100 text-amber-600">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="font-semibold text-slate-900">Hàng sắp hết</h3>
                <span className="ml-auto text-xs text-amber-600 font-medium">{lowStockProducts.length} sản phẩm</span>
              </div>
              <div className="space-y-2">
                {lowStockProducts.map((p: { id: string; name: string; quantity?: number }) => (
                  <Link key={p.id} href={`/admin/products`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700 truncate">{p.name}</span>
                    <span className={`text-sm font-bold shrink-0 ml-2 ${
                      (p.quantity ?? 0) <= 2 ? "text-red-600" : "text-amber-600"
                    }`}>
                      {p.quantity ?? 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const m = summary?.monthly as { revenue: number; cost: number; profit: number; label?: string } | undefined
            if (!m) return null
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-1">Tổng kết tháng</h3>
                <p className="text-sm text-slate-500 mb-3">{m.label || "Tháng này"}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Doanh thu</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(m.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Chi phí</span>
                    <span className="font-semibold text-red-600">{formatCurrency(m.cost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Lợi nhuận</span>
                    <span className={`font-bold ${m.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(m.profit)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {(() => {
            const y = summary?.yearly as { revenue: number; cost: number; profit: number; label?: string } | undefined
            if (!y) return null
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-1">Tổng kết năm</h3>
                <p className="text-sm text-slate-500 mb-3">{y.label || "Năm nay"}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Doanh thu</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(y.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Chi phí</span>
                    <span className="font-semibold text-red-600">{formatCurrency(y.cost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Lợi nhuận</span>
                    <span className={`font-bold ${y.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(y.profit)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <TopCategoriesChart data={topCategories || []} />

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Đơn hàng gần đây</h3>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Xem tất cả <ExternalLink size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentOrdersList.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có đơn hàng nào</p>
              ) : (
                recentOrdersList.map((order: { id: string; shipping_name: string; total: string; status: string; created_at: string }) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <ShoppingBag size={14} className="text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          #{order.id.slice(-8)} — {order.shipping_name}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(Number(order.total))}
                      </p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        statusColors[order.status] || "bg-slate-100 text-slate-600"
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
