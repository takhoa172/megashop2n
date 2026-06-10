"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getSummary, getRevenue, getProfit } from "@/services/dashboard"
import { PageHeader } from "@/components/ui/page-header"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { ProfitChart } from "@/components/charts/ProfitChart"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, TrendingDown, Percent, Download } from "lucide-react"
import { toast } from "sonner"

export default function ReportsPage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard", "summary", selectedYear],
    queryFn: () => getSummary("", selectedYear),
  })

  const { data: revenue } = useQuery({
    queryKey: ["dashboard", "revenue", selectedYear],
    queryFn: () => getRevenue(selectedYear),
  })

  const { data: profit } = useQuery({
    queryKey: ["dashboard", "profit", selectedYear],
    queryFn: () => getProfit(selectedYear),
  })

  const yearly = summary?.yearly
  const revenueVal = yearly?.revenue ?? 0
  const costVal = yearly?.cost ?? 0
  const profitVal = yearly?.profit ?? 0
  const margin = revenueVal > 0 ? ((profitVal / revenueVal) * 100).toFixed(1) : "0"

  const handleExport = () => {
    if (!revenue || !profit) {
      toast.error("Không có dữ liệu để xuất")
      return
    }
    const rows = [["Tháng", "Doanh thu", "Chi phí", "Lợi nhuận"]]
    const profitMap = new Map(profit.map((p: any) => [p.month, p]))
    for (const r of revenue) {
      const p = profitMap.get(r.month)
      rows.push([r.month, r.revenue, p?.cost ?? 0, p?.profit ?? 0])
    }
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bao-cao-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Đã tải file báo cáo")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo"
        description="Phân tích tình hình kinh doanh"
        action={
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
            >
              {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 6 + i).map((y) => (
                <option key={y} value={String(y)}>Năm {y}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Doanh thu năm</span>
            <div className="rounded-lg p-2 bg-blue-100 text-blue-600">
              <DollarSign size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isLoading ? "text-transparent bg-slate-200 animate-pulse rounded w-32 h-8" : "text-blue-600"}`}>
            {isLoading ? "" : formatCurrency(revenueVal)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Chi phí năm</span>
            <div className="rounded-lg p-2 bg-red-100 text-red-600">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isLoading ? "text-transparent bg-slate-200 animate-pulse rounded w-32 h-8" : "text-red-600"}`}>
            {isLoading ? "" : formatCurrency(costVal)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Lợi nhuận năm</span>
            <div className="rounded-lg p-2 bg-green-100 text-green-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isLoading ? "text-transparent bg-slate-200 animate-pulse rounded w-32 h-8" : profitVal >= 0 ? "text-green-600" : "text-red-600"}`}>
            {isLoading ? "" : formatCurrency(profitVal)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Biên lợi nhuận</span>
            <div className="rounded-lg p-2 bg-purple-100 text-purple-600">
              <Percent size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isLoading ? "text-transparent bg-slate-200 animate-pulse rounded w-32 h-8" : "text-purple-600"}`}>
            {isLoading ? "" : `${margin}%`}
          </p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-medium mb-3">
              {summary.monthly?.label || "Tháng này"}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Doanh thu</span>
                <span className="font-semibold">{formatCurrency(summary.monthly?.revenue ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Chi phí</span>
                <span className="font-semibold text-red-600">{formatCurrency(summary.monthly?.cost ?? 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-medium">Lợi nhuận</span>
                <span className={`font-bold ${(summary.monthly?.profit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.monthly?.profit ?? 0)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-medium mb-3">
              {summary.yearly?.label || "Năm nay"}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Doanh thu</span>
                <span className="font-semibold">{formatCurrency(summary.yearly?.revenue ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Chi phí</span>
                <span className="font-semibold text-red-600">{formatCurrency(summary.yearly?.cost ?? 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-medium">Lợi nhuận</span>
                <span className={`font-bold ${(summary.yearly?.profit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.yearly?.profit ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue || []} isLoading={isLoading} />
        <ProfitChart data={profit || []} isLoading={isLoading} />
      </div>
    </div>
  )
}
