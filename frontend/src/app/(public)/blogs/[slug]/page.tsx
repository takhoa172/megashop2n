"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getPublicBlog } from "@/services/public"

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#\d+;/g, "")
}

function estimateReadingTime(text: string) {
  const words = stripHtml(text || "").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => getPublicBlog(slug),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-on-surface-variant">Đang tải...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant">article</span>
          <p className="text-on-surface-variant mt-4">Không tìm thấy bài viết</p>
          <Link href="/blogs" className="mt-4 inline-block text-primary hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <article className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl">
        <Link href="/blogs" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors mb-lg font-body-md text-body-md">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quay lại danh sách
        </Link>

        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-md">
            {post.category_name && (
              <span className="px-3 py-1 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-lg">
                {post.category_name}
              </span>
            )}
            <span className="font-label-sm text-label-sm text-outline">
              {estimateReadingTime(post.content || post.excerpt || "")} phút đọc
            </span>
          </div>

          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-md">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-xl text-on-surface-variant font-body-sm text-body-sm">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-md">person</span>
              {post.author_name || "VIETSHOP"}
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-md">calendar_today</span>
              {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
            </div>
          </div>

          {post.featured_image && (
            <div className="mb-2xl rounded-xl overflow-hidden border border-outline-variant">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-slate max-w-none font-body-md text-body-md leading-relaxed text-on-surface
              prose-headings:font-headline-lg prose-headings:text-headline-lg prose-headings:text-on-surface prose-headings:mt-xl prose-headings:mb-sm
              prose-p:mb-md prose-p:text-body-md prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:border prose-img:border-outline-variant prose-img:my-lg
              prose-strong:text-on-surface prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-lg prose-blockquote:italic prose-blockquote:bg-primary-container/20 prose-blockquote:py-sm prose-blockquote:rounded-r-lg
              prose-ul:list-disc prose-ul:pl-xl prose-ul:my-md
              prose-ol:list-decimal prose-ol:pl-xl prose-ol:my-md
              prose-li:mb-1
              prose-hr:border-outline-variant"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          <div className="mt-3xl pt-xl border-t border-outline-variant flex justify-between items-center">
            <Link href="/blogs" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
