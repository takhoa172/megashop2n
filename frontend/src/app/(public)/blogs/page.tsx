"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getPublicBlogs } from "@/services/public"

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#\d+;/g, "")
}

function estimateReadingTime(text: string) {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return minutes
}

function truncateHtml(html: string, maxWords: number) {
  const text = stripHtml(html)
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(" ") + "..."
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function BlogListContent() {
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page")
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1)
  const [activeCategory, setActiveCategory] = useState("")
  const perPage = 9

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: () => getPublicBlogs(),
  })

  const blogList = blogs || []

  const categories = [...new Set(blogList.map((b: any) => b.category_name).filter(Boolean))] as string[]

  const filtered = activeCategory
    ? blogList.filter((b: any) => b.category_name === activeCategory)
    : blogList

  const featured = filtered.length === 1 ? filtered[0] : filtered[0] || null
  const gridBlogs = filtered.length === 1 ? [] : filtered.slice(1)

  const totalPages = Math.max(1, Math.ceil(gridBlogs.length / perPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedBlogs = gridBlogs.slice((safePage - 1) * perPage, safePage * perPage)

  if (isLoading) {
    return (
      <div className="pt-24 text-center text-on-surface-variant">Đang tải...</div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-2xl">
      <div className="mb-2xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-xs">Blog &amp; Tin tức</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Khám phá những xu hướng mới nhất và bí quyết mua sắm thông minh tại VIETSHOP.</p>
      </div>

      {featured && (
        <section className="mb-3xl">
          <div className="group relative bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-7 h-[300px] md:h-[500px] overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={featured.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"}
                  alt={featured.title}
                />
              </div>
              <div className="md:col-span-5 p-2xl flex flex-col justify-center">
                <span className="inline-block px-md py-1 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-xl w-fit mb-md">Nổi bật</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">{featured.title}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl line-clamp-3">
                  {truncateHtml(featured.content || featured.excerpt || "", 50)}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    <span className="font-label-sm text-label-sm text-outline">{featured.published_at ? formatDate(featured.published_at) : ""}</span>
                  </div>
                  <Link
                    href={`/blogs/${featured.slug}`}
                    className="flex items-center gap-xs text-primary font-bold hover:gap-md transition-all duration-300"
                  >
                    <span className="font-body-md text-body-md">Xem thêm</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-md mb-2xl">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-lg py-sm rounded-full font-label-md text-label-md transition-all active:scale-95 ${
            activeCategory === ""
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-lg py-sm rounded-full font-label-md text-label-md transition-all active:scale-95 ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {paginatedBlogs.map((post: any) => (
          <Link key={post.id} href={`/blogs/${post.slug}`} className="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="relative h-56 overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={post.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"}
                alt={post.title}
              />
              <div className="absolute top-md left-md">
                <span className="px-md py-1 bg-surface-bright/90 backdrop-blur-md text-primary font-label-sm text-label-sm rounded-lg border border-primary/20 shadow-sm">
                  {post.category_name || "Tin tức"}
                </span>
              </div>
            </div>
            <div className="p-lg flex flex-col flex-grow">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm line-clamp-2">{post.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg line-clamp-3">
                {truncateHtml(post.content || post.excerpt || "", 30)}
              </p>
              <div className="mt-auto pt-md border-t border-outline-variant/30 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline">Đọc trong {estimateReadingTime(post.content || post.excerpt || "")} phút</span>
                <span className="flex items-center gap-xs text-primary font-bold hover:translate-x-1 transition-transform">
                  <span className="text-body-md font-body-md">Xem thêm</span>
                  <span className="material-symbols-outlined text-md">chevron_right</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline-variant">article</span>
          <p className="text-on-surface-variant mt-4">Chưa có bài viết</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3xl flex justify-center items-center gap-sm">
          <Link
            href={`/blogs?page=${Math.max(1, safePage - 1)}`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-colors active:scale-95 ${safePage <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            <span className="material-symbols-outlined">keyboard_arrow_left</span>
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/blogs?page=${page}`}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md ${
                page === safePage
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
              }`}
            >
              {page}
            </Link>
          ))}
          <Link
            href={`/blogs?page=${Math.min(totalPages, safePage + 1)}`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-colors active:scale-95 ${safePage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            <span className="material-symbols-outlined">keyboard_arrow_right</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default function BlogListPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-on-surface-variant">Đang tải...</div>}>
      <BlogListContent />
    </Suspense>
  )
}
