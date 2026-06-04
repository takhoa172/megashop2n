"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/services/blogs"
import { getBlogCategories, createBlogCategory } from "@/services/blogs"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogPost } from "@/types"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function BlogsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const queryClient = useQueryClient()

  const { data: postsData } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => getBlogPosts({ page_size: "100" }),
  })

  const posts: BlogPost[] = postsData?.results || postsData || []

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
  })

  const columns: ColumnDef<BlogPost>[] = [
    { header: "Title (Tiêu đề)", accessorKey: "title" },
    {
      header: "Status (Trạng thái)",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "success" : "warning"}>
          {row.original.status}
        </Badge>
      ),
    },
    { header: "Category (Danh mục)", accessorKey: "category_name", cell: ({ row }) => row.original.category_name || "-" },
    { header: "Author (Tác giả)", accessorKey: "author_name" },
    {
      header: "Published (Ngày đăng)",
      accessorKey: "published_at",
      cell: ({ row }) => (row.original.published_at ? formatDate(row.original.published_at) : "-"),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingPost(row.original); setShowForm(true) }}>
            <Pencil size={16} className="text-blue-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blogs (Bài viết)</h1>
        <Button onClick={() => { setEditingPost(null); setShowForm(!showForm) }}>
          <Plus size={16} className="mr-1" /> New Post (Bài viết mới)
        </Button>
      </div>
      {showForm && <BlogForm post={editingPost} onClose={() => { setShowForm(false); setEditingPost(null) }} />}
      <DataTable columns={columns} data={posts} />
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
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      onClose()
    },
  })

  const isEditing = !!post

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (isEditing) {
      updateMutation.mutate({ id: post.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Blog Post (Sửa bài viết)" : "New Blog Post (Thêm bài viết)"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Title (Tiêu đề) *</label>
          <input name="title" required defaultValue={post?.title || ""} className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Category (Danh mục)</label>
          <select name="category" defaultValue={post?.category || ""} className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
            <option value="">None (Không)</option>
            {(categories || []).map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status (Trạng thái)</label>
          <select name="status" defaultValue={post?.status || "draft"} className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
            <option value="draft">Draft (Bản nháp)</option>
            <option value="published">Published (Đã xuất bản)</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Excerpt (Mô tả ngắn)</label>
          <textarea name="excerpt" defaultValue={post?.excerpt || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Content (Nội dung) *</label>
          <textarea name="content" required defaultValue={post?.content || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[200px]" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Featured Image URL (Ảnh đại diện)</label>
          <input name="featured_image" defaultValue={post?.featured_image || ""} className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Published At (Ngày xuất bản)</label>
          <input name="published_at" type="datetime-local" defaultValue={post?.published_at ? post.published_at.slice(0, 16) : ""} className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">{isEditing ? "Update Post (Cập nhật)" : "Create Post (Tạo mới)"}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel (Huỷ)</Button>
        </div>
      </form>
    </div>
  )
}
