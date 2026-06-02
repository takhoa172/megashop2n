"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="text-right text-sm">
          <p className="font-medium">{user?.full_name}</p>
          <p className="text-slate-500 text-xs">{user?.role}</p>
        </div>
        <Avatar>
          <AvatarFallback>{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
