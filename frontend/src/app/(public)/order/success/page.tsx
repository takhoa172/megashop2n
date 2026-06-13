"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getOrder } from "@/services/orders"
import { formatCurrency } from "@/lib/utils"

interface OrderInfo {
  id: string
  total: string
  payment_method: string
  payment_status: string
  status: string
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("id")
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      setLoading(false)
      return
    }

    getOrder(orderId)
      .then((data) => {
        setOrder({
          id: data.id,
          total: data.total,
          payment_method: data.payment_method === "vnpay" ? "VNPay" : "COD",
          payment_status: data.payment_status,
          status: data.status,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
      <div className="max-w-[32rem] mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-lg">
          <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg mb-md">Đặt hàng thành công!</h1>
        <p className="text-on-surface-variant mb-lg">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xác nhận đơn hàng trong thời gian sớm nhất.
        </p>

        {loading ? (
          <p className="text-on-surface-variant mb-xl">Đang tải thông tin đơn hàng...</p>
        ) : order ? (
          <div className="bg-surface-container-low rounded-xl p-lg mb-xl text-left space-y-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mã đơn</span>
              <span className="font-mono font-semibold">#{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tổng tiền</span>
              <span className="font-semibold text-primary">{formatCurrency(Number(order.total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Phương thức TT</span>
              <span>{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Trạng thái TT</span>
              <span className={order.payment_status === "paid" ? "text-green-600 font-semibold" : "text-yellow-600"}>
                {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant mb-xl">
            Mã đơn hàng: <span className="font-mono font-semibold text-primary">{(orderId || "").slice(0, 8)}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link
            href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
            className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-lg hover:bg-primary/90 transition-all"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/products"
            className="border border-outline-variant text-primary px-lg py-md rounded-xl font-label-lg hover:bg-surface-container-low transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-3xl text-on-surface-variant">Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
