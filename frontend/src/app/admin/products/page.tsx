"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProducts, createProduct, deleteProduct } from "@/services/products"
import { getCategories } from "@/services/categories"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  in_stock: "success",
  pending_price: "warning",
  sold: "danger",
  cancelled: "secondary",
}

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page_size: "100" }),
  })

  const products: Product[] = productsData?.results || productsData || []

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })

  const columns: ColumnDef<Product>[] = [
    { header: "SKU", accessorKey: "sku" },
    { header: "Name", accessorKey: "name" },
    {
      header: "Category",
      accessorKey: "category_name",
      cell: ({ row }) => row.original.category_name || "-",
    },
    {
      header: "Purchase Price",
      accessorKey: "purchase_price",
      cell: ({ row }) => formatCurrency(row.original.purchase_price),
    },
    {
      header: "Sale Price",
      accessorKey: "sale_price",
      cell: ({ row }) =>
        row.original.sale_price ? formatCurrency(row.original.sale_price) : "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] || "default"}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(row.original.id)}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" /> Add Product
        </Button>
      </div>
      {showForm && (
        <ProductForm onClose={() => setShowForm(false)} />
      )}
      <DataTable columns={columns} data={products} />
    </div>
  )
}

function ProductForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    mutation.mutate(formData)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">New Product</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name *</label>
          <input
            name="name"
            required
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>
          <select
            name="category"
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          >
            <option value="">None</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Purchase Price *</label>
          <input
            name="purchase_price"
            type="number"
            step="0.01"
            required
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sale Price</label>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          >
            <option value="pending_price">Pending Price</option>
            <option value="in_stock">In Stock</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Quantity</label>
          <input
            name="quantity"
            type="number"
            defaultValue={1}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Create Product</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
