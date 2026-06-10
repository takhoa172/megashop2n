import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: "blue" | "green" | "red" | "purple" | "amber"
  subtitle?: string
  trend?: { value: number; positive: boolean }
}

const variants = {
  blue: { gradient: "from-blue-500 to-blue-600", iconBg: "bg-blue-100 text-blue-600" },
  green: { gradient: "from-green-500 to-green-600", iconBg: "bg-green-100 text-green-600" },
  red: { gradient: "from-red-500 to-red-600", iconBg: "bg-red-100 text-red-600" },
  purple: { gradient: "from-purple-500 to-purple-600", iconBg: "bg-purple-100 text-purple-600" },
  amber: { gradient: "from-amber-500 to-amber-600", iconBg: "bg-amber-100 text-amber-600" },
}

export function StatCard({ title, value, icon: Icon, variant = "blue", subtitle, trend }: StatCardProps) {
  const v = variants[variant]
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${v.gradient} p-5 text-white shadow-lg`}>
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/80">{title}</span>
          <div className={`rounded-xl p-2 ${v.iconBg}`}>
            <Icon size={18} className="text-inherit" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-white/60 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.positive ? "text-green-300" : "text-red-300"}`}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% so với kỳ trước
          </p>
        )}
      </div>
    </div>
  )
}
