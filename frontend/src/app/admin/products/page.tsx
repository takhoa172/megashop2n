"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from "@/services/products"
import { getCategories } from "@/services/categories"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, Pencil, Trash2, Package, CheckCircle, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  in_stock: "success",
  pending_price: "warning",
  sold: "danger",
  cancelled: "secondary",
}

const statusLabels: Record<string, string> = {
  in_stock: "Còn hàng",
  sold: "Đã bán",
  pending_price: "Chờ giá",
  cancelled: "Đã huỷ",
}

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page_size: "200" }),
  })

  let products: Product[] = productsData?.results || productsData || []

  if (statusFilter) {
    products = products.filter((p) => p.status === statusFilter)
  }

  if (search) {
    const q = search.toLowerCase()
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    )
  }

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã xoá sản phẩm")
      setDeleteId(null)
    },
    onError: () => toast.error("Không thể xoá sản phẩm"),
  })

  const allProducts: Product[] = productsData?.results || productsData || []
  const summaryCards = [
    { label: "Tổng SP", value: allProducts.length, icon: Package, color: "text-blue-600 bg-blue-100" },
    { label: "Còn hàng", value: allProducts.filter((p) => p.status === "in_stock").length, icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { label: "Đã bán", value: allProducts.filter((p) => p.status === "sold").length, icon: XCircle, color: "text-purple-600 bg-purple-100" },
    { label: "Chờ giá", value: allProducts.filter((p) => p.status === "pending_price").length, icon: Clock, color: "text-amber-600 bg-amber-100" },
  ]

  const columns: ColumnDef<Product>[] = [
    {
      id: "name",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images?.[0] && (
            <img src={row.original.images[0].image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
          )}
          <div>
            <p className="font-medium text-slate-900">{row.original.name}</p>
            <p className="text-xs text-slate-500">{row.original.sku || "—"}</p>
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      header: "Danh mục",
      accessorKey: "category_name",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{row.original.category_name || "—"}</span>
      ),
    },
    {
      header: "Giá nhập",
      accessorKey: "purchase_price",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{formatCurrency(row.original.purchase_price)}</span>
      ),
      enableSorting: true,
    },
    {
      header: "Giá bán",
      accessorKey: "sale_price",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">
          {row.original.sale_price !== null ? formatCurrency(row.original.sale_price) : "—"}
        </span>
      ),
    },
    {
      header: "SL",
      accessorKey: "quantity",
      cell: ({ row }) => (
        <span className={`font-medium ${(row.original.quantity ?? 0) <= 5 ? "text-red-600" : "text-slate-900"}`}>
          {row.original.quantity ?? 0}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] || "default"}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      header: "Ngày tạo",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => { setEditingProduct(row.original); setShowForm(true) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteId(row.original.id)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        description="Theo dõi và quản lý kho hàng"
        action={
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
        }
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
          {[
            { key: "", label: "Tất cả", count: allProducts.length },
            { key: "in_stock", label: "Còn hàng" },
            { key: "sold", label: "Đã bán" },
            { key: "pending_price", label: "Chờ giá" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label} {f.count !== undefined ? `(${f.count})` : ""}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tìm tên sản phẩm, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="animate-pulse space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex gap-4">
                {[1,2,3,4,5,6,7].map((j) => (
                  <div key={j} className="h-6 bg-slate-200 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={products} pageSize={10} />
      )}

      {showForm && (
        <Modal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
          title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        >
          <ProductForm
            product={editingProduct}
            onClose={() => { setShowForm(false); setEditingProduct(null) }}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xoá sản phẩm"
        message="Bạn có chắc muốn xoá sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Huỷ"
        loading={deleteMutation.isPending}
      />
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
      toast.success("Đã thêm sản phẩm")
      onClose()
    },
    onError: () => toast.error("Không thể thêm sản phẩm"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã cập nhật sản phẩm")
      onClose()
    },
    onError: () => toast.error("Không thể cập nhật sản phẩm"),
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
      toast.success("Đã tải ảnh lên")
    } catch {
      toast.error("Không thể tải ảnh")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Tên sản phẩm *</label>
          <input name="name" required defaultValue={product?.name || ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">SKU</label>
          <input name="sku" defaultValue={product?.sku || ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Danh mục</label>
          <select name="category" defaultValue={product?.category || ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
            <option value="">Chọn danh mục</option>
            {categories?.map((cat: { id: string; name: string }) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Trạng thái</label>
          <select name="status" defaultValue={product?.status || "pending_price"}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
            <option value="pending_price">Chờ giá</option>
            <option value="in_stock">Còn hàng</option>
            <option value="sold">Đã bán</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Giá nhập *</label>
          <input name="purchase_price" type="number" step="0.01" required defaultValue={product?.purchase_price || ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Giá bán</label>
          <input name="sale_price" type="number" step="0.01" defaultValue={product?.sale_price ?? ""}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Số lượng</label>
          <input name="quantity" type="number" defaultValue={product?.quantity ?? 1}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mô tả</label>
        <textarea name="description" defaultValue={product?.description || ""} rows={3}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      {isEditing && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Tải ảnh lên</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {previewUrl && <img src={previewUrl} alt="" className="w-24 h-24 object-cover rounded-xl border mt-2" />}
          {uploading && <p className="text-xs text-slate-500">Đang tải...</p>}
          {product?.images?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {product.images.map((img: { id: string; image_url: string }) => (
                <img key={img.id} src={img.image_url} alt="" className="w-14 h-14 object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  )
}
