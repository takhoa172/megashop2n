"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getSummary,
  getRevenue,
  getProfit,
  getInventory,
  getTopCategories,
} from "@/services/dashboard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { ProfitChart } from "@/components/charts/ProfitChart"
import { InventoryPieChart } from "@/components/charts/InventoryPieChart"
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react"

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getSummary,
  })

  const { data: revenue } = useQuery({
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today Revenue"
          value={formatCurrency(summary?.today.revenue || 0)}
          icon={<DollarSign className="text-blue-600" size={20} />}
        />
        <StatCard
          title="Today Cost"
          value={formatCurrency(summary?.today.cost || 0)}
          icon={<TrendingDown className="text-red-600" size={20} />}
        />
        <StatCard
          title="Today Profit"
          value={formatCurrency(summary?.today.profit || 0)}
          icon={<TrendingUp className="text-green-600" size={20} />}
        />
        <StatCard
          title="Products Sold Today"
          value={String(summary?.today.products_sold || 0)}
          icon={<ShoppingBag className="text-purple-600" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue || []} />
        <ProfitChart data={profit || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryPieChart data={inventory || []} />
        <TopCategoriesChart data={topCategories || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monthly Revenue</p>
          <p className="text-xl font-bold">
            {formatCurrency(summary?.monthly.revenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monthly Cost</p>
          <p className="text-xl font-bold">
            {formatCurrency(summary?.monthly.cost || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monthly Profit</p>
          <p className="text-xl font-bold">
            {formatCurrency(summary?.monthly.profit || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
