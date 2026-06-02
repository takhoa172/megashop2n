"use client"

import { useQuery } from "@tanstack/react-query"
import { getPublicFooter } from "@/services/public"
import Link from "next/link"

export function PublicFooter() {
  const { data: footer } = useQuery({
    queryKey: ["public-footer"],
    queryFn: getPublicFooter,
  })

  return (
    <footer className="bg-secondary text-on-secondary">
      <div className="w-full px-margin-desktop py-section-gap grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container-max mx-auto">
          <div className="flex flex-col gap-4">
            <span className="font-headline-lg text-headline-lg font-black text-on-primary">
              {footer?.company_name || "VIETSHOP"}
            </span>
            <p className="text-on-secondary/70 text-body-sm">
              {footer?.description || "Nâng tầm trải nghiệm mua sắm trực tuyến của bạn với những sản phẩm chất lượng và dịch vụ tận tâm nhất."}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg text-label-lg uppercase opacity-70">Liên kết nhanh</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-body-sm text-white/80 hover:text-primary transition-colors">Về chúng tôi</Link>
              <Link href="/products" className="text-body-sm text-white/80 hover:text-primary transition-colors">Sản phẩm mới</Link>
              <Link href="/blogs" className="text-body-sm text-white/80 hover:text-primary transition-colors">Blog thời trang</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg text-label-lg uppercase opacity-70">Chính sách</h4>
            <div className="flex flex-col gap-2">
              <Link href="#" className="text-body-sm text-white/80 hover:text-primary transition-colors">Chính sách bảo mật</Link>
              <Link href="#" className="text-body-sm text-white/80 hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
              <Link href="#" className="text-body-sm text-white/80 hover:text-primary transition-colors">Câu hỏi thường gặp</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg text-label-lg uppercase opacity-70">Đăng ký bản tin</h4>
            <p className="text-body-sm text-on-secondary/80">Nhận thông tin khuyến mãi sớm nhất</p>
            <div className="flex mt-2">
              <input
                className="bg-white/10 border border-white/20 px-4 py-2 flex-grow focus:ring-0 text-on-secondary placeholder-on-secondary/40"
                placeholder="Email của bạn"
                type="email"
              />
              <button className="bg-primary text-on-primary px-4 py-2 font-label-lg hover:bg-primary/90">
                Gửi
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-label-sm text-on-secondary/60">
            {footer?.copyright_text || "© 2024 VIETSHOP. Bảo lưu mọi quyền."}
          </p>
          <div className="flex gap-6">
            <a href={footer?.facebook || "#"} target="_blank" rel="noopener noreferrer" className="text-on-secondary/60 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined">social_leaderboard</span>
            </a>
            <a href={footer?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="text-on-secondary/60 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href={footer?.youtube || "#"} target="_blank" rel="noopener noreferrer" className="text-on-secondary/60 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined">play_circle</span>
            </a>
          </div>
        </div>
    </footer>
  )
}
