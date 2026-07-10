"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, Suspense } from "react"
import { getPublicBlog } from "@/services/public"
import { ImageWithFallback as Image } from "@/components/shared/ImageWithFallback"
import { usePageMeta } from "@/hooks/usePageMeta"
import { injectJsonLd } from "@/lib/jsonld"
import { ShareButton } from "@/components/shared/ShareButton"

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

function BlogDetailContent() {
  const params = useParams()
  const slug = params.slug as string

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => getPublicBlog(slug),
    enabled: !!slug,
  })

  const postTitle = `${post?.title || "Blog"} | VIETSHOP`
  const postDesc = post?.excerpt || stripHtml(post?.content || "").slice(0, 160)

  usePageMeta(postTitle, postDesc, post?.featured_image || undefined)

  useEffect(() => {
    if (!post) return
    const cleanups: (() => void)[] = []

    cleanups.push(injectJsonLd({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: postDesc,
      author: { "@type": "Person", name: post.author_name || "VIETSHOP" },
      datePublished: post.published_at || post.created_at,
      image: post.featured_image || undefined,
    }))

    cleanups.push(injectJsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "/blogs" },
        { "@type": "ListItem", position: 3, name: post.title },
      ],
    }))

    return () => cleanups.forEach((fn) => fn())
  }, [post])

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl animate-pulse">
          <div className="h-4 bg-surface-container-highest rounded w-32 mb-lg" />
          <div className="max-w-[800px] mx-auto space-y-4">
            <div className="h-6 bg-surface-container-highest rounded w-1/4" />
            <div className="h-10 bg-surface-container-highest rounded w-3/4" />
            <div className="h-4 bg-surface-container-highest rounded w-1/3" />
            <div className="aspect-video bg-surface-container-highest rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-surface-container-highest rounded" />
              <div className="h-4 bg-surface-container-highest rounded w-5/6" />
              <div className="h-4 bg-surface-container-highest rounded w-2/3" />
            </div>
          </div>
        </div>
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
              <Image
                src={post.featured_image}
                alt={post.title}
                width={800}
                height={500}
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

          <div className="mt-3xl pt-xl border-t border-outline-variant flex justify-between items-center flex-wrap gap-md">
            <Link href="/blogs" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại danh sách
            </Link>
            <ShareButton
              title={`${post.title} - VIETSHOP`}
              text={postDesc}
            />
          </div>
        </div>
      </article>
    </div>
  )
}

export default function BlogDetailPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2xl animate-pulse">
          <div className="h-4 bg-surface-container-highest rounded w-32 mb-lg" />
          <div className="max-w-[800px] mx-auto space-y-4">
            <div className="h-6 bg-surface-container-highest rounded w-1/4" />
            <div className="h-10 bg-surface-container-highest rounded w-3/4" />
            <div className="h-4 bg-surface-container-highest rounded w-1/3" />
            <div className="aspect-video bg-surface-container-highest rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-surface-container-highest rounded w-full" />
              <div className="h-4 bg-surface-container-highest rounded w-5/6" />
              <div className="h-4 bg-surface-container-highest rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    }>
      <BlogDetailContent />
    </Suspense>
  )
}
