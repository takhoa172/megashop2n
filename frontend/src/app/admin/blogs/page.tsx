"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBlogPosts, createBlogPost, deleteBlogPost } from "@/services/blogs"
import { getBlogCategories, createBlogCategory } from "@/services/blogs"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogPost } from "@/types"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

export default function BlogsPage() {
  const [showForm, setShowForm] = useState(false)
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
    { header: "Title", accessorKey: "title" },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "success" : "warning"}>
          {row.original.status}
        </Badge>
      ),
    },
    { header: "Category", accessorKey: "category_name", cell: ({ row }) => row.original.category_name || "-" },
    { header: "Author", accessorKey: "author_name" },
    {
      header: "Published",
      accessorKey: "published_at",
      cell: ({ row }) => (row.original.published_at ? formatDate(row.original.published_at) : "-"),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
          <Trash2 size={16} className="text-red-500" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" /> New Post
        </Button>
      </div>
      {showForm && <BlogForm onClose={() => setShowForm(false)} />}
      <DataTable columns={columns} data={posts} />
    </div>
  )
}

function BlogForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
  })

  const mutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate(form)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">New Blog Post</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Title *</label>
          <input name="title" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>
          <select name="category" className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
            <option value="">None</option>
            {(categories || []).map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select name="status" className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Excerpt</label>
          <textarea name="excerpt" className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Content *</label>
          <textarea name="content" required className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[200px]" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Featured Image URL</label>
          <input name="featured_image" className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Published At</label>
          <input name="published_at" type="datetime-local" className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Create Post</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
