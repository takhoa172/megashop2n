"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOrder, updateOrderStatus, Order } from "@/services/orders"
import { formatCurrency } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const statusFlow = ["pending", "confirmed", "shipped", "delivered"]

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")

  useEffect(() => {
    if (!id) return
    getOrder(id as string)
      .then((o) => {
        setOrder(o)
        setSelectedStatus(o.status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.status) return
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(order.id, selectedStatus)
      setOrder(updated)
    } catch (err) {
      alert("Cập nhật thất bại")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <p className="text-on-surface-variant">Đang tải...</p>
  }

  if (!order) {
    return <p className="text-on-surface-variant">Không tìm thấy đơn hàng</p>
  }

  const currentIdx = statusFlow.indexOf(order.status)

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-primary text-label-sm hover:underline mb-lg flex items-center gap-xs"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Quay lại
      </button>

      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg">
            Đơn hàng #{order.id.slice(0, 8)}
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-md">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-outline-variant rounded-lg px-md py-sm bg-white text-label-md"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.status}
            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter">
        <div className="flex-1 space-y-lg">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
            <h2 className="font-title-lg text-title-lg mb-md">Trạng thái đơn hàng</h2>
            <div className="flex items-center gap-2">
              {statusFlow.map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`px-md py-sm rounded-lg text-label-sm ${idx <= currentIdx ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}>
                    {statusLabels[s]}
                  </div>
                  {idx < statusFlow.length - 1 && (
                    <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
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

        <div className="lg:w-80 space-y-lg">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl space-y-md">
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

          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
            <h2 className="font-title-lg text-title-lg mb-md">Khách hàng</h2>
            <p className="font-label-md">{order.shipping_name}</p>
            <p className="text-body-sm text-on-surface-variant">{order.shipping_phone}</p>
            <p className="text-body-sm text-on-surface-variant">{order.user_email || order.guest_email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
