"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { getAllOrders, Order } from "@/services/orders"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  Package, Clock, CheckCircle, XCircle, Truck,
  Search, ExternalLink, DollarSign,
} from "lucide-react"
import { toast } from "sonner"

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchOrders = useCallback((searchTerm?: string) => {
    setLoading(true)
    getAllOrders(searchTerm || undefined)
      .then((data) => {
        setOrders(data)
        setSelectedIds(new Set())
      })
      .catch(() => toast.error("Không thể tải đơn hàng"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filtered = useMemo(() => {
    if (!filter) return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})
  }, [orders])

  const totalRevenue = useMemo(() => {
    return filtered.reduce((sum, o) => sum + Number(o.total), 0)
  }, [filtered])

  const summaryCards = [
    {
      label: "Tổng đơn",
      value: filtered.length,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Chờ xử lý",
      value: statusCounts.pending || 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Đã giao",
      value: statusCounts.delivered || 0,
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100",
    },
  ]

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={filtered.length > 0 && selectedIds.size === filtered.length}
          onChange={handleSelectAll}
          className="rounded border-slate-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => handleSelectOne(row.original.id)}
          className="rounded border-slate-300"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: "id",
      header: "Mã đơn",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-slate-500">
          #{row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.shipping_name}</p>
          <p className="text-xs text-slate-500">{row.original.user_email || row.original.guest_email}</p>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "shipping_phone",
      header: "SĐT",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{row.original.shipping_phone}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Tổng tiền",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{formatCurrency(Number(row.original.total))}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "payment_status",
      header: "Thanh toán",
      cell: ({ row }) => (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
          row.original.payment_status === "paid"
            ? "bg-green-100 text-green-700"
            : row.original.payment_status === "refunded"
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {row.original.payment_status === "paid" ? "Đã TT" :
           row.original.payment_status === "refunded" ? "Đã hoàn" : "COD"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const Icon = statusIcons[row.original.status] || Package
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            statusColors[row.original.status] || "bg-slate-100 text-slate-600"
          }`}>
            <Icon size={12} />
            {statusLabels[row.original.status] || row.original.status}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: "Ngày",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatDate(row.original.created_at)}</span>
      ),
      enableSorting: true,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
        >
          Chi tiết <ExternalLink size={12} />
        </Link>
      ),
      enableSorting: false,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        description="Theo dõi và quản lý tất cả đơn hàng"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{card.label}</span>
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filter ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {Object.entries(statusLabels).map(([key, label]) => {
            const Icon = statusIcons[key] || Package
            const count = statusCounts[key] || 0
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === key ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon size={12} />
                {label} ({count})
              </button>
            )
          })}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchOrders(search)
              }}
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            />
          </div>
          <button
            onClick={() => fetchOrders(search)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Tìm
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
          <span className="text-sm font-medium text-blue-700">Đã chọn {selectedIds.size} đơn hàng</span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <TableSkeleton rows={5} cols={8} />
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} pageSize={10} />
      )}
    </div>
  )
}
