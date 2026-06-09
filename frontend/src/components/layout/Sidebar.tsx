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
  ClipboardList,
  X,
  Store,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] },
  { href: "/admin/products", label: "Sản phẩm", icon: Package, roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] },
  { href: "/admin/purchases", label: "Nhập hàng", icon: ShoppingCart, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/sales", label: "Bán hàng", icon: DollarSign, roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] },
  { href: "/admin/orders", label: "Đơn hàng", icon: ClipboardList, roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] },
  { href: "/admin/blogs", label: "Bài viết", icon: FileText, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings, roles: ["SUPER_ADMIN"] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  role?: string
}

export function Sidebar({ open, onClose, role }: SidebarProps) {
  const pathname = usePathname()
  const filteredItems = navItems.filter((item) => role && item.roles.includes(role))
  const showHomeLink = role === "SUPER_ADMIN"

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
          "fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">VIETSHOP</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Quản lý cửa hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600/20 text-blue-300 shadow-sm"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-blue-400" : "text-slate-400"
                )} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {showHomeLink && (
          <div className="shrink-0 p-4 border-t border-slate-700/50">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <Store size={16} />
              Về trang chủ
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
