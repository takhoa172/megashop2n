"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPurchases, createPurchase } from "@/services/purchases"
import { getProducts } from "@/services/products"
import { getUsers } from "@/services/auth"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Purchase, User } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus } from "lucide-react"

export default function PurchasesPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: purchasesData } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => getPurchases({ page_size: "100" }),
  })

  const purchases: Purchase[] = purchasesData?.results || purchasesData || []

  const columns: ColumnDef<Purchase>[] = [
    { header: "Product", accessorKey: "product_name" },
    { header: "Payer", accessorKey: "payer_name" },
    {
      header: "Price",
      accessorKey: "purchase_price",
      cell: ({ row }) => formatCurrency(row.original.purchase_price),
    },
    {
      header: "Date",
      accessorKey: "purchased_at",
      cell: ({ row }) => formatDate(row.original.purchased_at),
    },
    { header: "Note", accessorKey: "note", cell: ({ row }) => row.original.note || "-" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" /> Add Purchase
        </Button>
      </div>
      {showForm && <PurchaseForm onClose={() => setShowForm(false)} />}
      <DataTable columns={columns} data={purchases} />
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
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({
      product: form.get("product") as string,
      payer: form.get("payer") as string,
      purchase_price: parseFloat(form.get("purchase_price") as string),
      purchased_at: new Date().toISOString(),
      note: form.get("note") as string,
    })
  }

  const productList = products?.results || products || []

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">New Purchase</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Product *</label>
          <select name="product" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm">
            <option value="">Select product</option>
            {productList.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Payer *</label>
          <select name="payer" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm">
            <option value="">Select payer</option>
            {(users || []).map((u: User) => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Purchase Price *</label>
          <input name="purchase_price" type="number" step="0.01" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Note</label>
          <input name="note" className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm" />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Create Purchase</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
