"use client"

import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant">shopping_cart</span>
        <h1 className="font-headline-lg text-headline-lg mt-6 mb-2">Giỏ hàng trống</h1>
        <p className="text-on-surface-variant mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link href="/products" className="inline-block bg-primary text-on-primary px-8 py-4 font-label-lg rounded-lg hover:bg-primary/90 transition-all">
          Mua sắm ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3xl">
      <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-lg">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-semibold">Giỏ hàng</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg mb-2xl">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="flex flex-col lg:flex-row gap-gutter">
        <div className="flex-1 space-y-md">
          {items.map((item) => (
            <div key={item.id} className="flex flex-row flex-wrap sm:flex-nowrap gap-md p-lg bg-white rounded-xl border border-outline-variant items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`} className="font-title-lg text-title-lg hover:text-primary transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-primary font-bold mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center border border-outline-variant rounded-lg ml-auto">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-sm hover:bg-surface-container-low transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="px-md font-title-md text-title-md min-w-[40px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-sm hover:bg-surface-container-low transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-on-surface-variant hover:text-error transition-colors p-sm min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          <button
            onClick={clearCart}
            className="text-on-surface-variant hover:text-error transition-colors font-label-md flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Xóa tất cả
          </button>
        </div>

        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-outline-variant p-lg md:p-xl sticky top-28">
            <h2 className="font-title-lg text-title-lg mb-lg">Tổng đơn hàng</h2>
            <div className="flex justify-between mb-md">
              <span className="text-on-surface-variant">Tạm tính</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between mb-lg">
              <span className="text-on-surface-variant">Phí vận chuyển</span>
              <span className="font-semibold text-success">Miễn phí</span>
            </div>
            <div className="border-t border-outline-variant pt-lg flex justify-between mb-xl">
              <span className="font-title-lg text-title-lg">Tổng cộng</span>
              <span className="font-title-lg text-title-lg text-primary font-bold">{formatCurrency(total)}</span>
            </div>
            <button className="w-full bg-primary text-on-primary py-lg rounded-xl font-title-lg text-title-lg hover:bg-primary/90 transition-all active:scale-[0.98]">
              Tiến hành đặt hàng
            </button>
            <Link href="/products" className="block text-center mt-md text-primary font-label-md hover:underline">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
