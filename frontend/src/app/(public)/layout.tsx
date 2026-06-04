import { PublicNavbar } from "@/components/public/PublicNavbar"
import { PublicFooter } from "@/components/public/PublicFooter"
import { NotificationBanner } from "@/components/public/NotificationBanner"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <NotificationBanner />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
