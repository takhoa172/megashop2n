import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config._retry
    ) {
      error.config._retry = true
      try {
        const refresh = localStorage.getItem("refresh_token")
        if (refresh) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh }
          )
          localStorage.setItem("access_token", data.access)
          localStorage.setItem("refresh_token", data.refresh)
          error.config.headers.Authorization = `Bearer ${data.access}`
          return api(error.config)
        }
      } catch {
        // refresh token failed — fall through to cleanup
      }
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
    }
    return Promise.reject(error)
  }
)

export default api
