"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  X,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard (Tổng quan)", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products (Sản phẩm)", icon: Package },
  { href: "/admin/purchases", label: "Purchases (Nhập hàng)", icon: ShoppingCart },
  { href: "/admin/sales", label: "Sales (Bán hàng)", icon: DollarSign },
  { href: "/admin/blogs", label: "Blogs (Bài viết)", icon: FileText },
  { href: "/admin/reports", label: "Reports (Báo cáo)", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings (Cài đặt)", icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">Inventory</h1>
          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon && <item.icon size={18} />}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
