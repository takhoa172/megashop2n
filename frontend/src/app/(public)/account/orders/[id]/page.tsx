"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getOrder, Order } from "@/services/orders"
import { formatCurrency } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const statusTimeline = ["pending", "confirmed", "shipped", "delivered"]

export default function OrderDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !id) return
    getOrder(id as string)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, id])

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <p className="text-on-surface-variant">Vui lòng đăng nhập</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <p className="text-on-surface-variant">Đang tải...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <p className="text-on-surface-variant mb-lg">Không tìm thấy đơn hàng</p>
        <Link href="/account/orders" className="text-primary hover:underline">Quay lại</Link>
      </div>
    )
  }

  const currentIdx = statusTimeline.indexOf(order.status)

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl">
      <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-lg">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/account/orders" className="hover:text-primary">Đơn hàng</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-semibold">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-gutter">
        <div className="flex-1 space-y-lg">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
            <h1 className="font-headline-lg text-headline-lg mb-md">
              Đơn hàng #{order.id.slice(0, 8)}
            </h1>
            <p className="text-body-sm text-on-surface-variant mb-lg">
              Đặt ngày: {new Date(order.created_at).toLocaleDateString("vi-VN")}
            </p>

            <div className="flex items-center gap-4 mb-lg">
              <span className={`px-sm py-0.5 rounded-full text-label-sm bg-blue-100 text-blue-800`}>
                {statusLabels[order.status] || order.status}
              </span>
              <span className={`px-sm py-0.5 rounded-full text-label-sm ${order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>

            <div className="space-y-sm mb-xl">
              {statusTimeline.map((s, idx) => (
                <div key={s} className="flex items-center gap-md">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${idx <= currentIdx ? "bg-primary text-white" : "bg-outline-variant text-on-surface-variant"}`}>
                    {idx < currentIdx ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <span className={idx <= currentIdx ? "font-semibold" : "text-on-surface-variant"}>
                    {statusLabels[s]}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="font-title-lg text-title-lg mb-md">Sản phẩm</h2>
            <div className="space-y-md">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                    {item.product_image && (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md truncate">{item.product_name}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatCurrency(Number(item.unit_price))} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold flex-shrink-0">{formatCurrency(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl space-y-md sticky top-28">
            <h2 className="font-title-lg text-title-lg">Thông tin giao hàng</h2>
            <div>
              <p className="font-label-md">{order.shipping_name}</p>
              <p className="text-body-sm text-on-surface-variant">{order.shipping_phone}</p>
              <p className="text-body-sm text-on-surface-variant">{order.shipping_address}</p>
            </div>
            {order.note && (
              <div>
                <p className="font-label-md">Ghi chú</p>
                <p className="text-body-sm text-on-surface-variant">{order.note}</p>
              </div>
            )}
            <div className="border-t border-outline-variant pt-md space-y-sm">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Tạm tính</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Phí vận chuyển</span>
                <span>{formatCurrency(Number(order.shipping_fee))}</span>
              </div>
              <div className="flex justify-between font-title-lg text-title-lg border-t border-outline-variant pt-md">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
