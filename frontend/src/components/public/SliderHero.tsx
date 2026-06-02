"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPublicSliders } from "@/services/public"

export function SliderHero() {
  const { data: slides } = useQuery({
    queryKey: ["public-sliders"],
    queryFn: getPublicSliders,
  })
  const [current, setCurrent] = useState(0)

  const sliderList = slides || []

  useEffect(() => {
    if (sliderList.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderList.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [sliderList.length])

  if (sliderList.length === 0) return null

  return (
    <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {sliderList.map((slide: any, index: number) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <img
              className="w-full h-full object-cover"
              src={slide.image_url}
              alt={slide.title || ""}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent flex items-center px-margin-mobile md:px-margin-desktop">
              <div className="max-w-[36rem] text-on-primary">
                {slide.title && (
                  <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg mb-4">{slide.title}</h1>
                )}
                {slide.subtitle && (
                  <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg mb-8 opacity-90">{slide.subtitle}</p>
                )}
                {slide.link_url && (
                  <a
                    href={slide.link_url}
                    className="inline-block bg-primary text-on-primary px-8 py-4 font-label-lg rounded hover:bg-primary/90 transition-all"
                  >
                    Khám phá ngay
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sliderList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {sliderList.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === current ? "bg-primary w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
