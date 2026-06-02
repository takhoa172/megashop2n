"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getSiteSettings } from "@/services/public"
import { useAuth } from "@/contexts/AuthContext"

const defaultNavLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "Giới thiệu" },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  })

  const siteName = siteSettings?.site_name || "VIETSHOP"
  const siteLogo = siteSettings?.site_logo_url
  const navLinks = siteSettings?.nav_links?.length > 0 ? siteSettings.nav_links : defaultNavLinks

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0F172A] border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-margin-desktop h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-2xl font-black text-white tracking-tight">{siteName}</span>
          )}
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.label}
              href={link.href}
              className={`font-label-lg text-label-lg transition-colors ${
                isActive(link.href)
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-white/80 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white/10 rounded-full border border-white/20 px-4 py-2">
            <span className="material-symbols-outlined text-white/60">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 outline-none text-white/80 placeholder-white/40 ml-2 w-48"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button className="text-white/80 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
          {user ? (
            <Link href="/account" className="text-white/80 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          ) : (
            <Link href="/login" className="text-white/80 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          )}
          <button
            className="md:hidden text-white/80 hover:text-primary transition-colors"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <span className="material-symbols-outlined">{mobileMenu ? "close" : "menu"}</span>
          </button>
        </div>
      </div>
      {mobileMenu && (
        <div className="md:hidden border-t border-white/10 px-margin-desktop py-4 space-y-3">
          {navLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenu(false)}
              className={`block font-label-lg ${
                isActive(link.href) ? "text-primary" : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-full border border-white/20 px-4 py-2 mt-3">
            <span className="material-symbols-outlined text-white/60">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 outline-none text-white/80 placeholder-white/40 ml-2 w-full"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}
    </nav>
  )
}
