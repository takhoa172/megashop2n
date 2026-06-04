"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from "@/services/products"
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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
    { header: "Name (Tên)", accessorKey: "name" },
    {
      header: "Category (Danh mục)",
      accessorKey: "category_name",
      cell: ({ row }) => row.original.category_name || "-",
    },
    {
      header: "Purchase Price (Giá nhập)",
      accessorKey: "purchase_price",
      cell: ({ row }) => formatCurrency(row.original.purchase_price),
    },
    {
      header: "Sale Price (Giá bán)",
      accessorKey: "sale_price",
      cell: ({ row }) =>
        row.original.sale_price !== null ? formatCurrency(row.original.sale_price) : "-",
    },
    {
      header: "Status (Trạng thái)",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] || "default"}>
          {row.original.status === "in_stock" ? "Còn hàng" : row.original.status === "sold" ? "Đã bán" : row.original.status === "pending_price" ? "Chờ giá" : "Đã huỷ"}
        </Badge>
      ),
    },
    {
      header: "Created (Ngày tạo)",
      accessorKey: "created_at",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(row.original); setShowForm(true) }}>
            <Pencil size={16} className="text-blue-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
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
        <h1 className="text-2xl font-bold">Products (Sản phẩm)</h1>
        <Button onClick={() => { setEditingProduct(null); setShowForm(!showForm) }}>
          <Plus size={16} className="mr-1" /> Add Product (Thêm SP)
        </Button>
      </div>
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
        />
      )}
      <DataTable columns={columns} data={products} />
    </div>
  )
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
    },
  })

  const isEditing = !!product

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    if (isEditing) {
      updateMutation.mutate({ id: product.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !product) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      await uploadImage(product.id, file, true)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Product (Sửa SP)" : "New Product (Thêm SP)"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name (Tên) *</label>
          <input
            name="name"
            required
            defaultValue={product?.name || ""}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">SKU</label>          <input
            name="sku"
            defaultValue={product?.sku || ""}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Category (Danh mục)</label>          <select
            name="category"
            defaultValue={product?.category || ""}
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
          <label className="text-sm font-medium">Purchase Price (Giá nhập) *</label>          <input
            name="purchase_price"
            type="number"
            step="0.01"
            required
            defaultValue={product?.purchase_price || ""}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sale Price (Giá bán)</label>          <input
            name="sale_price"
            type="number"
            step="0.01"
            defaultValue={product?.sale_price || ""}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status (Trạng thái)</label>          <select
            name="status"
            defaultValue={product?.status || "pending_price"}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          >
            <option value="pending_price">Pending Price (Chờ giá)</option>
            <option value="in_stock">In Stock (Còn hàng)</option>          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Quantity (Số lượng)</label>          <input
            name="quantity"
            type="number"
            defaultValue={product?.quantity || 1}
            className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Description (Mô tả)</label>          <textarea
            name="description"
            defaultValue={product?.description || ""}
            className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
          />
        </div>
        {isEditing && (
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Upload Image (Tải ảnh lên)</label>            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm"
            />
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded border" />
              </div>
            )}
            {uploading && <p className="text-xs text-slate-500">Uploading...</p>}
            {product?.images?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {product.images.map((img) => (
                  <img key={img.id} src={img.image_url} alt="" className="w-16 h-16 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">{isEditing ? "Update Product (Cập nhật)" : "Create Product (Tạo mới)"}</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel (Huỷ)
          </Button>
        </div>
      </form>
    </div>
  )
}
