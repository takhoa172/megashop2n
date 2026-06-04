"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const { login, register } = useAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(loginEmail, loginPassword)
    } catch {
      setError("Email hoặc mật khẩu không đúng")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (regPassword !== regConfirm) {
      setError("Mật khẩu nhập lại không khớp")
      return
    }
    try {
      await register(regName, regEmail, regPhone, regPassword, regConfirm)
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.email?.[0]
        || "Đăng ký thất bại"
      setError(msg)
    }
  }

  const toggle = (toLogin: boolean) => {
    setIsLogin(toLogin)
    setError("")
  }

  return (
    <main className="flex-grow flex items-center justify-center py-3xl px-margin-mobile md:px-margin-desktop bg-background">
      <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden relative">
        <div className="p-xl md:p-2xl" id="auth-container">
          {/* Login Form */}
          <section
            className="transition-all duration-[400ms]"
            style={{
              opacity: isLogin ? 1 : 0,
              transform: isLogin ? "translateX(0)" : "translateX(-48px)",
              maxHeight: isLogin ? "800px" : "0",
              overflow: "hidden",
            }}
          >
            <div className="mb-xl text-center">
              <h1 className="font-headline-lg text-headline-lg text-on-background mb-sm">Đăng nhập</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Chào mừng bạn quay lại với VIETSHOP</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-lg">
              {error && (
                <p className="text-sm text-error bg-error-container p-2 rounded-lg">{error}</p>
              )}
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Email</label>
                <input
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                  placeholder="email@vi-du.com"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Mật khẩu</label>
                  <a className="font-label-md text-label-md text-primary hover:underline" href="#">Quên mật khẩu?</a>
                </div>
                <input
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                  placeholder="••••••••"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-title-lg text-title-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
                type="submit"
              >
                Đăng nhập
              </button>
            </form>
            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant"></div></div>
              <div className="relative flex justify-center text-body-sm font-body-sm">
                <span className="bg-surface-container-lowest px-md text-on-surface-variant uppercase tracking-wider">Hoặc đăng nhập bằng</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md mb-xl">
              <button className="flex items-center justify-center gap-sm border border-outline-variant py-sm rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md" type="button">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq-hjLQrZ8GPWwpTs95h9mipWjPqah2EsftWh0xc7WfDTluVZJBThWlwAuB2mTHlkvGwh6x2254TgrJYfkpaZMqzgovc8cJSo5hqTw3oA16neUAiTrR6yUWkXiwLoln6wU5bZT8utjlAcl0nZdM2gbmyHlzHHo-QePYhw7jBp1SrQQez6mPrb24LjZe-elmKKTHyIIxaBJ51WXFOi6NagkVsp0OI8-HOC1JjIa9gAcwvG_rftyH_d8zxbihxR2NQe7Xh34Idbxne1T" />
                Google
              </button>
              <button className="flex items-center justify-center gap-sm border border-outline-variant py-sm rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md" type="button">
                <span className="material-symbols-outlined text-[20px]" style={{ color: "#EA4335" }}>mail</span>
                Gmail
              </button>
            </div>
            <div className="text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Chưa có tài khoản?
                <button className="text-primary font-title-lg hover:underline transition-all ml-1" type="button" onClick={() => toggle(false)}>Đăng ký ngay</button>
              </p>
            </div>
          </section>

          {/* Register Form */}
          <section
            className="transition-all duration-[400ms]"
            style={{
              opacity: isLogin ? 0 : 1,
              transform: isLogin ? "translateX(48px)" : "translateX(0)",
              maxHeight: isLogin ? "0" : "800px",
              overflow: "hidden",
            }}
          >
            <div className="mb-xl text-center">
              <h1 className="font-headline-lg text-headline-lg text-on-background mb-sm">Đăng ký</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Bắt đầu mua sắm cùng VIETSHOP hôm nay</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-md">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
              <div className="grid grid-cols-1 gap-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Họ tên</label>
                  <input
                    className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                    placeholder="Nguyễn Văn A"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Email</label>
                  <input
                    className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                    placeholder="email@vi-du.com"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Số điện thoại</label>
                  <input
                    className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                    placeholder="090x xxx xxx"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Mật khẩu</label>
                    <input
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                      placeholder="••••••••"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Nhập lại</label>
                    <input
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-body-md text-body-md"
                      placeholder="••••••••"
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-title-lg text-title-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md mt-lg"
                type="submit"
              >
                Đăng ký
              </button>
            </form>
            <div className="text-center mt-xl">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Đã có tài khoản?
                <button className="text-primary font-title-lg hover:underline transition-all ml-1" type="button" onClick={() => toggle(true)}>Đăng nhập ngay</button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
