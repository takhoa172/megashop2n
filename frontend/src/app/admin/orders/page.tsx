"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllOrders, Order } from "@/services/orders"
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter
    ? orders.filter((o) => o.status === filter)
    : orders

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <h1 className="font-headline-lg text-headline-lg mb-lg">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-sm mb-lg">
        <button
          onClick={() => setFilter("")}
          className={`px-md py-sm rounded-lg text-label-sm transition-colors ${!filter ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-outline-variant"}`}
        >
          Tất cả ({orders.length})
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-md py-sm rounded-lg text-label-sm transition-colors ${filter === key ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-outline-variant"}`}
          >
            {label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-on-surface-variant">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-on-surface-variant">Không có đơn hàng</p>
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-label-md text-on-surface-variant">
                  <th className="p-md">Mã đơn</th>
                  <th className="p-md">Khách hàng</th>
                  <th className="p-md">SĐT</th>
                  <th className="p-md">Tổng tiền</th>
                  <th className="p-md">Thanh toán</th>
                  <th className="p-md">Trạng thái</th>
                  <th className="p-md">Ngày</th>
                  <th className="p-md"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-t border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-md font-mono text-label-sm">#{order.id.slice(0, 8)}</td>
                    <td className="p-md">
                      <p className="font-label-md">{order.shipping_name}</p>
                      <p className="text-label-sm text-on-surface-variant">{order.user_email || order.guest_email}</p>
                    </td>
                    <td className="p-md text-body-sm">{order.shipping_phone}</td>
                    <td className="p-md font-semibold">{formatCurrency(Number(order.total))}</td>
                    <td className="p-md">
                      <span className={`px-sm py-0.5 rounded-full text-label-sm ${order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {order.payment_status === "paid" ? "Đã thanh toán" : "COD"}
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`px-sm py-0.5 rounded-full text-label-sm ${statusColors[order.status] || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-md text-label-sm text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-md">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary text-label-sm hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
