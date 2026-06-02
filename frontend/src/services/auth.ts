import api from "./api"
import { User } from "@/types"

export async function login(
  email: string,
  password: string
): Promise<{ access: string; refresh: string; user: User }> {
  const { data } = await api.post("/auth/login", { email, password })
  return data
}

export async function refreshToken(
  refresh: string
): Promise<{ access: string; refresh: string }> {
  const { data } = await api.post("/auth/refresh", { refresh })
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/auth/me")
  return data
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get("/auth/users")
  return data.results || data
}

export async function register(
  full_name: string,
  email: string,
  password: string,
  password_confirm: string
): Promise<{ access: string; refresh: string; user: User }> {
  const { data } = await api.post("/auth/register", { full_name, email, password, password_confirm })
  return data
}

export async function createUser(userData: Partial<User> & { password: string }) {
  const { data } = await api.post("/auth/users", userData)
  return data
}
