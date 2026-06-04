"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSales, createSale } from "@/services/sales"
import { getProducts } from "@/services/products"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Sale } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus } from "lucide-react"

export default function SalesPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: salesData } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getSales({ page_size: "100" }),
  })

  const sales: Sale[] = salesData?.results || salesData || []

  const columns: ColumnDef<Sale>[] = [
    { header: "Product (Sản phẩm)", accessorKey: "product_name" },
    {
      header: "Sale Price (Giá bán)",
      accessorKey: "sale_price",
      cell: ({ row }) => formatCurrency(row.original.sale_price),
    },
    { header: "Customer (Khách hàng)", accessorKey: "customer_name" },
    { header: "Sold By (Người bán)", accessorKey: "sold_by_name" },
    {
      header: "Date (Ngày bán)",
      accessorKey: "sold_at",
      cell: ({ row }) => formatDate(row.original.sold_at),
    },
    { header: "Note (Ghi chú)", accessorKey: "note", cell: ({ row }) => row.original.note || "-" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales (Bán hàng)</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" /> Add Sale (Thêm)
        </Button>
      </div>
      {showForm && <SaleForm onClose={() => setShowForm(false)} />}
      <DataTable columns={columns} data={sales} />
    </div>
  )
}

function SaleForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: products } = useQuery({
    queryKey: ["products", "unsold"],
    queryFn: () => getProducts({ page_size: "100", status: "in_stock,pending_price" }),
  })

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
    },
  })

  const [soldAt, setSoldAt] = useState(new Date().toISOString().slice(0, 16))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({
      product: form.get("product") as string,
      sale_price: parseFloat(form.get("sale_price") as string),
      customer_name: form.get("customer_name") as string,
      sold_at: new Date(soldAt).toISOString(),
      note: form.get("note") as string,
    })
  }

  const productList = products?.results || products || []

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">New Sale (Bán hàng mới)</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Product (Sản phẩm) *</label>
          <select name="product" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm">
            <option value="">Select product (Chọn SP)</option>
            {productList.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sale Price (Giá bán) *</label>          <input name="sale_price" type="number" step="0.01" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Customer Name (Tên KH) *</label>          <input name="customer_name" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Note (Ghi chú)</label>          <input name="note" className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sale Date (Ngày bán)</label>          <input type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Create Sale (Tạo)</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel (Huỷ)</Button>
        </div>
      </form>
    </div>
  )
}
