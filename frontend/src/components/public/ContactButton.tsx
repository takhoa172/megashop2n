"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPublicFooter } from "@/services/public"

const contactOptions = [
  { key: "zalo", label: "Zalo" },
  { key: "facebook", label: "Facebook" },
  { key: "telegram", label: "Telegram" },
  { key: "phone", label: "Gọi điện" },
]

function ZaloIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#0068FF" />
      <path d="M14 17v9.5c0 .83.67 1.5 1.5 1.5H25l-4 5h-5.5c-.83 0-1.5.67-1.5 1.5v.5h14v-2H20.5l4-5.5H32.5c.83 0 1.5-.67 1.5-1.5V17H14z" fill="white" />
      <path d="M17 20h14v2H17zm0 3h10v2H17z" fill="#0068FF" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#1877F2" />
      <path d="M26 36V25h3.5l.5-4H26v-2.5c0-1.16.32-2 2-2h2v-3.5c-.42-.06-1.48-.2-3-.2-3 0-5 1.82-5 5V21h-3.5v4H22v11h4z" fill="white" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#0088CC" />
      <path d="M33.5 15.5l-21 8.5c-.78.32-.74 1.4.04 1.66l5.4 1.8 2.5 7.44c.24.72 1.14.84 1.54.2l2.96-4.74 5.6 4.12c.54.4 1.32.1 1.47-.56l4.3-17.2c.17-.7-.56-1.25-1.18-.92zM29.5 18L20.14 25.6c-.2.17-.32.42-.32.68v4.28l-1.92-5.68 12.6-6.88z" fill="white" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#22C55E" />
      <path d="M31.5 31c1.38 0 2.5-1.12 2.5-2.5v-2.5c0-.83-.67-1.5-1.5-1.5-1.16 0-2.28.2-3.34.56-.38.13-.58.52-.46.9l.76 1.88c-1.88 1.1-3.84 3.06-4.94 4.94l1.88.76c.38.12.77-.08.9-.46.36-1.06.56-2.18.56-3.34 0-.83-.67-1.5-1.5-1.5H20c-.83 0-1.5.67-1.5 1.5C18.5 29.88 20.62 32 23.5 33.5c2.88 1.5 5.5 1.5 8 1.5z" fill="white" />
      <path d="M18 18c1.38 0 2.5-1.12 2.5-2.5V16c0-.83-.67-1.5-1.5-1.5-1.16 0-2.28.2-3.34.56-.38.13-.58.52-.46.9l.76 1.88C14.08 18.94 12.12 20.9 11.02 22.78l1.88.76c.38.12.77-.08.9-.46.36-1.06.56-2.18.56-3.34 0-.83-.67-1.5-1.5-1.5H10c-.83 0-1.5.67-1.5 1.5C8.5 20.88 10.62 23 13.5 24.5c2.88 1.5 5.5 1.5 8 1.5z" fill="white" opacity="0.4" />
    </svg>
  )
}

export function ContactButton({ variant = "primary", size = "lg" }: { variant?: "primary" | "outline"; size?: "sm" | "lg" }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: footer } = useQuery({
    queryKey: ["public-footer"],
    queryFn: getPublicFooter,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getLink = (key: string) => {
    switch (key) {
      case "zalo": return footer?.zalo || "#"
      case "facebook": return footer?.facebook || "#"
      case "telegram": return footer?.telegram || "#"
      case "phone": return footer?.phone ? `tel:${footer.phone.replace(/\s/g, "")}` : "#"
      default: return "#"
    }
  }

  const btnClass = size === "sm"
    ? "w-full bg-primary text-on-primary font-label-md py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary hover:opacity-90 transition-all text-sm"
    : variant === "outline"
      ? "w-full border border-primary text-primary py-lg rounded-xl font-title-lg text-title-lg hover:bg-primary/5 transition-all active:scale-[0.98]"
      : "w-full bg-primary text-on-primary py-lg rounded-xl font-title-lg text-title-lg shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={btnClass}
      >
        <span className="material-symbols-outlined text-[20px]">contact_support</span>
        Liên hệ
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-outline-variant shadow-lg overflow-hidden z-50">
          {contactOptions.map((opt) => {
            const link = getLink(opt.key)
            return (
              <a
                key={opt.key}
                href={link}
                target={opt.key === "phone" ? undefined : "_blank"}
                rel={opt.key === "phone" ? undefined : "noopener noreferrer"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface font-body-md"
              >
                {opt.key === "zalo" && <ZaloIcon />}
                {opt.key === "facebook" && <FacebookIcon />}
                {opt.key === "telegram" && <TelegramIcon />}
                {opt.key === "phone" && <PhoneIcon />}
                <span>{opt.label}</span>
                {opt.key === "phone" && footer?.phone && (
                  <span className="ml-auto text-on-surface-variant text-sm">{footer.phone}</span>
                )}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
