"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Bell } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Chủ cửa hàng",
    MANAGER: "Quản lý",
    STAFF: "Nhân viên",
    CUSTOMER: "Khách hàng",
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 lg:px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      <div className="h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900 leading-tight">{user?.full_name}</p>
          <p className="text-xs text-slate-500">{roleLabel[user?.role || ""] || user?.role}</p>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-slate-100">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-medium">
            {user?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title="Đăng xuất"
          className="rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
