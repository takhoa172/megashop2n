"use client"

import { useQuery } from "@tanstack/react-query"
import { getSummary, getRevenue, getProfit } from "@/services/dashboard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { ProfitChart } from "@/components/charts/ProfitChart"
import { formatCurrency } from "@/lib/utils"

export default function ReportsPage() {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports (Báo cáo)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Yearly Revenue (Doanh thu năm)</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(summary?.yearly.revenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Yearly Cost (Chi phí năm)</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(summary?.yearly.cost || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Yearly Profit (Lợi nhuận năm)</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(summary?.yearly.profit || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue || []} />
        <ProfitChart data={profit || []} />
      </div>
    </div>
  )
}
