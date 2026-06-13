"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSales, createSale, updateSale } from "@/services/sales"
import { getProducts } from "@/services/products"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { Sale } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, Pencil, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function SalesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const queryClient = useQueryClient()

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getSales({ page_size: "200" }),
  })

  const sales: Sale[] = salesData?.results || salesData || []

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.sale_price), 0)
  const avgPrice = sales.length > 0 ? totalRevenue / sales.length : 0

  const summaryCards = [
    { label: "Tổng giao dịch", value: sales.length, icon: ShoppingCart, color: "text-blue-600 bg-blue-100" },
    { label: "Doanh thu", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-100" },
    { label: "TB mỗi đơn", value: formatCurrency(avgPrice), icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
  ]

  const columns: ColumnDef<Sale>[] = [
    {
      header: "Sản phẩm",
      accessorKey: "product_name",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.product_name}</span>
      ),
    },
    {
      header: "Giá bán",
      accessorKey: "sale_price",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">{formatCurrency(row.original.sale_price)}</span>
      ),
      enableSorting: true,
    },
    {
      header: "Khách hàng",
      accessorKey: "customer_name",
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.customer_name}</span>
      ),
    },
    {
      header: "Người bán",
      accessorKey: "sold_by_name",
      cell: ({ row }) => (
        <span className="text-slate-500 text-sm">{row.original.sold_by_name}</span>
      ),
    },
    {
      header: "Ngày",
      accessorKey: "sold_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatDate(row.original.sold_at)}</span>
      ),
    },
    {
      header: "Ghi chú",
      accessorKey: "note",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">{row.original.note || "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => { setEditingSale(row.original); setShowForm(true) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý bán hàng"
        description="Theo dõi các giao dịch bán hàng"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Bán hàng
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex gap-4">
                {[1,2,3,4,5,6].map((j) => (
                  <div key={j} className="h-6 bg-slate-200 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={sales} pageSize={10} />
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingSale(null) }} title={editingSale ? "Sửa giao dịch bán hàng" : "Bán hàng mới"}>
        <SaleForm sale={editingSale} onClose={() => { setShowForm(false); setEditingSale(null) }} />
      </Modal>
    </div>
  )
}

function SaleForm({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: products } = useQuery({
    queryKey: ["products", "unsold"],
    queryFn: () => getProducts({ page_size: "100", status: "in_stock,pending_price" }),
  })

  const isEditing = !!sale

  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã thêm giao dịch bán hàng")
      onClose()
    },
    onError: () => toast.error("Không thể thêm giao dịch"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sale> }) => updateSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã cập nhật giao dịch bán hàng")
      onClose()
    },
    onError: () => toast.error("Không thể cập nhật giao dịch"),
  })

  const [soldAt, setSoldAt] = useState(
    sale?.sold_at ? new Date(sale.sold_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      product: form.get("product") as string,
      sale_price: parseFloat(form.get("sale_price") as string),
      customer_name: form.get("customer_name") as string,
      sold_at: new Date(soldAt).toISOString(),
      note: form.get("note") as string,
    }
    if (isEditing && sale) {
      updateMutation.mutate({ id: sale.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const productList = products?.results || products || []
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Sản phẩm *</label>
        <select name="product" required defaultValue={sale?.product || ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
          <option value="">Chọn sản phẩm</option>
          {productList.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Giá bán *</label>
          <input name="sale_price" type="number" step="0.01" required defaultValue={sale?.sale_price || ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Ngày bán</label>
          <input type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tên khách hàng *</label>
        <input name="customer_name" required defaultValue={sale?.customer_name || ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Ghi chú</label>
        <input name="note" defaultValue={sale?.note || ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Xác nhận bán"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  )
}
