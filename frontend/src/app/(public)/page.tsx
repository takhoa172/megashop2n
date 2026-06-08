"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { SliderHero } from "@/components/public/SliderHero"
import { getSuggested, getMostViewed, getPriceZero, getPublicProducts, getPublicBlogs } from "@/services/public"
import { getProducts } from "@/services/products"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { useCart } from "@/contexts/CartContext"

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#\d+;/g, "")
}

function truncateText(text: string, maxWords: number) {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(" ") + "..."
}

function ProductCard({ product }: { product: any }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      image: product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      price: product.sale_price ?? product.purchase_price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  return (
    <Link href={`/products/${product.id}`} className="group border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(0,0,0,.08)] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 p-4 bg-white">
      <div className="relative overflow-hidden mb-4 aspect-[3/4] rounded-xl">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
          alt={product.name}
        />
        <div className="absolute top-2 left-2 bg-accent text-on-accent px-2 py-1 text-label-sm font-bold">Hot</div>
      </div>
      <p className="text-on-surface-variant font-label-sm mb-1 uppercase">{product.category_name || "Sản phẩm"}</p>
      <h3 className="font-headline-md text-headline-md mb-2 truncate">{product.name}</h3>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="material-symbols-outlined text-accent text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        ))}
        <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">4.8 (120)</span>
      </div>
      <p className="font-bold text-primary mb-4">{product.sale_price != null ? (product.sale_price > 0 ? formatCurrency(product.sale_price) : "Miễn phí") : "Liên hệ"}</p>
      <button onClick={handleAddToCart} className="w-full bg-primary text-on-primary py-3 font-label-lg hover:bg-secondary hover:opacity-90 transition-all active:scale-95">{added ? "Đã thêm ✓" : "Thêm vào giỏ"}</button>
    </Link>
  )
}

export default function HomePage() {
  const { data: suggested } = useQuery({ queryKey: ["suggested"], queryFn: () => getSuggested() })
  const { data: mostViewed } = useQuery({ queryKey: ["most-viewed"], queryFn: () => getMostViewed() })
  const { data: priceZero } = useQuery({ queryKey: ["price-zero"], queryFn: () => getPriceZero() })
  const { data: budgetData } = useQuery({ queryKey: ["public-products-budget"], queryFn: () => getProducts({ sale_price__lte: "500000" }) })
  const { data: blogs } = useQuery({ queryKey: ["public-blogs"], queryFn: () => getPublicBlogs() })

  const suggestedList = suggested || []
  const mostViewedList = mostViewed || []
  const priceZeroList = priceZero || []
  const budgetList = (budgetData?.results || budgetData || []).filter((p: any) => p.sale_price && p.sale_price < 500000)
  const blogList = blogs || []

  const placeholderProducts = [
    { id: 1, name: "Sản phẩm mẫu", sale_price: 150000, purchase_price: 200000, category_name: "Danh mục", images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }] },
    { id: 2, name: "Sản phẩm mẫu 2", sale_price: 250000, purchase_price: 300000, category_name: "Danh mục", images: [{ image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" }] },
    { id: 3, name: "Sản phẩm mẫu 3", sale_price: 0, purchase_price: 350000, category_name: "Danh mục", images: [{ image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" }] },
    { id: 4, name: "Sản phẩm mẫu 4", sale_price: 180000, purchase_price: 250000, category_name: "Danh mục", images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }] },
  ]

  const placeholderBlogs = [
    { id: 1, title: "Xu hướng thời trang mới nhất 2024", slug: "xu-huong-thoi-trang", featured_image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800", excerpt: "Khám phá những xu hướng thời trang nổi bật trong năm nay.", category_name: "Thời trang" },
    { id: 2, title: "Mẹo chọn giày thể thao phù hợp", slug: "meo-chon-giay", featured_image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800", excerpt: "Những lưu ý quan trọng khi chọn giày thể thao.", category_name: "Mẹo vặt" },
    { id: 3, title: "Công nghệ đột phá trong năm 2024", slug: "cong-nghe-dot-pha", featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", excerpt: "Những công nghệ đang thay đổi thế giới.", category_name: "Công nghệ" },
  ]

  return (
    <div>
      <SliderHero />

      {/* Sản phẩm gợi ý */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl md:py-section-gap">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-2">
          <div>
            <span className="text-primary font-label-lg uppercase tracking-widest">Dành riêng cho bạn</span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mt-2">Sản phẩm gợi ý</h2>
          </div>
          <Link href="/products" className="text-primary font-label-lg border-b border-primary hover:text-primary/70 hover:border-primary/70 transition-colors">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-gutter">
          {(suggestedList.length > 0 ? suggestedList.slice(0, 5) : placeholderProducts.slice(0, 5)).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Xu hướng thị trường */}
      <section className="bg-surface-container-low py-2xl md:py-section-gap">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg">Xu hướng thị trường</h2>
            <p className="text-on-surface-variant mt-4">Những sản phẩm được quan tâm nhất trong 24h qua</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter h-auto md:h-[600px]">
            {(mostViewedList.length > 0 ? mostViewedList.slice(0, 4) : placeholderProducts.slice(0, 4)).map((product: any, i: number) => {
              if (i === 0) {
                return (
                  <div key={product.id} className="md:col-span-2 md:row-span-2 relative overflow-hidden group rounded-2xl h-[300px] md:h-auto">
                    <img
                      className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                      src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"}
                      alt={product.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1]" />
                    <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                      <div>
                        <p className="text-primary text-body-lg font-semibold uppercase mb-2">Sản phẩm nổi bật</p>
                        <h3 className="font-headline-lg text-headline-lg mb-2 text-white">{product.name}</h3>
                        <p className="text-white/80">Vừa cập bến 50 mẫu thiết kế mới nhất</p>
                      </div>
                      <Link href={`/products/${product.id}`} className="mt-auto font-label-lg text-white hover:translate-x-1 transition-transform">Khám phá ngay →</Link>
                    </div>
                  </div>
                )
              }
              if (i === 3) {
                return (
                  <div key={product.id || "member"} className="md:col-span-2 bg-secondary p-6 md:p-8 flex justify-between items-center text-on-secondary relative overflow-hidden group rounded-2xl">
                    <div>
                      <h3 className="font-headline-lg text-headline-lg mb-2">Đặc quyền Thành viên</h3>
                      <p className="opacity-80">Giảm thêm 10% cho mọi đơn hàng</p>
                      <Link href="/login" className="mt-6 inline-block bg-primary text-on-primary px-6 py-2 font-label-lg rounded hover:bg-primary/90 transition-all">Đăng ký ngay</Link>
                    </div>
                    <span className="material-symbols-outlined text-[120px] opacity-10 translate-x-12">loyalty</span>
                  </div>
                )
              }
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="group relative overflow-hidden bg-white border border-outline-variant p-6 flex items-center gap-4 rounded-xl">
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                      alt={product.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline-md text-headline-md text-body-md truncate">{product.name}</h3>
                    <p className="text-primary font-bold">{product.sale_price != null && product.sale_price > 0 ? formatCurrency(product.sale_price) : "Miễn phí"}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hàng thanh lý */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl md:py-section-gap">
        <div className="bg-secondary rounded-xl p-6 md:p-12 text-on-secondary relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-accent">bolt</span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">Hàng thanh lý - Giá cực sốc</h2>
            </div>
            <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg opacity-80 mb-6 md:mb-10 max-w-[32rem]">
              Cơ hội cuối cùng để sở hữu những sản phẩm yêu thích với mức giá không tưởng. Số lượng có hạn!
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter text-on-background">
              {(priceZeroList.length > 0 ? priceZeroList.slice(0, 4) : placeholderProducts.slice(0, 4)).map((product: any) => (
                <Link key={product.id} href={`/products/${product.id}`} className="bg-white p-4 rounded-xl shadow-sm group">
                  <div className="relative mb-4">
                    <img
                      className="w-full aspect-square object-cover rounded-xl"
                      src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                      alt={product.name}
                    />
                    <div className="absolute top-0 right-0 bg-accent text-on-accent px-3 py-1 font-bold">{product.purchase_price > 0 ? `-${Math.round((1 - product.sale_price / product.purchase_price) * 100)}%` : "-50%"}</div>
                  </div>
                  <h4 className="font-label-lg text-secondary mb-1">{product.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary font-bold text-[22px]">{product.sale_price ? formatCurrency(product.sale_price) : "Miễn phí"}</span>
                    <span className="text-on-surface-variant line-through opacity-60 text-label-sm">{formatCurrency(product.purchase_price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[300px] text-white opacity-5 pointer-events-none rotate-12">shopping_basket</span>
        </div>
      </section>

      {/* Hàng giá rẻ */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl md:py-section-gap">
        <div className="flex items-center gap-4 mb-6 md:mb-10">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg">Hàng giá rẻ</h2>
          <div className="h-[1px] flex-grow bg-outline-variant" />
          <span className="font-label-lg text-primary">Dưới 500k</span>
        </div>
        <div className="overflow-x-auto hide-scrollbar -mx-margin-mobile md:-mx-0">
          <div className="flex gap-gutter px-margin-mobile md:px-0 min-w-max md:min-w-0">
            {(budgetList.length > 0 ? budgetList : placeholderProducts).map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} className="bg-white p-3 rounded-xl shadow-sm group min-w-[160px] sm:min-w-[280px]">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-container mb-2">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                    alt={product.name}
                  />
                </div>
                <h4 className="font-label-lg text-secondary mb-1">{product.name}</h4>
                <p className="text-primary font-bold text-lg sm:text-[22px]">{product.sale_price != null && product.sale_price > 0 ? formatCurrency(product.sale_price) : "Miễn phí"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog & Tin tức */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl md:py-section-gap border-t border-outline-variant">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-headline-lg text-headline-lg">Blog &amp; Tin tức</h2>
          <p className="text-on-surface-variant mt-2">Cập nhật xu hướng và mẹo vặt hữu ích</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {(blogList.length > 0 ? blogList : placeholderBlogs).map((post: any) => (
            <Link key={post.id} href={`/blogs/${post.slug}`} className="group block bg-white border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <article>
                <div className="overflow-hidden mb-4 h-48 rounded-xl">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={post.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"}
                    alt={post.title}
                  />
                </div>
                <span className="text-primary font-label-sm uppercase font-bold">{post.category_name || "Tin tức"}</span>
                <h3 className="font-headline-md text-headline-md mt-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-on-surface-variant font-body-sm mt-3 line-clamp-2">{post.excerpt || truncateText(stripHtml(post.content || ""), 25) || "Xem thêm bài viết để biết thêm chi tiết."}</p>
                <span className="inline-flex items-center gap-2 mt-4 font-label-lg text-primary hover:translate-x-1 transition-transform">
                  Xem thêm <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
