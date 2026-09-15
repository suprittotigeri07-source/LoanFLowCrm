import React, { useState, useEffect } from 'react'
import { Phone, CheckCircle, Clock, Loader2 } from 'lucide-react'
import Badge from '../../components/common/Badge'
import Toast from '../../components/common/Toast'
import { api } from '../../api'

const formatLakh = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`

function FollowUpCard({ f, isOverdue, onComplete }) {
  const dueDate = new Date(f.due_at)
  const isToday = dueDate.toDateString() === new Date().toDateString()
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await onComplete(f.id)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all duration-200 ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold text-gray-900">{f.customer_name}</div>
          <div className="text-sm text-gray-500">{f.lead_business_name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
          <Clock size={14} />
          {isOverdue ? '⚠ Overdue' : isToday ? `Today • ${dueDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
        {f.customer_mobile && <span className="text-gray-500 text-xs">{f.customer_mobile}</span>}
      </div>
      {f.remarks && <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3">{f.remarks}</div>}
      <div className="flex gap-2">
        <a href={`tel:${f.customer_mobile || ''}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
          <Phone size={14} /> Call
        </a>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {completing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle size={14} />
          )}
          Complete
        </button>
      </div>
    </div>
  )
}

export default function FollowUpsPage() {
  const [todayFUs, setTodayFUs] = useState([])
  const [overdueFUs, setOverdueFUs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchData = async () => {
    try {
      const [todayData, overdueData] = await Promise.all([
        api.getTodayFollowUps().catch(() => ({ follow_ups: [] })),
        api.getOverdueFollowUps().catch(() => ({ overdue_follow_ups: [] })),
      ])
      setTodayFUs(todayData.follow_ups || [])
      setOverdueFUs(overdueData.overdue_follow_ups || [])
    } catch (err) {
      console.error('Failed to load follow-ups:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleComplete = async (id) => {
    try {
      await api.completeFollowUp(id)
      setToast({ message: 'Follow-up marked as completed!', type: 'success' })
      // Refresh
      await fetchData()
    } catch (err) {
      setToast({ message: err.message || 'Failed to complete follow-up', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500">Loading follow-ups...</span>
      </div>
    )
  }

  // Split today FUs into actually-today vs upcoming (today endpoint returns today's range)
  const now = new Date()

  const Section = ({ title, badge, badgeColor, items, empty, isOverdueSection }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-8 text-center text-gray-400 text-sm">{empty}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(f => <FollowUpCard key={f.id} f={f} isOverdue={isOverdueSection} onComplete={handleComplete} />)}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">{overdueFUs.length} overdue · {todayFUs.length} today</p>
      </div>
      <Section title="Overdue" badge={overdueFUs.length} badgeColor="bg-red-100 text-red-700" items={overdueFUs} empty="No overdue follow-ups. Great work! 🎉" isOverdueSection={true} />
      <Section title="Today" badge={todayFUs.length} badgeColor="bg-blue-100 text-blue-700" items={todayFUs} empty="No follow-ups scheduled for today." isOverdueSection={false} />
    </div>
  )
}
