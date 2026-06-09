"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getSummary,
  getRevenue,
  getProfit,
  getInventory,
  getTopCategories,
} from "@/services/dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { ProfitChart } from "@/components/charts/ProfitChart"
import { InventoryPieChart } from "@/components/charts/InventoryPieChart"
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart"
import { formatCurrency } from "@/lib/utils"
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag,
  Package, AlertTriangle, CheckCircle, Clock,
} from "lucide-react"

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

const inventoryCards = [
  {
    key: "inStock",
    title: "Còn hàng",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
  {
    key: "sold",
    title: "Đã bán",
    icon: Package,
    color: "text-blue-600 bg-blue-100",
  },
  {
    key: "pendingPrice",
    title: "Chờ định giá",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    key: "total",
    title: "Tổng sản phẩm",
    icon: Package,
    color: "text-slate-600 bg-slate-100",
  },
]

export default function DashboardPage() {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getSummary,
  })

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: getRevenue,
  })

  const { data: profit } = useQuery({
    queryKey: ["dashboard", "profit"],
    queryFn: getProfit,
  })

  const { data: inventory } = useQuery({
    queryKey: ["dashboard", "inventory"],
    queryFn: getInventory,
  })

  const { data: topCategories } = useQuery({
    queryKey: ["dashboard", "top-categories"],
    queryFn: getTopCategories,
  })

  const getStatValue = (key: string) => {
    if (!summary) return "..."
    switch (key) {
      case "todayRevenue": return formatCurrency(summary.today.revenue)
      case "todayProfit": return formatCurrency(summary.today.profit)
      case "todayCost": return formatCurrency(summary.today.cost)
      case "todaySold": return String(summary.today.products_sold)
      default: return "..."
    }
  }

  const getInventoryValue = (key: string) => {
    if (!summary) return "..."
    switch (key) {
      case "inStock": return String(summary.inventory.in_stock)
      case "sold": return String(summary.inventory.sold)
      case "pendingPrice": return String(summary.inventory.pending_price)
      case "total": return String(summary.inventory.total_products)
      default: return "..."
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan cửa hàng của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
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
                    getStatValue(card.key)
                  )}
                </p>
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
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
            <h3 className="font-semibold text-slate-900 mb-4">Tồn kho</h3>
            <div className="space-y-3">
              {inventoryCards.map((card) => {
                const Icon = card.icon
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
                        getInventoryValue(card.key)
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
            <InventoryPieChart data={inventory || []} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <TopCategoriesChart data={topCategories || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["monthly", "yearly"] as const).map((period) => {
          const periodSummary = summary?.[period]
          if (!periodSummary) return null
          const data = periodSummary as { revenue: number; cost: number; profit: number }
          return (
            <div key={period} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-3">
                {period === "monthly" ? "Tháng này" : "Năm nay"}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Doanh thu</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(data.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Chi phí</span>
                  <span className="font-semibold text-red-600">{formatCurrency(data.cost)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Lợi nhuận</span>
                  <span className={`font-bold ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.profit)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
