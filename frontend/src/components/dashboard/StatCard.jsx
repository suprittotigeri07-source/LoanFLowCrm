import React from 'react'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

export default function StatCard({ label, value, sub, icon: Icon, color = 'indigo', trend, trendValue }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-4 ${c.bg} ${c.ring}`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
