"use client"

import { useState, useRef, useEffect } from "react"

function FacebookIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#1877F2" />
      <path d="M26 36V25h3.5l.5-4H26v-2.5c0-1.16.32-2 2-2h2v-3.5c-.42-.06-1.48-.2-3-.2-3 0-5 1.82-5 5V21h-3.5v4H22v11h4z" fill="white" />
    </svg>
  )
}

function ZaloIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#0068FF" />
      <path d="M14 17v9.5c0 .83.67 1.5 1.5 1.5H25l-4 5h-5.5c-.83 0-1.5.67-1.5 1.5v.5h14v-2H20.5l4-5.5H32.5c.83 0 1.5-.67 1.5-1.5V17H14z" fill="white" />
      <path d="M17 20h14v2H17zm0 3h10v2H17z" fill="#0068FF" />
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

function MessengerIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#00B2FF" />
      <path d="M24 13c-6.63 0-12 4.8-12 10.72 0 3.24 1.6 6.14 4.1 8.06V36l3.74-2.05c1.3.36 2.68.55 4.16.55 6.63 0 12-4.8 12-10.72S30.63 13 24 13zm1.2 14.53l-3.06-3.26L16.3 27.6l5.3-5.63 3.06 3.26 5.84-3.33-5.3 5.63z" fill="white" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0">
      <circle cx="24" cy="24" r="20" fill="#25D366" />
      <path d="M24 13c-6.08 0-11 4.92-11 11 0 2.08.58 4.02 1.58 5.67L13 35l5.51-1.44C19.98 34.5 21.95 35 24 35c6.08 0 11-4.92 11-11S30.08 13 24 13zm5.22 16.22c-.22.62-1.1 1.14-1.8 1.3-.48.1-1.1.18-3.2-.68-2.68-1.1-4.42-3.8-4.56-3.97-.14-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94.92-2.2.24-.26.52-.32.7-.32.18 0 .34 0 .48.02.16.02.36-.06.56.44.22.52.74 1.8.8 1.94.08.14.12.3.04.48-.08.18-.14.28-.26.44-.12.16-.24.28-.36.46-.12.16-.24.34-.1.64.14.3.64 1.06 1.38 1.72.94.84 1.74 1.1 1.98 1.22.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.69 1.64.82.24.12.4.18.46.28.06.1.06.58-.16 1.2z" fill="white" />
    </svg>
  )
}

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const shareText = text || title
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(shareText)

  const shareLinks = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "zalo",
      label: "Zalo",
      icon: <ZaloIcon />,
      href: `https://zalo.me/share?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: <TelegramIcon />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "messenger",
      label: "Messenger",
      icon: <MessengerIcon />,
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      href: `https://wa.me/?text=${encodedText}+${encodedUrl}`,
    },
    {
      key: "copy",
      label: "Copy Link",
      icon: <span className="material-symbols-outlined text-[24px] text-on-surface-variant">link</span>,
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full border border-outline-variant text-on-surface py-lg rounded-xl font-title-lg text-title-lg hover:bg-surface-container-low transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
        Chia sẻ
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-outline-variant shadow-lg overflow-hidden z-50">
          {shareLinks.map((opt) => {
            if (opt.key === "copy") {
              return (
                <button
                  key={opt.key}
                  onClick={() => { handleCopy(); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface font-body-md text-left relative"
                >
                  {opt.icon}
                  <span>{copied ? "Đã copy link!" : opt.label}</span>
                </button>
              )
            }
            return (
              <a
                key={opt.key}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface font-body-md"
              >
                {opt.icon}
                <span>{opt.label}</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
