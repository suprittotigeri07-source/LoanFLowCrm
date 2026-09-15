import React, { useState, useEffect } from 'react'
import { Users, PhoneCall, Target, Bell, AlertCircle, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../../components/dashboard/StatCard'
import { api } from '../../api'

export default function AsmDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAdminMetrics()
        setMetrics(data)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-600 underline">Retry</button>
      </div>
    )
  }

  const overview = metrics?.overview || {}
  const telecallerPerf = metrics?.telecaller_performance || []

  const chartData = telecallerPerf.map(t => ({
    name: t.name.split(' ')[0],
    Leads: t.assigned_leads,
    Calls: t.calls_today,
    Interested: t.interested_leads,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">ASM Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Team performance overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Team Leads" value={overview.total_leads || 0} sub={`${telecallerPerf.length} telecallers`} icon={Users} color="indigo" />
        <StatCard label="Calls Today" value={overview.calls_today || 0} sub={`${overview.connected_today || 0} connected`} icon={PhoneCall} color="blue" />
        <StatCard label="Connected" value={overview.connected_today || 0} sub={overview.calls_today > 0 ? `${Math.round((overview.connected_today / overview.calls_today) * 100)}% rate` : '0% rate'} icon={Target} color="emerald" />
        <StatCard label="Interested Today" value={overview.interested_today || 0} sub="From today" icon={Bell} color="amber" />
        <StatCard label="Unassigned" value={overview.unassigned_leads || 0} sub="Need assignment" icon={AlertCircle} color="red" />
      </div>

      {/* Team Performance Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Team Comparison</h3>
        <p className="text-xs text-gray-400 mb-4">Calls vs Interested leads per telecaller</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="Calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Interested" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No telecaller data available</div>
        )}
      </div>

      {/* Telecaller Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Telecaller Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Telecaller', 'Territory', 'Assigned', 'Calls', 'Connected', 'Interested', 'Follow-ups'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {telecallerPerf.length > 0 ? [...telecallerPerf].sort((a, b) => b.interested_leads - a.interested_leads).map((t, i) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{t.name[0]}</div>
                      <span className="font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{t.territory}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{t.assigned_leads}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{t.calls_today}</td>
                  <td className="px-3 py-3 text-blue-600 font-semibold">{t.connected_today}</td>
                  <td className="px-3 py-3 text-emerald-600 font-semibold">{t.interested_leads}</td>
                  <td className="px-3 py-3 text-gray-600">{t.pending_followups}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">No telecaller data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
