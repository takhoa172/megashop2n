"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getFooter,
  updateFooter,
  FooterSettings,
  getSiteSettings,
  updateSiteSettings,
  SiteSettings,
} from "@/services/settings"
import { getSliders, createSlider, deleteSlider, Slider } from "@/services/sliders"
import {
  getNotifications,
  createNotification,
  deleteNotification,
  Notification,
} from "@/services/notifications"
import { getUsers, createUser } from "@/services/auth"
import { getCategories, createCategory } from "@/services/categories"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Category } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"

const tabs = ["Site", "Footer", "Sliders (Ảnh trượt)", "Notifications (Thông báo)", "Users (Người dùng)", "Categories (Danh mục)"]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Footer")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings (Cài đặt)</h1>
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Site" && <SiteSettingsTab />}
      {activeTab === "Footer" && <FooterTab />}
      {activeTab === "Sliders" && <SlidersTab />}
      {activeTab === "Notifications" && <NotificationsTab />}
      {activeTab === "Users" && <UsersTab />}
      {activeTab === "Categories" && <CategoriesTab />}
    </div>
  )
}

function FooterTab() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ["footer"], queryFn: getFooter })

  const mutation = useMutation({
    mutationFn: updateFooter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["footer"] }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload: Record<string, string> = {}
    form.forEach((value, key) => {
      payload[key] = value as string
    })
    mutation.mutate(payload)
  }

  if (!data) return <p className="text-sm text-slate-500">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <Field label="Company Name (Tên công ty)" name="company_name" defaultValue={data.company_name} />
      <Field label="Phone (Số điện thoại)" name="phone" defaultValue={data.phone} />
      <Field label="Email" name="email" defaultValue={data.email} />
      <Field label="Facebook URL" name="facebook" defaultValue={data.facebook} />
      <Field label="Youtube URL" name="youtube" defaultValue={data.youtube} />
      <Field label="Copyright (Bản quyền)" name="copyright_text" defaultValue={data.copyright_text} />
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Address (Địa chỉ)</label>
        <textarea name="address" defaultValue={data.address || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Description (Mô tả)</label>        <textarea name="description" defaultValue={data.description || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={mutation.isPending}>
          Save Footer (Lưu)
        </Button>
      </div>
    </form>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Input name={name} defaultValue={defaultValue || ""} />
    </div>
  )
}

function SiteSettingsTab() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site-settings"] }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload: Record<string, string> = {
      site_name: form.get("site_name") as string,
      site_logo_url: form.get("site_logo_url") as string,
      meta_description: form.get("meta_description") as string,
    }
    mutation.mutate(payload)
  }

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  if (!data) return <p className="text-sm text-slate-500">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <Field label="Site Name (Tên trang)" name="site_name" defaultValue={data.site_name} />
      <div className="space-y-1">
        <label className="text-sm font-medium">Logo URL (hoặc tải ảnh lên)</label>
        <input
          name="site_logo_url"
          defaultValue={data.site_logo_url || ""}
          placeholder="https://..."
          className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoFile}
          className="flex h-9 rounded-md border border-slate-200 px-3 text-sm mt-1"
        />
        {(logoPreview || data.site_logo_url) && (
          <div className="mt-1">
            <img
              src={logoPreview || data.site_logo_url}
              alt="Logo preview"
              className="w-32 h-16 object-contain rounded border"
            />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Meta Description (Mô tả SEO)</label>
        <textarea
          name="meta_description"
          defaultValue={data.meta_description || ""}
          className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        Save Site Settings (Lưu)
      </Button>
    </form>
  )
}

function SlidersTab() {
  const queryClient = useQueryClient()
  const { data: sliders } = useQuery({
    queryKey: ["sliders"],
    queryFn: () => getSliders(true),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSlider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sliders"] }),
  })

  const createMutation = useMutation({
    mutationFn: createSlider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sliders"] }),
  })

  const [sliderPreview, setSliderPreview] = useState<string | null>(null)
  const [sliderUrl, setSliderUrl] = useState("")

  const handleSliderFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSliderPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const columns: ColumnDef<Slider>[] = [
    { header: "Title (Tiêu đề)", accessorKey: "title", cell: ({ row }) => row.original.title || "-" },
    {
      header: "Image (Ảnh)",
      accessorKey: "image_url",
      cell: ({ row }) => row.original.image_url ? (
        <img src={row.original.image_url} alt="" className="w-16 h-10 object-cover rounded" />
      ) : "-",
    },
    {
      header: "Active (Kích hoạt)",
      accessorKey: "is_active",
      cell: ({ row }) => (row.original.is_active ? "✅" : "❌"),
    },
    { header: "Order (Thứ tự)", accessorKey: "sort_order" },
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

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (!form.get("image_url") && !sliderPreview) return
    createMutation.mutate(form)
    e.currentTarget.reset()
    setSliderPreview(null)
    setSliderUrl("")
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title (Tiêu đề)</label>
          <input name="title" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Image URL (hoặc tải ảnh lên)</label>
          <input
            name="image_url"
            value={sliderUrl}
            onChange={(e) => setSliderUrl(e.target.value)}
            placeholder="https://..."
            className="flex h-9 rounded-md border border-slate-200 px-3 text-sm w-64"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleSliderFile}
            className="flex h-9 rounded-md border border-slate-200 px-3 text-sm w-64 mt-1"
          />
          {sliderPreview && (
            <div className="mt-1">
              <img src={sliderPreview} alt="Preview" className="w-32 h-20 object-cover rounded border" />
              <button
                type="button"
                onClick={() => setSliderPreview(null)}
                className="text-xs text-red-500 mt-1 hover:underline"
              >
                Remove (Xoá)
              </button>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Link URL</label>
          <input name="link_url" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Order (Thứ tự)</label>
          <input name="sort_order" type="number" defaultValue={0} className="flex h-9 w-20 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <Button type="submit" size="sm">Add Slider (Thêm)</Button>
      </form>
      <DataTable columns={columns} data={sliders || []} />
    </div>
  )
}

function NotificationsTab() {
  const queryClient = useQueryClient()
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const columns: ColumnDef<Notification>[] = [
    { header: "Title (Tiêu đề)", accessorKey: "title" },
    { header: "Active (Kích hoạt)", accessorKey: "is_active", cell: ({ row }) => (row.original.is_active ? "✅" : "❌") },
    { header: "Start (Bắt đầu)", accessorKey: "start_date" },
    { header: "End (Kết thúc)", accessorKey: "end_date", cell: ({ row }) => row.original.end_date || "∞" },
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

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    createMutation.mutate({
      title: form.get("title") as string,
      message: form.get("message") as string,
      is_active: true,
      start_date: new Date().toISOString(),
    })
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title (Tiêu đề) *</label>
          <input name="title" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Message (Nội dung) *</label>
          <input name="message" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <Button type="submit" size="sm">Add Notification (Thêm)</Button>
      </form>
      <DataTable columns={columns} data={notifications || []} />
    </div>
  )
}

function UsersTab() {
  const queryClient = useQueryClient()
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers })
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })

  const columns: ColumnDef<User>[] = [
    { header: "Name (Tên)", accessorKey: "full_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role (Vai trò)", accessorKey: "role" },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({
      email: form.get("email") as string,
      username: form.get("username") as string,
      full_name: form.get("full_name") as string,
      password: form.get("password") as string,
      role: form.get("role") as "STAFF" | "MANAGER",
    })
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
        <input name="email" placeholder="Email" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="username" placeholder="Username (Tên đăng nhập)" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="full_name" placeholder="Full Name (Họ tên)" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="password" type="password" placeholder="Password (Mật khẩu)" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <select name="role" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm">
          <option value="STAFF">Staff (Nhân viên)</option>
          <option value="MANAGER">Manager (Quản lý)</option>
        </select>
        <Button type="submit" size="sm">Add User (Thêm)</Button>
      </form>
      <DataTable columns={columns} data={users || []} />
    </div>
  )
}

function CategoriesTab() {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories })
  const mutation = useMutation({
    mutationFn: ({ name }: { name: string }) => createCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })

  const columns: ColumnDef<Category>[] = [
    { header: "Name (Tên)", accessorKey: "name" },
    { header: "Slug (Đường dẫn)", accessorKey: "slug" },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({ name: form.get("name") as string })
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <input name="name" placeholder="Category Name (Tên danh mục)" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <Button type="submit" size="sm">Add Category (Thêm)</Button>
      </form>
      <DataTable columns={columns} data={categories || []} />
    </div>
  )
}
