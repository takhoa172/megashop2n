"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getPublicBlog } from "@/services/public"

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getPublicBlog(slug),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Đang tải...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
        <p className="text-on-surface-variant mt-4">Không tìm thấy bài viết</p>
        <Link href="/blogs" className="text-primary mt-4 inline-block">Quay lại blog</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-margin-desktop py-3xl">
      <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-lg">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-semibold truncate max-w-[200px]">{post.title}</span>
      </nav>

      <article>
        {post.featured_image && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img className="w-full h-full object-cover" src={post.featured_image} alt={post.title} />
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary font-label-sm uppercase font-bold bg-primary/10 px-2 py-1 rounded">
            {post.category_name || "Tin tức"}
          </span>
          {post.published_at && (
            <span className="text-on-surface-variant font-label-sm text-xs">
              {new Date(post.published_at).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-6">
          {post.title}
        </h1>
        <div
          className="prose prose-slate max-w-none font-body-lg text-body-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-16 border-t border-outline-variant pt-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 font-label-lg text-primary hover:translate-x-1 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại Blog
        </Link>
      </div>
    </div>
  )
}
