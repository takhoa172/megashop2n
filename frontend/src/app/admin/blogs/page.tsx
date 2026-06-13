"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, getBlogCategories, uploadBlogImage, updateBlogPostVisibility } from "@/services/blogs"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/ui/page-header"
import { Toggle } from "@/components/ui/toggle"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { BlogPost } from "@/types"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState, useRef } from "react"
import { Plus, Pencil, Trash2, FileText, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

export default function BlogsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => getBlogPosts({ page_size: "100" }),
  })

  let posts: BlogPost[] = postsData?.results || postsData || []

  if (search) {
    const q = search.toLowerCase()
    posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q))
  }

  const visibilityMutation = useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) => updateBlogPostVisibility(id, is_visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      queryClient.invalidateQueries({ queryKey: ["public-blogs"] })
      toast.success("Đã cập nhật hiển thị")
    },
    onError: () => toast.error("Không thể cập nhật hiển thị"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      toast.success("Đã xoá bài viết")
      setDeleteId(null)
    },
    onError: () => toast.error("Không thể xoá bài viết"),
  })

  const allPosts: BlogPost[] = postsData?.results || postsData || []
  const summaryCards = [
    { label: "Tổng bài viết", value: allPosts.length, icon: FileText, color: "text-blue-600 bg-blue-100" },
    { label: "Đã xuất bản", value: allPosts.filter((p) => p.status === "published").length, icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { label: "Bản nháp", value: allPosts.filter((p) => p.status === "draft").length, icon: Clock, color: "text-amber-600 bg-amber-100" },
  ]

  const columns: ColumnDef<BlogPost>[] = [
    {
      header: "Tiêu đề",
      accessorKey: "title",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.title}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "success" : "warning"}>
          {row.original.status === "published" ? "Đã xuất bản" : "Bản nháp"}
        </Badge>
      ),
    },
    {
      header: "Danh mục",
      accessorKey: "category_name",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{row.original.category_name || "—"}</span>
      ),
    },
    {
      header: "Tác giả",
      accessorKey: "author_name",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{row.original.author_name}</span>
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
      header: "Ngày đăng",
      accessorKey: "published_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {row.original.published_at ? formatDate(row.original.published_at) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => { setEditingPost(row.original); setShowForm(true) }}
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
        title="Quản lý bài viết"
        description="Viết và quản lý nội dung blog"
        action={
          <button
            onClick={() => { setEditingPost(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Bài viết mới
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

      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Tìm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
        />
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
        <DataTable columns={columns} data={posts} pageSize={10} />
      )}

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingPost(null) }}
        title={editingPost ? "Sửa bài viết" : "Bài viết mới"}
        className="max-w-[42rem]"
      >
        <BlogForm post={editingPost} onClose={() => { setShowForm(false); setEditingPost(null) }} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xoá bài viết"
        message="Bạn có chắc muốn xoá bài viết này?"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

function BlogForm({ post, onClose }: { post: BlogPost | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
  })

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      toast.success("Đã tạo bài viết")
      onClose()
    },
    onError: () => toast.error("Không thể tạo bài viết"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      toast.success("Đã cập nhật bài viết")
      onClose()
    },
    onError: () => toast.error("Không thể cập nhật bài viết"),
  })

  const isEditing = !!post

  const [publishMode, setPublishMode] = useState<"publish_now" | "schedule" | "draft">(
    post?.status === "published" && post?.published_at ? "schedule" :
    post?.status === "published" ? "publish_now" : "draft"
  )

  const [imageMode, setImageMode] = useState<"upload" | "url" | "none">(
    post?.featured_image ? "url" : "none"
  )
  const [imageUrl, setImageUrl] = useState(post?.featured_image || "")
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !post) return
    setFileName(file.name)
    setUploading(true)
    try {
      const result = await uploadBlogImage(post.slug, file)
      setImageUrl(result.url)
      setImageMode("url")
      toast.success("Đã tải ảnh lên")
    } catch {
      toast.error("Không thể tải ảnh lên")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (imageMode === "none") {
      form.set("featured_image", "")
    } else {
      form.set("featured_image", imageUrl)
    }
    form.set("is_visible", "true")
    if (publishMode === "publish_now") {
      form.set("status", "published")
      form.set("published_at", new Date().toISOString())
    } else if (publishMode === "schedule") {
      form.set("status", "published")
    } else {
      form.set("status", "draft")
      form.delete("published_at")
    }
    if (isEditing) {
      updateMutation.mutate({ id: post.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const imagePreview = imageMode === "url" && imageUrl ? imageUrl : post?.featured_image || null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
        <input name="title" required defaultValue={post?.title || ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Danh mục</label>
            <select name="category" defaultValue={post?.category || ""}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
              <option value="">Chọn danh mục</option>
              {(categories || []).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Chế độ đăng</label>
            <div className="flex gap-2 pt-1">
              {[
                { key: "publish_now" as const, label: "Đăng ngay", desc: "Xuất bản ngay lập tức" },
                { key: "schedule" as const, label: "Lên lịch", desc: "Hẹn giờ xuất bản" },
                { key: "draft" as const, label: "Lưu nháp", desc: "Chưa xuất bản" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPublishMode(opt.key)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    publishMode === opt.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="status" value={publishMode === "draft" ? "draft" : "published"} />
          </div>
        </div>
        {publishMode === "schedule" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Lịch xuất bản</label>
            <input name="published_at" type="datetime-local"
              defaultValue={post?.published_at ? post.published_at.slice(0, 16) : ""}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
        )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
        <textarea name="excerpt" defaultValue={post?.excerpt || ""} rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Nội dung *</label>
        <textarea name="content" required defaultValue={post?.content || ""} rows={8}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono" />
        <p className="text-xs text-slate-400">Hỗ trợ HTML / Markdown</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Ảnh đại diện</label>
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
            {isEditing ? (
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-lg">upload</span>
                  {uploading ? "Đang tải..." : "Chọn file ảnh"}
                </button>
                <span className="text-slate-400 text-xs">{fileName || "Chưa chọn file"}</span>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </div>
            ) : (
              <p className="text-xs text-slate-400">Lưu bài viết trước, sau đó upload ảnh trong chế độ sửa.</p>
            )}
          </div>
        )}

        {imageMode === "url" && (
          <div className="space-y-1.5">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="https://..." />
          </div>
        )}

        {imagePreview && imageMode !== "none" && (
          <img src={imagePreview} alt="" className="w-32 h-20 object-cover rounded-lg border border-slate-200" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Đăng bài"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  )
}
