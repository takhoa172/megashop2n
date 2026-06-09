"use client"

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { InventoryChartItem } from "@/types"

interface Props {
  data: InventoryChartItem[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-700">{item.name}</p>
      <p className="text-sm font-bold mt-1" style={{ color: item.color }}>{item.value} sản phẩm</p>
    </div>
  )
}

export function InventoryPieChart({ data }: Props) {
  if (!data?.length) return null
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="mt-4">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={50} outerRadius={80}
              paddingAngle={4} dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
            <span className="font-medium text-slate-700">
              ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
