"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
      <div className="max-w-lg mx-auto">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-lg">
          <span className="material-symbols-outlined text-success text-4xl">check_circle</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg mb-md">Đặt hàng thành công!</h1>
        <p className="text-on-surface-variant mb-lg">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xác nhận đơn hàng trong thời gian sớm nhất.
        </p>
        {orderId && (
          <p className="text-body-sm text-on-surface-variant mb-xl">
            Mã đơn hàng: <span className="font-mono font-semibold text-primary">{orderId.slice(0, 8)}</span>
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
