"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getFooter,
  updateFooter,
  FooterSettings,
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

const tabs = ["Footer", "Sliders", "Notifications", "Users", "Categories"]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Footer")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
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
      <Field label="Company Name" name="company_name" defaultValue={data.company_name} />
      <Field label="Phone" name="phone" defaultValue={data.phone} />
      <Field label="Email" name="email" defaultValue={data.email} />
      <Field label="Facebook URL" name="facebook" defaultValue={data.facebook} />
      <Field label="Youtube URL" name="youtube" defaultValue={data.youtube} />
      <Field label="Copyright" name="copyright_text" defaultValue={data.copyright_text} />
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Address</label>
        <textarea name="address" defaultValue={data.address || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Description</label>
        <textarea name="description" defaultValue={data.description || ""} className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[60px]" />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={mutation.isPending}>
          Save Footer
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

  const columns: ColumnDef<Slider>[] = [
    { header: "Title", accessorKey: "title", cell: ({ row }) => row.original.title || "-" },
    {
      header: "Active",
      accessorKey: "is_active",
      cell: ({ row }) => (row.original.is_active ? "✅" : "❌"),
    },
    { header: "Order", accessorKey: "sort_order" },
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
    createMutation.mutate(form)
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input name="title" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Image URL *</label>
          <input name="image_url" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Link URL</label>
          <input name="link_url" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Order</label>
          <input name="sort_order" type="number" defaultValue={0} className="flex h-9 w-20 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <Button type="submit" size="sm">Add Slider</Button>
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
    { header: "Title", accessorKey: "title" },
    { header: "Active", accessorKey: "is_active", cell: ({ row }) => (row.original.is_active ? "✅" : "❌") },
    { header: "Start", accessorKey: "start_date" },
    { header: "End", accessorKey: "end_date", cell: ({ row }) => row.original.end_date || "∞" },
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
          <label className="text-sm font-medium">Title *</label>
          <input name="title" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Message *</label>
          <input name="message" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <Button type="submit" size="sm">Add Notification</Button>
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
    { header: "Name", accessorKey: "full_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
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
        <input name="username" placeholder="Username" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="full_name" placeholder="Full Name" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="password" type="password" placeholder="Password" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <select name="role" className="flex h-9 rounded-md border border-slate-200 px-3 text-sm">
          <option value="STAFF">Staff</option>
          <option value="MANAGER">Manager</option>
        </select>
        <Button type="submit" size="sm">Add User</Button>
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
    { header: "Name", accessorKey: "name" },
    { header: "Slug", accessorKey: "slug" },
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
        <input name="name" placeholder="Category Name" required className="flex h-9 rounded-md border border-slate-200 px-3 text-sm" />
        <Button type="submit" size="sm">Add Category</Button>
      </form>
      <DataTable columns={columns} data={categories || []} />
    </div>
  )
}
