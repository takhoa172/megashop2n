"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getOrders, Order } from "@/services/orders"
import { formatCurrency } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrderHistoryPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <p className="text-on-surface-variant">Vui lòng đăng nhập để xem đơn hàng</p>
        <Link href="/login?redirect=/account/orders" className="text-primary font-label-md hover:underline mt-md inline-block">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl">
      <h1 className="font-headline-lg text-headline-lg mb-2xl">Đơn hàng của tôi</h1>

      {loading ? (
        <p className="text-on-surface-variant">Đang tải...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-3xl">
          <p className="text-on-surface-variant mb-lg">Bạn chưa có đơn hàng nào</p>
          <Link href="/products" className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-lg hover:bg-primary/90 transition-all inline-block">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-md">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-xl border border-outline-variant p-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-sm">
                <span className="font-mono text-body-sm text-on-surface-variant">
                  #{order.id.slice(0, 8)}
                </span>
                <span className={`px-sm py-0.5 rounded-full text-label-sm ${statusColors[order.status] || ""}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-label-sm text-on-surface-variant">+{order.items.length - 3}</span>
                  )}
                </div>
                <span className="font-semibold text-primary">{formatCurrency(Number(order.total))}</span>
              </div>
              <p className="text-label-sm text-on-surface-variant mt-sm">
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
