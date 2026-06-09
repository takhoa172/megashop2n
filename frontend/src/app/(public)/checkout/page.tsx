"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { createOrder } from "@/services/orders"
import { initPayment } from "@/services/payment"
import { formatCurrency } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()

  const [shippingName, setShippingName] = useState(user?.full_name || "")
  const [shippingPhone, setShippingPhone] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [note, setNote] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!user) {
    router.push("/login?redirect=/checkout")
    return null
  }

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <h1 className="font-headline-lg text-headline-lg mb-lg">Giỏ hàng trống</h1>
        <p className="text-on-surface-variant mb-lg">Không có sản phẩm để thanh toán</p>
        <Link href="/products" className="text-primary font-label-md hover:underline">
          Mua sắm ngay
        </Link>
      </div>
    )
  }

  const shippingFee = total >= 500000 ? 0 : 30000
  const grandTotal = total + shippingFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const order = await createOrder({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        note,
        payment_method: paymentMethod,
      })

      clearCart()

      if (paymentMethod === "vnpay") {
        const { payment_url } = await initPayment(order.id, "vnpay")
        window.location.href = payment_url
      } else {
        router.push(`/order/success?id=${order.id}`)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Đặt hàng thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl">
      <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-lg">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/cart" className="hover:text-primary">Giỏ hàng</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-semibold">Thanh toán</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg mb-2xl">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-gutter">
        <div className="flex-1 space-y-lg">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
            <h2 className="font-title-lg text-title-lg mb-lg">Thông tin giao hàng</h2>
            <div className="space-y-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Họ tên</label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Địa chỉ</label>
                <textarea
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white min-h-[80px]"
                  placeholder="123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Ghi chú</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
                  placeholder="Ghi chú cho đơn hàng"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl">
            <h2 className="font-title-lg text-title-lg mb-lg">Phương thức thanh toán</h2>
            <div className="space-y-md">
              <label className="flex items-center gap-md p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-label-md text-label-md">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-body-sm text-on-surface-variant">Nhận hàng và thanh toán tại nhà</p>
                </div>
              </label>
              <label className="flex items-center gap-md p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-label-md text-label-md">VNPay</p>
                  <p className="text-body-sm text-on-surface-variant">Thanh toán online qua VNPay</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:w-96">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl sticky top-28 space-y-md">
            <h2 className="font-title-lg text-title-lg">Đơn hàng</h2>
            <div className="space-y-sm max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm truncate">{item.name}</p>
                    <p className="text-label-sm text-on-surface-variant">x{item.quantity}</p>
                  </div>
                  <p className="text-label-sm font-semibold flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-md space-y-sm">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Phí vận chuyển</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-title-lg text-title-lg border-t border-outline-variant pt-md">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            {error && (
              <p className="text-error text-body-sm bg-red-50 p-md rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-lg rounded-xl font-title-lg text-title-lg hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
