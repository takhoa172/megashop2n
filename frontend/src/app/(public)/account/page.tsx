"use client"

import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function AccountPage() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center py-3xl px-margin-mobile md:px-margin-desktop bg-background">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-md">Vui lòng đăng nhập</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Bạn cần đăng nhập để xem thông tin tài khoản</p>
          <Link href="/login" className="bg-primary text-white font-label-lg px-3xl py-md rounded-xl hover:bg-primary/80 transition-all">
            Đăng nhập ngay
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow py-2xl px-margin-mobile md:px-margin-desktop bg-background">
      <div className="max-w-container-max mx-auto">
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-2xl">Tài khoản của tôi</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-1">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-xl shadow-sm">
              <div className="flex items-center gap-md mb-lg">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">person</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-background">{user.full_name}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{user.email}</p>
                </div>
              </div>
              <Link
                href="/account/orders"
                className="w-full bg-surface-container-low text-primary font-label-lg py-md rounded-xl hover:bg-primary/10 transition-all flex items-center justify-center gap-sm mb-md"
              >
                <span className="material-symbols-outlined">receipt_long</span>
                Đơn hàng của tôi
              </Link>
              <button
                onClick={logout}
                className="w-full bg-red-50 text-red-600 font-label-lg py-md rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-xl shadow-sm">
              <h2 className="font-title-lg text-title-lg text-on-background mb-lg">Thông tin cá nhân</h2>
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Họ tên</label>
                    <p className="font-body-md text-body-md text-on-background">{user.full_name}</p>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Email</label>
                    <p className="font-body-md text-body-md text-on-background">{user.email}</p>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Số điện thoại</label>
                    <p className="font-body-md text-body-md text-on-background">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Vai trò</label>
                    <p className="font-body-md text-body-md text-on-background">{user.role || "Khách hàng"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
