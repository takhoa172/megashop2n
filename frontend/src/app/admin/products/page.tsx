"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage, addProductImageUrl, removeImage, replaceImage, setPrimaryImage, updateProductVisibility } from "@/services/products"
import { getCategories } from "@/services/categories"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { Toggle } from "@/components/ui/toggle"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState, useRef } from "react"
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

  const visibilityMutation = useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) => updateProductVisibility(id, is_visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["suggested"] })
      queryClient.invalidateQueries({ queryKey: ["most-viewed"] })
      queryClient.invalidateQueries({ queryKey: ["price-zero"] })
      queryClient.invalidateQueries({ queryKey: ["public-products"] })
      toast.success("Đã cập nhật hiển thị")
    },
    onError: () => toast.error("Không thể cập nhật hiển thị"),
  })

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
      id: "visibility",
      header: "Hiển thị",
      cell: ({ row }) => (
        <Toggle
          checked={row.original.is_visible ?? true}
          onChange={() => visibilityMutation.mutate({ id: row.original.id, is_visible: !row.original.is_visible })}
          disabled={visibilityMutation.isPending}
        />
      ),
      enableSorting: false,
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
  const [fileName, setFileName] = useState("")
  const [imageMode, setImageMode] = useState<"upload" | "url" | "none">(
    product?.images?.length ? "url" : "none"
  )
  const [imageUrl, setImageUrl] = useState(product?.images?.[0]?.image_url || "")
  const [clearingImages, setClearingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceFileInputRef = useRef<HTMLInputElement>(null)
  const [replacingId, setReplacingId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      if (imageMode === "upload" && fileName) {
        const fileInput = fileInputRef.current
        const file = fileInput?.files?.[0]
        if (file) {
          try {
            await uploadImage(newProduct.id, file, true)
            queryClient.invalidateQueries({ queryKey: ["products"] })
          } catch {
            toast.error("Không thể tải ảnh")
            return
          }
        }
      } else if (imageMode === "url" && imageUrl) {
        try {
          await addProductImageUrl(newProduct.id, imageUrl, true)
          queryClient.invalidateQueries({ queryKey: ["products"] })
        } catch {
          toast.error("Không thể thêm ảnh từ URL")
          return
        }
      }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isEditing && imageMode === "none" && product.images?.length) {
      setClearingImages(true)
      try {
        await Promise.all(product.images.map((img) => removeImage(product.id, img.id)))
        queryClient.invalidateQueries({ queryKey: ["products"] })
      } catch {
        toast.error("Không thể xoá ảnh cũ")
        setClearingImages(false)
        return
      } finally {
        setClearingImages(false)
      }
    }
    const form = e.currentTarget
    const formData = new FormData(form)
    if (isEditing) {
      formData.set("is_visible", String(product.is_visible ?? true))
      updateMutation.mutate({ id: product.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    if (!product) return
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

  const handleAddImageUrl = async () => {
    if (!imageUrl) return
    if (!product) {
      setPreviewUrl(imageUrl)
      return
    }
    setUploading(true)
    try {
      await addProductImageUrl(product.id, imageUrl, true)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã thêm ảnh từ URL")
    } catch {
      toast.error("Không thể thêm ảnh")
    } finally {
      setUploading(false)
    }
  }

  const primaryImageUrl = product?.images?.[0]?.image_url || null

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
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Ảnh sản phẩm</label>
        <div className="flex gap-2">
          {[
            { key: "upload", label: "Tải ảnh lên" },
            { key: "url", label: "Dùng URL" },
            { key: "none", label: "Không có ảnh" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setImageMode(opt.key as typeof imageMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                imageMode === opt.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {imageMode === "upload" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-lg">upload</span>
                {uploading ? "Đang tải..." : "Chọn file"}
              </button>
              <span className="text-slate-400 text-xs">{fileName || "Chưa chọn file"}</span>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </div>
          </div>
        )}

        {imageMode === "url" && (
          <div className="flex items-center gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="https://..." />
            {isEditing && (
              <button type="button" onClick={handleAddImageUrl} disabled={uploading || !imageUrl}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {uploading ? "Đang..." : "Thêm"}
              </button>
            )}
          </div>
        )}

        {imageMode === "none" && (
          <p className="text-xs text-slate-400">Sản phẩm sẽ không có ảnh hiển thị.</p>
        )}

        {product?.images && product.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {product.images.map((img: { id: string; image_url: string; is_primary?: boolean }) => (
              <div key={img.id} className="relative group">
                <div className={`relative ${img.is_primary ? "ring-2 ring-blue-500 rounded-lg" : ""}`}>
                  <img src={img.image_url} alt="" className="w-14 h-14 object-cover rounded-lg border" />
                  {img.is_primary && (
                    <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center">
                      ★
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await setPrimaryImage(product.id, img.id)
                          queryClient.invalidateQueries({ queryKey: ["products"] })
                          toast.success("Đã đặt làm ảnh chính")
                        } catch {
                          toast.error("Không thể đặt ảnh chính")
                        }
                      }}
                      className="w-6 h-6 bg-white/90 rounded-full text-[11px] flex items-center justify-center hover:bg-white transition-colors"
                      title="Đặt làm ảnh chính"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingId(img.id)
                      replaceFileInputRef.current?.click()
                    }}
                    className="w-6 h-6 bg-white/90 rounded-full text-[11px] flex items-center justify-center hover:bg-white transition-colors"
                    title="Thay thế ảnh"
                  >
                    ↻
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeImage(product.id, img.id)
                        queryClient.invalidateQueries({ queryKey: ["products"] })
                        toast.success("Đã xoá ảnh")
                      } catch {
                        toast.error("Không thể xoá ảnh")
                      }
                    }}
                    className="w-6 h-6 bg-red-500/90 text-white rounded-full text-[11px] flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Xoá ảnh"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input
          ref={replaceFileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file || !replacingId || !product) return
            try {
              await replaceImage(product.id, replacingId, file)
              queryClient.invalidateQueries({ queryKey: ["products"] })
              toast.success("Đã thay thế ảnh")
            } catch {
              toast.error("Không thể thay thế ảnh")
            } finally {
              setReplacingId(null)
              if (replaceFileInputRef.current) replaceFileInputRef.current.value = ""
            }
          }}
        />

        {previewUrl && <img src={previewUrl} alt="" className="w-24 h-24 object-cover rounded-xl border" />}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || clearingImages}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {clearingImages ? "Đang xoá ảnh..." : createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  )
}
