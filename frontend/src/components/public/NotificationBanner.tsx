"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getActiveNotification } from "@/services/public"

export function NotificationBanner() {
  const [dismissed, setDismissed] = useState(true)
  const { data } = useQuery({
    queryKey: ["active-notification"],
    queryFn: getActiveNotification,
    refetchOnWindowFocus: false,
  })

  const notification = data?.notification || data

  useEffect(() => {
    if (notification?.id) {
      const key = `dismissed_notification_${notification.id}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const timestamp = parseInt(stored, 10)
        const now = Date.now()
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          setDismissed(true)
        } else {
          localStorage.removeItem(key)
          setDismissed(false)
        }
      } else {
        setDismissed(false)
      }
    }
  }, [notification?.id])

  if (!notification || dismissed) return null

  const handleDismiss = () => {
    const key = `dismissed_notification_${notification.id}`
    localStorage.setItem(key, String(Date.now()))
    setDismissed(true)
  }

  return (
    <div className="bg-primary text-on-primary text-center py-2 px-4 relative">
      <p className="text-sm font-medium">
        {notification.title && <strong>{notification.title}: </strong>}
        {notification.message}
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-primary/80 hover:text-on-primary"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}
