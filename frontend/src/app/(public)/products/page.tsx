"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { getPublicProducts, getPublicCategories } from "@/services/public"
import { formatCurrency } from "@/lib/utils"

const PAGE_SIZE = 12

function ProductListContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get("keyword") || ""
  const [selectedCat, setSelectedCat] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [priceFrom, setPriceFrom] = useState("")
  const [priceTo, setPriceTo] = useState("")
  const [appliedPriceFrom, setAppliedPriceFrom] = useState("")
  const [appliedPriceTo, setAppliedPriceTo] = useState("")

  const params: Record<string, string> = { page_size: String(PAGE_SIZE), page: String(page) }
  if (keyword) params.keyword = keyword
  if (selectedCat) params.category = selectedCat
  if (sortBy === "price-asc") params.ordering = "sale_price"
  else if (sortBy === "price-desc") params.ordering = "-sale_price"
  else params.ordering = "-created_at"
  if (appliedPriceFrom) params.price_min = appliedPriceFrom
  if (appliedPriceTo) params.price_max = appliedPriceTo

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: getPublicCategories,
  })
  const categories = catData || []

  const { data: prodData } = useQuery({
    queryKey: ["public-products", params],
    queryFn: () => getPublicProducts(params),
  })
  const products = prodData?.results || prodData || []
  const totalCount = prodData?.count ?? products.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const fromItem = (page - 1) * PAGE_SIZE + 1
  const toItem = Math.min(page * PAGE_SIZE, totalCount)

  const handleApplyPrice = () => {
    setAppliedPriceFrom(priceFrom)
    setAppliedPriceTo(priceTo)
    setPage(1)
  }

  const handleCategoryChange = (catId: string) => {
    setSelectedCat(catId)
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setPage(1)
  }

  const getBadge = (product: any) => {
    if (product.is_suggested) {
      return <span className="absolute top-2 left-2 bg-error text-on-primary font-label-sm text-[10px] px-2 py-1 rounded uppercase tracking-wider">Hot</span>
    }
    if (product.sale_price === 0) {
      return <span className="absolute top-2 left-2 bg-accent text-on-accent font-label-sm text-[10px] px-2 py-1 rounded uppercase tracking-wider">FREE</span>
    }
    return null
  }

  return (
    <div className="pt-12 pb-3xl max-w-container-max mx-auto px-margin-desktop">
      <div className="flex flex-col md:flex-row gap-gutter">
        <aside className="w-full md:w-1/4 flex flex-col gap-xl">
          <div className="bg-surface-container-low p-lg rounded-2xl">
            <h2 className="font-title-lg text-title-lg mb-lg">Bộ lọc tìm kiếm</h2>

            <div className="mb-xl">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md">Danh mục</h3>
              <div className="flex flex-col gap-sm">
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCat === ""}
                    onChange={() => handleCategoryChange("")}
                    className="w-4 h-4 border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="font-body-sm text-body-sm group-hover:text-primary transition-colors">Tất cả</span>
                </label>
                {categories.map((cat: any) => (
                  <label key={cat.id} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCat === cat.id}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="w-4 h-4 border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="font-body-sm text-body-sm group-hover:text-primary transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-xl">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md">Khoảng giá (VNĐ)</h3>
              <div className="flex flex-col gap-md">
                <div className="flex items-center gap-sm">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="w-full bg-surface-container-lowest border-none p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <span className="text-outline">—</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    className="w-full bg-surface-container-lowest border-none p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyPrice}
                  className="bg-primary text-on-primary font-label-md py-2 rounded-lg hover:bg-secondary transition-all"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            <div className="mb-xl">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md">Thương hiệu</h3>
              <div className="grid grid-cols-2 gap-sm">
                {["Samsung", "Nike", "Apple", "Sony"].map((brand) => (
                  <button
                    key={brand}
                    className="bg-surface-container-lowest p-2 rounded-lg text-xs hover:text-primary transition-all"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md">Đánh giá</h3>
              <div className="flex flex-col gap-sm">
                <button className="flex items-center gap-xs group">
                  <div className="flex text-accent">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="text-xs text-on-surface-variant group-hover:text-primary">(5.0)</span>
                </button>
                <button className="flex items-center gap-xs group">
                  <div className="flex text-accent">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <span className="text-xs text-on-surface-variant group-hover:text-primary">trên 4.0</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full md:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg">
                {keyword ? `Kết quả: "${keyword}"` : "Tất cả sản phẩm"}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {totalCount > 0
                  ? `Hiển thị ${fromItem} - ${toItem} trên ${totalCount} sản phẩm`
                  : "Không có sản phẩm"}
              </p>
            </div>
            <div className="flex items-center gap-md">
              <span className="font-label-md text-label-md text-on-surface-variant">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-surface-container-low border-none rounded-lg py-2 pl-3 pr-8 font-label-md outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {products.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col group p-4 border border-outline-variant/30"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-low mb-4">
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"}
                      />
                      {getBadge(product)}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="text-xs text-on-surface-variant mb-1 uppercase tracking-tighter">
                        {product.category_name || "Sản phẩm"}
                      </span>
                      <h3 className="font-headline-md text-headline-md mb-2 line-clamp-1">{product.name}</h3>
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-sm mb-4">
                          <span className="text-primary font-bold text-lg">
                            {product.sale_price !== null ? formatCurrency(product.sale_price) : "Liên hệ"}
                          </span>
                          {product.purchase_price > 0 && product.sale_price !== null && product.sale_price < product.purchase_price && (
                            <span className="text-on-surface-variant text-xs line-through">
                              {formatCurrency(product.purchase_price)}
                            </span>
                          )}
                        </div>
                        <button className="w-full bg-primary text-on-primary font-label-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary hover:opacity-90 transition-all">
                          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-2xl flex justify-center items-center gap-sm">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-lg hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                            p === page
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-low hover:text-primary"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    }
                    if (p === page - 2 || p === page + 2) {
                      return (
                        <span key={p} className="text-outline">...</span>
                      )
                    }
                    return null
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-lg hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
              <p className="text-on-surface-variant mt-4">Không tìm thấy sản phẩm</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-on-surface-variant">Đang tải...</div>}>
      <ProductListContent />
    </Suspense>
  )
}
