"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { getPublicProduct, getSuggested } from "@/services/public"
import { formatCurrency } from "@/lib/utils"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("description")

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getPublicProduct(id),
  })

  const { data: related } = useQuery({
    queryKey: ["suggested"],
    queryFn: getSuggested,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Đang tải...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Không tìm thấy sản phẩm</p>
        <Link href="/products" className="text-primary mt-4 inline-block">Quay lại</Link>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" }]
  const relatedList = (related || []).filter((p: any) => p.id !== product.id).slice(0, 4)

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-lg">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-lg flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-semibold">{product.category_name || "Chi tiết"}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-md">
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden aspect-square flex items-center justify-center p-md group transition-all duration-300 hover:shadow-lg">
            <img
              alt={product.name}
              className="w-full h-full object-cover"
              src={images[selectedImage]?.image_url || images[0]?.image_url}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-sm">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square bg-white border-2 rounded-xl p-xs cursor-pointer overflow-hidden ${
                    i === selectedImage ? "border-primary" : "border-outline-variant hover:border-primary"
                  } transition-colors`}
                >
                  <img className="w-full h-full object-cover" src={img.image_url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <span className="inline-block w-fit px-sm py-xs bg-surface-container-highest text-secondary font-label-sm text-label-sm rounded-lg mb-sm uppercase">
            {product.category_name || "Sản phẩm"}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-md">{product.name}</h1>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex text-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" as any }}>star</span>
              ))}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">(124 reviews)</span>
            <span className="text-outline-variant">|</span>
            <span className="font-body-sm text-body-sm text-primary font-medium">
              {product.status === "in_stock" ? "Còn hàng" : product.status === "sold" ? "Đã bán" : "Liên hệ"}
            </span>
          </div>
          <div className="flex items-baseline gap-md mb-lg">
            <span className="font-headline-md text-headline-md text-primary">
              {product.sale_price !== null ? formatCurrency(product.sale_price) : "Liên hệ"}
            </span>
            {product.purchase_price > 0 && product.sale_price > product.purchase_price && (
              <>
                <span className="font-body-md text-body-md text-on-surface-variant line-through">
                  {formatCurrency(product.purchase_price)}
                </span>
                <span className="bg-error/10 text-error px-sm py-xs rounded font-label-sm text-label-sm">
                  -{Math.round((1 - product.sale_price / product.purchase_price) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl leading-relaxed">
            {product.description || "Sản phẩm chất lượng cao từ VIETSHOP."}
          </p>

          {/* Color Variants */}
          <div className="mb-lg">
            <h3 className="font-label-md text-label-md text-on-surface mb-sm uppercase tracking-wider">Color</h3>
            <div className="flex gap-md">
              <button className="w-10 h-10 rounded-full border-2 border-primary bg-slate-900 ring-2 ring-offset-2 ring-transparent transition-all"></button>
              <button className="w-10 h-10 rounded-full border border-outline-variant bg-slate-200 hover:scale-110 transition-all"></button>
              <button className="w-10 h-10 rounded-full border border-outline-variant bg-blue-800 hover:scale-110 transition-all"></button>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-2xl">
            <h3 className="font-label-md text-label-md text-on-surface mb-sm uppercase tracking-wider">Số lượng</h3>
            <div className="flex items-center w-fit border border-outline-variant rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-md hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="px-lg font-title-lg text-title-lg min-w-[60px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-md hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-gutter">
            <button className="flex-1 bg-primary text-on-primary py-lg rounded-xl font-title-lg text-title-lg shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]">
              Thêm vào giỏ
            </button>
            <button className="flex-1 border border-primary text-primary py-lg rounded-xl font-title-lg text-title-lg hover:bg-primary/5 transition-all active:scale-[0.98]">
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-3xl border-t border-outline-variant pt-2xl">
        <div className="flex border-b border-outline-variant gap-2xl overflow-x-auto no-scrollbar">
          {["description", "specifications", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-md font-title-lg text-title-lg whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }`}
            >
              {tab === "description" ? "Description" : tab === "specifications" ? "Specifications" : "Customer Reviews"}
            </button>
          ))}
        </div>
        <div className="py-2xl">
          <div className="max-w-3xl">
            <h2 className="font-headline-md text-headline-md mb-md">Engineered for Perfection</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
              The Wireless Studio X1 provides a seamless listening experience with advanced acoustic technology. Our custom-designed 40mm drivers deliver rich, spatial sound that places you at the center of your music. Whether you're in a busy commute or a quiet office, the intelligent ANC adapts to your environment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary p-sm bg-surface-container rounded-xl">battery_charging_full</span>
                <div>
                  <h4 className="font-title-lg text-title-lg mb-xs">40H Battery Life</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Listen for days without needing a charge. Quick charge gives 3 hours in 10 mins.</p>
                </div>
              </div>
              <div className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary p-sm bg-surface-container rounded-xl">noise_aware</span>
                <div>
                  <h4 className="font-title-lg text-title-lg mb-xs">Smart ANC</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Three levels of active noise cancellation to suit any environment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedList.length > 0 && (
        <section className="mt-3xl">
          <div className="flex justify-between items-end mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg">Sản phẩm liên quan</h2>
              <div className="w-16 h-1 bg-primary mt-sm rounded-full" />
            </div>
            <Link href="/products" className="text-primary font-label-lg text-label-lg flex items-center gap-xs hover:gap-sm transition-all">
              Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {relatedList.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-2xl border border-outline-variant p-md flex flex-col hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-square bg-surface-container rounded-xl mb-md overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                    alt={product.name}
                  />
                  <button className="absolute top-sm right-sm p-sm bg-white/80 backdrop-blur rounded-full shadow-sm text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
                  {product.category_name || "Sản phẩm"}
                </span>
                <h3 className="font-title-lg text-title-lg mb-sm line-clamp-1">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-body-lg text-body-lg font-bold text-primary">
                    {product.sale_price !== null ? formatCurrency(product.sale_price) : "Liên hệ"}
                  </span>
                  <span className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
