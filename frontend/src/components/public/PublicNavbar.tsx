"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getSiteSettings } from "@/services/public"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"

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
  const { itemCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  })

  const siteName = siteSettings?.site_name || "VIETSHOP"
  const siteLogo = siteSettings?.site_logo_url
  const navLinks = siteSettings?.nav_links?.length > 0 ? siteSettings.nav_links : defaultNavLinks

  const isLoginPage = pathname === "/login"

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
    <nav className={`sticky top-0 z-50 ${isLoginPage ? "bg-on-background" : "bg-secondary"} border-b border-white/10`}>
      <div className="max-w-container-max mx-auto px-margin-desktop py-base flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-2xl font-black text-on-secondary tracking-tight">{siteName}</span>
          )}
        </Link>
        {!isLoginPage && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link: { href: string; label: string }) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-label-lg text-label-lg transition-colors ${
                  isActive(link.href)
                    ? "text-on-primary border-b-2 border-primary pb-1"
                    : "text-on-secondary/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4">
          {!isLoginPage && (
            <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white/10 rounded-full border border-white/20 px-4 py-2">
              <span className="material-symbols-outlined text-on-secondary/60">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 outline-none text-on-secondary/80 placeholder-on-secondary/40 ml-2 w-48"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          )}
          {!isLoginPage && (
            <Link href="/cart" className="text-on-secondary/80 hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-error text-on-primary text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <Link href="/account" className="text-on-secondary/80 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          ) : (
            <Link href="/login" className={`${isLoginPage ? "bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg" : "text-on-secondary/80 hover:text-primary"} transition-colors`}>
              {isLoginPage ? "Đăng nhập" : <span className="material-symbols-outlined">account_circle</span>}
            </Link>
          )}
          <button
            className="md:hidden text-on-secondary/80 hover:text-primary transition-colors"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <span className="material-symbols-outlined">{mobileMenu ? "close" : "menu"}</span>
          </button>
        </div>
      </div>
      {!isLoginPage && mobileMenu && (
        <div className="md:hidden border-t border-white/10 px-margin-desktop py-4 space-y-3">
          {navLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenu(false)}
              className={`block font-label-lg ${
                isActive(link.href) ? "text-primary" : "text-on-secondary/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-full border border-white/20 px-4 py-2 mt-3">
            <span className="material-symbols-outlined text-on-secondary/60">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 outline-none text-on-secondary/80 placeholder-on-secondary/40 ml-2 w-full"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}
    </nav>
  )
}
