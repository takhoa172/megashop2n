"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPublicSliders } from "@/services/public"
import Link from "next/link"

const defaultSlides = [
  { id: 1, image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920", title: "Khuyến mãi đặc biệt", subtitle: "Khám phá bộ sưu tập mới nhất với ưu đãi lên đến 50%", link_url: "/products" },
  { id: 2, image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920", title: "Bộ sưu tập Thu Đông", subtitle: "Những thiết kế mới nhất dành cho bạn", link_url: "/products" },
  { id: 3, image_url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920", title: "Công nghệ mới nhất", subtitle: "Ưu đãi đặc biệt cho các thiết bị điện tử", link_url: "/products" },
]

const fallbackImg = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920"

export function SliderHero() {
  const { data: sliders } = useQuery({ queryKey: ["public-sliders"], queryFn: getPublicSliders })
  const slides = sliders && sliders.length > 0 ? sliders : defaultSlides
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  if (slides.length === 0) return null

  return (
    <section className="relative w-full h-[300px] md:h-[600px] overflow-hidden">
      {slides.map((slide: any, i: number) => {
        const imgSrc = slide.image_url || slide.image || fallbackImg
        const inner = (
          <>
            <img
              src={imgSrc}
              alt={slide.title || ""}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent flex items-center px-margin-mobile md:px-margin-desktop">
              <div className="max-w-[36rem] text-on-primary">
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-white mb-4">
                  {slide.title || "Chào mừng đến với VIETSHOP"}
                </h1>
                <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg mb-8 opacity-90">
                  {slide.subtitle || "Mua sắm trực tuyến dễ dàng và tiện lợi"}
                </p>
                {slide.link_url ? (
                  <a href={slide.link_url} className="inline-block bg-primary text-on-primary px-8 py-4 font-label-lg hover:bg-primary/90 transition-all rounded w-fit">Mua ngay</a>
                ) : (
                  <Link href="/products" className="inline-block bg-primary text-on-primary px-8 py-4 font-label-lg hover:bg-primary/90 transition-all rounded w-fit">Mua ngay</Link>
                )}
              </div>
            </div>
          </>
        )
        if (slide.link_url) {
          return (
            <a key={slide.id || i} href={slide.link_url} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              {inner}
            </a>
          )
        }
        return (
          <div key={slide.id || i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            {inner}
          </div>
        )
      })}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-3 h-3 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-white/50"}`} />
          ))}
        </div>
      )}
    </section>
  )
}
