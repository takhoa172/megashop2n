import api from "./api"

export interface Notification {
  id: string
  title: string
  message: string
  is_active: boolean
  start_date: string
  end_date: string | null
  created_at: string
}

export async function getActiveNotification() {
  const { data } = await api.get("/notifications/active")
  return data
}

export async function getNotifications() {
  const { data } = await api.get("/notifications/")
  return data.results || data
}

export async function createNotification(
  notificationData: Partial<Notification>
) {
  const { data } = await api.post("/notifications/", notificationData)
  return data
}

export async function updateNotification(
  id: string,
  notificationData: Partial<Notification>
) {
  const { data } = await api.put(`/notifications/${id}`, notificationData)
  return data
}

export async function deleteNotification(id: string) {
  await api.delete(`/notifications/${id}`)
}
