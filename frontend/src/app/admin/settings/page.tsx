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

const tabs = [
  { key: "Site", label: "Site" },
  { key: "Footer", label: "Footer" },
  { key: "Sliders", label: "Sliders (Ảnh trượt)" },
  { key: "Notifications", label: "Notifications (Thông báo)" },
  { key: "Users", label: "Users (Người dùng)" },
  { key: "Categories", label: "Categories (Danh mục)" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Footer")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings (Cài đặt)</h1>
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Input name={name} defaultValue={defaultValue || ""} />
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
    <Card>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Company Name (Tên công ty)" name="company_name" defaultValue={data.company_name} />
        <Field label="Phone (Số điện thoại)" name="phone" defaultValue={data.phone} />
        <Field label="Email" name="email" defaultValue={data.email} />
        <Field label="Facebook URL" name="facebook" defaultValue={data.facebook} />
        <Field label="Youtube URL" name="youtube" defaultValue={data.youtube} />
        <Field label="Copyright (Bản quyền)" name="copyright_text" defaultValue={data.copyright_text} />
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Address (Địa chỉ)</label>
          <textarea
            name="address"
            defaultValue={data.address || ""}
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Description (Mô tả)</label>
          <textarea
            name="description"
            defaultValue={data.description || ""}
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white hover:bg-primary/90">
            {mutation.isPending ? "Đang lưu..." : "Lưu Footer"}
          </Button>
        </div>
      </form>
    </Card>
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
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Tên trang web (Site Name)" name="site_name" defaultValue={data.site_name} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Logo URL (hoặc tải ảnh lên)</label>
          <Input
            name="site_logo_url"
            defaultValue={data.site_logo_url || ""}
            placeholder="https://..."
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoFile}
            className="mt-2 flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 transition-colors"
          />
          {(logoPreview || data.site_logo_url) && (
            <div className="mt-2">
              <img
                src={logoPreview || data.site_logo_url}
                alt="Logo preview"
                className="w-32 h-16 object-contain rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mô tả SEO (Meta Description)</label>
          <textarea
            name="meta_description"
            defaultValue={data.meta_description || ""}
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white hover:bg-primary/90">
          {mutation.isPending ? "Đang lưu..." : "Lưu Cài đặt"}
        </Button>
      </form>
    </Card>
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
    { header: "Tiêu đề", accessorKey: "title", cell: ({ row }) => row.original.title || "-" },
    {
      header: "Ảnh",
      accessorKey: "image_url",
      cell: ({ row }) => row.original.image_url ? (
        <img src={row.original.image_url} alt="" className="w-16 h-10 object-cover rounded" />
      ) : "-",
    },
    {
      header: "Kích hoạt",
      accessorKey: "is_active",
      cell: ({ row }) => (row.original.is_active ? "✅" : "❌"),
    },
    { header: "Thứ tự", accessorKey: "sort_order" },
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
    <Card>
      <div className="space-y-4">
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tiêu đề</label>
            <Input name="title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Image URL</label>
            <Input
              name="image_url"
              value={sliderUrl}
              onChange={(e) => setSliderUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleSliderFile}
              className="mt-1"
            />
            {sliderPreview && (
              <div className="mt-1">
                <img src={sliderPreview} alt="Preview" className="w-32 h-20 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setSliderPreview(null)}
                  className="text-xs text-red-500 mt-1 hover:underline"
                >
                  Xoá
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Link URL</label>
            <Input name="link_url" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Thứ tự</label>
            <Input name="sort_order" type="number" defaultValue={0} />
          </div>
          <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
            Thêm Slider
          </Button>
        </form>
        <DataTable columns={columns} data={sliders || []} />
      </div>
    </Card>
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
    { header: "Tiêu đề", accessorKey: "title" },
    { header: "Kích hoạt", accessorKey: "is_active", cell: ({ row }) => (row.original.is_active ? "✅" : "❌") },
    { header: "Bắt đầu", accessorKey: "start_date" },
    { header: "Kết thúc", accessorKey: "end_date", cell: ({ row }) => row.original.end_date || "∞" },
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
    <Card>
      <div className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
            <Input name="title" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nội dung *</label>
            <Input name="message" required />
          </div>
          <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
            Thêm Thông báo
          </Button>
        </form>
        <DataTable columns={columns} data={notifications || []} />
      </div>
    </Card>
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
    { header: "Họ tên", accessorKey: "full_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Vai trò", accessorKey: "role" },
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
    <Card>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
          <Input name="email" placeholder="Email" required />
          <Input name="username" placeholder="Tên đăng nhập" required />
          <Input name="full_name" placeholder="Họ tên" required />
          <Input name="password" type="password" placeholder="Mật khẩu" required />
          <select name="role" className="flex h-9 rounded-lg border border-slate-200 px-3 text-sm bg-white">
            <option value="STAFF">Nhân viên</option>
            <option value="MANAGER">Quản lý</option>
          </select>
          <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
            Thêm Người dùng
          </Button>
        </form>
        <DataTable columns={columns} data={users || []} />
      </div>
    </Card>
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
    { header: "Tên", accessorKey: "name" },
    { header: "Đường dẫn", accessorKey: "slug" },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({ name: form.get("name") as string })
    e.currentTarget.reset()
  }

  return (
    <Card>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <Input name="name" placeholder="Tên danh mục" required />
          <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
            Thêm Danh mục
          </Button>
        </form>
        <DataTable columns={columns} data={categories || []} />
      </div>
    </Card>
  )
}
