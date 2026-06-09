"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react"
import { User } from "@/types"
import { login as apiLogin, register as apiRegister, getMe, refreshToken } from "@/services/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (full_name: string, email: string, phone: string, password: string, password_confirm: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token")
      const refresh = localStorage.getItem("refresh_token")
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const user = await getMe()
        setUser(user)
      } catch {
        // getMe failed (likely 401) — try refreshing token first
        if (refresh) {
          try {
            const data = await refreshToken(refresh)
            localStorage.setItem("access_token", data.access)
            localStorage.setItem("refresh_token", data.refresh)
            const user = await getMe()
            setUser(user)
          } catch {
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user")
          }
        } else {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password)
      localStorage.removeItem("cart")
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      if (data.user.role === "CUSTOMER") {
        router.push("/")
      } else {
        router.push("/admin/dashboard")
      }
    },
    [router]
  )

  const register = useCallback(
    async (full_name: string, email: string, phone: string, password: string, password_confirm: string) => {
      const data = await apiRegister(full_name, email, phone, password, password_confirm)
      localStorage.removeItem("cart")
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      if (data.user.role === "CUSTOMER") {
        router.push("/")
      } else {
        router.push("/admin/dashboard")
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    localStorage.removeItem("cart")
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
