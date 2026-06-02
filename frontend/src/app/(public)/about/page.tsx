"use client"

import { useQuery } from "@tanstack/react-query"
import { getPublicFooter } from "@/services/public"
import { useState, type FormEvent } from "react"

export default function AboutPage() {
  const { data } = useQuery({
    queryKey: ["public-footer"],
    queryFn: getPublicFooter,
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.")
  }

  return (
    <main className="flex-grow pb-section-gap">
      <section className="bg-surface-container-low py-2xl mb-2xl">
        <div className="max-w-container-max mx-auto px-margin-desktop text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-md">Liên hệ với chúng tôi</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[800px] mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngần ngại liên hệ với đội ngũ VIETSHOP để được giải đáp mọi thắc mắc về sản phẩm và dịch vụ.
          </p>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-5 space-y-lg">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-xl shadow-sm">
              <h2 className="font-title-lg text-title-lg text-on-background mb-xl">Thông tin liên hệ</h2>
              <div className="space-y-xl">
                <div className="flex gap-md items-start">
                  <div className="bg-primary p-sm rounded-lg">
                    <span className="material-symbols-outlined text-white">location_on</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-primary">Địa chỉ</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{data?.address || "123 Đường ABC, Quận 1, TP.HCM"}</p>
                  </div>
                </div>
                <div className="flex gap-md items-start">
                  <div className="bg-primary p-sm rounded-lg">
                    <span className="material-symbols-outlined text-white">call</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-primary">Hotline</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{data?.phone || "1900 xxxx"}</p>
                  </div>
                </div>
                <div className="flex gap-md items-start">
                  <div className="bg-primary p-sm rounded-lg">
                    <span className="material-symbols-outlined text-white">mail</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-primary">Email</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{data?.email || "support@vietshop.com"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3xl pt-xl border-t border-outline-variant/20">
                <p className="font-label-lg text-label-lg text-on-surface mb-md">Kết nối với chúng tôi</p>
                <div className="flex gap-md">
                  <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-xl shadow-sm">
              <h2 className="font-title-lg text-title-lg text-on-background mb-xl">Gửi yêu cầu hỗ trợ</h2>
              <form className="space-y-lg" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Họ tên</label>
                    <input className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary transition-colors" placeholder="Nhập họ tên của bạn" required type="text" />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Email</label>
                    <input className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary transition-colors" placeholder="example@email.com" required type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Số điện thoại</label>
                    <input className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary transition-colors" placeholder="090x xxx xxx" type="tel" />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Chủ đề</label>
                    <select className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary transition-colors">
                      <option>Tư vấn sản phẩm</option>
                      <option>Hỗ trợ kỹ thuật</option>
                      <option>Khiếu nại dịch vụ</option>
                      <option>Hợp tác kinh doanh</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Tin nhắn</label>
                  <textarea className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary transition-colors resize-none" placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..." required rows={5}></textarea>
                </div>
                <div className="flex justify-end">
                  <button className="bg-primary text-white font-label-lg px-3xl py-md rounded-xl hover:bg-primary/80 transition-all duration-300 shadow-md active:scale-[0.98]" type="submit">
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-3xl">
          <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm h-[450px] relative group">
            <img
              alt="Bản đồ vị trí cửa hàng"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/40 to-transparent flex items-end p-xl">
              <div className="bg-white p-lg rounded-xl shadow-lg border border-outline-variant/20 max-w-[24rem]">
                <h3 className="font-title-lg text-title-lg text-on-background mb-xs">Cửa hàng trung tâm</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Tọa lạc tại vị trí đắc địa trung tâm Quận 1, thuận tiện cho việc di chuyển và trải nghiệm trực tiếp.</p>
                <a className="text-primary font-label-lg flex items-center gap-xs hover:underline" href="#">
                  Xem đường đi trên Google Maps <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
