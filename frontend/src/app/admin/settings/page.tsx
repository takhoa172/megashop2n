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
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { User, Category } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Plus, Settings, Image, Bell, Users, Tag, Layout } from "lucide-react"
import { toast } from "sonner"

const tabs = [
  { key: "Site", label: "Site", icon: Settings },
  { key: "Footer", label: "Footer", icon: Layout },
  { key: "Sliders", label: "Ảnh trượt", icon: Image },
  { key: "Notifications", label: "Thông báo", icon: Bell },
  { key: "Users", label: "Người dùng", icon: Users },
  { key: "Categories", label: "Danh mục", icon: Tag },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Footer")

  return (
    <div className="space-y-6">
      <PageHeader title="Cài đặt" description="Quản lý cấu hình cửa hàng" />

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {activeTab === "Site" && <SiteSettingsTab />}
        {activeTab === "Footer" && <FooterTab />}
        {activeTab === "Sliders" && <SlidersTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
        {activeTab === "Users" && <UsersTab />}
        {activeTab === "Categories" && <CategoriesTab />}
      </div>
    </div>
  )
}

function useSettingsForm<T>(queryKey: string[], queryFn: () => Promise<T>, updateFn: (data: Record<string, string>) => Promise<unknown>) {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey, queryFn })
  const mutation = useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success("Đã lưu cài đặt")
    },
    onError: () => toast.error("Không thể lưu cài đặt"),
  })
  return { data, mutation, isPending: mutation.isPending }
}

function SiteSettingsTab() {
  const { data, mutation } = useSettingsForm<SiteSettings>(
    ["site-settings"], getSiteSettings, updateSiteSettings
  )
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    mutation.mutate({
      site_name: form.get("site_name") as string,
      site_logo_url: form.get("site_logo_url") as string,
      meta_description: form.get("meta_description") as string,
    })
  }

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  if (!data) return <p className="text-sm text-slate-400">Đang tải...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-[42rem]">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tên trang web *</label>
        <Input name="site_name" defaultValue={data.site_name} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Logo</label>
        <Input name="site_logo_url" defaultValue={data.site_logo_url || ""} placeholder="https://..." />
        <input type="file" accept="image/*" onChange={handleLogoFile}
          className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {(logoPreview || data.site_logo_url) && (
          <img src={logoPreview || data.site_logo_url} alt=""
            className="w-32 h-16 object-contain rounded-lg border border-slate-200 mt-2" />
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mô tả SEO</label>
        <textarea name="meta_description" defaultValue={data.meta_description || ""} rows={3}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <button type="submit" disabled={mutation.isPending}
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {mutation.isPending ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
    </form>
  )
}

function FooterTab() {
  const { data, mutation } = useSettingsForm<FooterSettings>(
    ["footer"], getFooter, updateFooter
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload: Record<string, string> = {}
    form.forEach((value, key) => { payload[key] = value as string })
    mutation.mutate(payload)
  }

  if (!data) return <p className="text-sm text-slate-400">Đang tải...</p>

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[42rem]">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tên công ty</label>
        <Input name="company_name" defaultValue={data.company_name} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
        <input name="phone" defaultValue={data.phone ?? ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input name="email" defaultValue={data.email ?? ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Facebook URL</label>
        <input name="facebook" defaultValue={data.facebook ?? ""} placeholder="https://facebook.com/..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Youtube URL</label>
        <input name="youtube" defaultValue={data.youtube ?? ""} placeholder="https://youtube.com/..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Twitter / X URL</label>
        <input name="twitter" defaultValue={data.twitter ?? ""} placeholder="https://x.com/..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Instagram URL</label>
        <input name="instagram" defaultValue={data.instagram ?? ""} placeholder="https://instagram.com/..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Bản quyền</label>
        <input name="copyright_text" defaultValue={data.copyright_text ?? ""}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="md:col-span-2 space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
        <textarea name="address" defaultValue={data.address ?? ""} rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="md:col-span-2 space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mô tả</label>
        <textarea name="description" defaultValue={data.description ?? ""} rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="md:col-span-2">
        <button type="submit" disabled={mutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {mutation.isPending ? "Đang lưu..." : "Lưu footer"}
        </button>
      </div>
    </form>
  )
}

function SlidersTab() {
  const queryClient = useQueryClient()
  const { data: sliders } = useQuery({
    queryKey: ["sliders"],
    queryFn: () => getSliders(true),
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: deleteSlider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] })
      toast.success("Đã xoá slider")
      setDeleteId(null)
    },
    onError: () => toast.error("Không thể xoá slider"),
  })

  const createMutation = useMutation({
    mutationFn: createSlider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] })
      toast.success("Đã thêm slider")
      setShowForm(false)
    },
    onError: () => toast.error("Không thể thêm slider"),
  })

  const columns: ColumnDef<Slider>[] = [
    { header: "Tiêu đề", accessorKey: "title", cell: ({ row }) => row.original.title || "—" },
    {
      header: "Phụ đề",
      accessorKey: "subtitle",
      cell: ({ row }) => (row.original as any).subtitle || "—",
    },
    {
      header: "Ảnh",
      accessorKey: "image_url",
      cell: ({ row }) => row.original.image_url ? (
        <img src={row.original.image_url} alt="" className="w-20 h-12 object-cover rounded-lg" />
      ) : "—",
    },
    {
      header: "Kích hoạt",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          row.original.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}>
          {row.original.is_active ? "Hoạt động" : "Tắt"}
        </span>
      ),
    },
    { header: "Thứ tự", accessorKey: "sort_order" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button onClick={() => setDeleteId(row.original.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
          <Trash2 size={15} />
        </button>
      ),
      enableSorting: false,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Quản lý ảnh trượt</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Thêm slider
        </button>
      </div>
      <DataTable columns={columns} data={sliders || []} pageSize={5} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Thêm slider mới">
        <SliderForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xoá slider"
        message="Bạn có chắc muốn xoá slider này?"
        confirmText="Xoá"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

function SliderForm({ onSubmit, loading }: { onSubmit: (data: FormData) => void; loading: boolean }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (!form.get("image_url") && !preview) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tiêu đề</label>
        <input name="title" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Phụ đề</label>
        <input name="subtitle" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Image URL</label>
        <input name="image_url" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" placeholder="https://..." />
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) { const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(file) }
        }}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {preview && <img src={preview} alt="" className="w-32 h-20 object-cover rounded-lg border mt-2" />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Link URL</label>
          <input name="link_url" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Thứ tự</label>
          <input name="sort_order" type="number" defaultValue={0}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? "Đang thêm..." : "Thêm slider"}
        </button>
      </div>
    </form>
  )
}

function NotificationsTab() {
  const queryClient = useQueryClient()
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Đã xoá thông báo")
      setDeleteId(null)
    },
    onError: () => toast.error("Không thể xoá thông báo"),
  })

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Đã thêm thông báo")
      setShowForm(false)
    },
    onError: () => toast.error("Không thể thêm thông báo"),
  })

  const columns: ColumnDef<Notification>[] = [
    { header: "Tiêu đề", accessorKey: "title" },
    { header: "Nội dung", accessorKey: "message" },
    {
      header: "Kích hoạt",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          row.original.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}>
          {row.original.is_active ? "Bật" : "Tắt"}
        </span>
      ),
    },
    { header: "Bắt đầu", accessorKey: "start_date" },
    { header: "Kết thúc", accessorKey: "end_date", cell: ({ row }) => row.original.end_date || "—" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button onClick={() => setDeleteId(row.original.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
          <Trash2 size={15} />
        </button>
      ),
      enableSorting: false,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Quản lý thông báo</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Thêm thông báo
        </button>
      </div>
      <DataTable columns={columns} data={notifications || []} pageSize={5} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Thêm thông báo mới">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          createMutation.mutate({
            title: form.get("title") as string,
            message: form.get("message") as string,
            is_active: true,
            start_date: new Date().toISOString(),
          })
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
            <input name="title" required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nội dung *</label>
            <textarea name="message" required rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {createMutation.isPending ? "Đang thêm..." : "Thêm thông báo"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xoá thông báo"
        message="Bạn có chắc muốn xoá thông báo này?"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

function UsersTab() {
  const queryClient = useQueryClient()
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers })
  const [showForm, setShowForm] = useState(false)

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Đã thêm người dùng")
      setShowForm(false)
    },
    onError: () => toast.error("Không thể thêm người dùng"),
  })

  const columns: ColumnDef<User>[] = [
    { header: "Họ tên", accessorKey: "full_name" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Vai trò",
      accessorKey: "role",
      cell: ({ row }) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          row.original.role === "MANAGER" ? "bg-purple-100 text-purple-700" :
          row.original.role === "STAFF" ? "bg-blue-100 text-blue-700" :
          "bg-slate-100 text-slate-600"
        }`}>
          {row.original.role === "MANAGER" ? "Quản lý" :
           row.original.role === "STAFF" ? "Nhân viên" : row.original.role}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Quản lý người dùng</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>
      <DataTable columns={columns} data={users || []} pageSize={5} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Thêm người dùng mới">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          mutation.mutate({
            email: form.get("email") as string,
            username: form.get("username") as string,
            full_name: form.get("full_name") as string,
            password: form.get("password") as string,
            role: form.get("role") as "STAFF" | "MANAGER",
          })
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <input name="email" type="email" required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tên đăng nhập *</label>
              <input name="username" required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Họ tên *</label>
              <input name="full_name" required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mật khẩu *</label>
              <input name="password" type="password" required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Vai trò</label>
            <select name="role"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white">
              <option value="STAFF">Nhân viên</option>
              <option value="MANAGER">Quản lý</option>
            </select>
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {mutation.isPending ? "Đang thêm..." : "Thêm người dùng"}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function CategoriesTab() {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories })
  const [showForm, setShowForm] = useState(false)

  const mutation = useMutation({
    mutationFn: ({ name }: { name: string }) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Đã thêm danh mục")
      setShowForm(false)
    },
    onError: () => toast.error("Không thể thêm danh mục"),
  })

  const columns: ColumnDef<Category>[] = [
    { header: "Tên danh mục", accessorKey: "name" },
    { header: "Đường dẫn (Slug)", accessorKey: "slug" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Quản lý danh mục</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>
      <DataTable columns={columns} data={categories || []} pageSize={5} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Thêm danh mục mới">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          mutation.mutate({ name: form.get("name") as string })
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tên danh mục *</label>
            <input name="name" required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {mutation.isPending ? "Đang thêm..." : "Thêm danh mục"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
