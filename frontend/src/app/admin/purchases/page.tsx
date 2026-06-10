"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPurchases, createPurchase } from "@/services/purchases"
import { getProducts } from "@/services/products"
import { getUsers } from "@/services/auth"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { Purchase, User } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, DollarSign, Package, Receipt } from "lucide-react"
import { toast } from "sonner"

export default function PurchasesPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => getPurchases({ page_size: "200" }),
  })

  const purchases: Purchase[] = purchasesData?.results || purchasesData || []

  const totalCost = purchases.reduce((sum, p) => sum + Number(p.purchase_price), 0)

  const summaryCards = [
    { label: "Tổng giao dịch", value: purchases.length, icon: Receipt, color: "text-blue-600 bg-blue-100" },
    { label: "Tổng chi phí", value: formatCurrency(totalCost), icon: DollarSign, color: "text-red-600 bg-red-100" },
    { label: "Sản phẩm", value: new Set(purchases.map((p) => p.product_name)).size, icon: Package, color: "text-green-600 bg-green-100" },
  ]

  const columns: ColumnDef<Purchase>[] = [
    {
      header: "Sản phẩm",
      accessorKey: "product_name",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.product_name}</span>
      ),
    },
    {
      header: "Người mua",
      accessorKey: "payer_name",
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.payer_name}</span>
      ),
    },
    {
      header: "Giá nhập",
      accessorKey: "purchase_price",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{formatCurrency(row.original.purchase_price)}</span>
      ),
      enableSorting: true,
    },
    {
      header: "Ngày",
      accessorKey: "purchased_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatDate(row.original.purchased_at)}</span>
      ),
    },
    {
      header: "Ghi chú",
      accessorKey: "note",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">{row.original.note || "—"}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhập hàng"
        description="Theo dõi các giao dịch nhập hàng"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Nhập hàng
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
                {[1,2,3,4,5].map((j) => (
                  <div key={j} className="h-6 bg-slate-200 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={purchases} pageSize={10} />
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nhập hàng mới">
        <PurchaseForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}

function PurchaseForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page_size: "100", status: "in_stock,pending_price" }),
  })
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers })

  const mutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã thêm giao dịch nhập hàng")
      onClose()
    },
    onError: () => toast.error("Không thể thêm giao dịch"),
  })

  const [purchasedAt, setPurchasedAt] = useState(new Date().toISOString().slice(0, 16))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({
      product: form.get("product") as string,
      payer: form.get("payer") as string,
      purchase_price: parseFloat(form.get("purchase_price") as string),
      purchased_at: new Date(purchasedAt).toISOString(),
      note: form.get("note") as string,
    })
  }

  const productList = products?.results || products || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Sản phẩm *</label>
        <select name="product" required
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
          <option value="">Chọn sản phẩm</option>
          {productList.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Người mua *</label>
        <select name="payer" required
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
          <option value="">Chọn người mua</option>
          {(users || []).map((u: User) => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Giá nhập *</label>
          <input name="purchase_price" type="number" step="0.01" required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Ngày nhập</label>
          <input type="datetime-local" value={purchasedAt} onChange={(e) => setPurchasedAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Ghi chú</label>
        <input name="note"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={mutation.isPending}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {mutation.isPending ? "Đang xử lý..." : "Thêm giao dịch"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  )
}
