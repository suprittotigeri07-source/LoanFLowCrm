import React, { useState } from 'react'
import { Calendar, Plus, Clock, AlertCircle, CheckCircle, Search, Filter, X, Edit, UserCheck } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminFollowUpsPage() {
  const { followUps, telecallers, customers, addFollowUp, updateFollowUpStatus, showToast } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    customer: '',
    mobile: '',
    leadId: '',
    telecaller: 'Priya Verma',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    reason: '',
    leadStatus: 'INTERESTED',
    priority: 'Hot',
  })

  // Metric counts
  const dueToday = followUps?.filter(f => f.status === 'Pending' && f.date === new Date().toISOString().split('T')[0]).length || 0
  const overdueCount = followUps?.filter(f => f.status === 'Overdue').length || 0
  const upcomingCount = followUps?.filter(f => f.status === 'Pending').length || 0
  const completedCount = followUps?.filter(f => f.status === 'Completed').length || 0

  const filteredFollowups = (followUps || []).filter(f => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || f.customer.toLowerCase().includes(q) || f.telecaller.toLowerCase().includes(q) || f.reason.toLowerCase().includes(q)
    const matchesStatus = !statusFilter || f.status === statusFilter
    const matchesPriority = !priorityFilter || f.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Hot':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full text-[10px]">🔥 Hot</span>
      case 'High':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded-full text-[10px]">🔴 High</span>
      case 'Medium':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 font-bold rounded-full text-[10px]">🟡 Medium</span>
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-full text-[10px]">⚪ Low</span>
    }
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!formData.customer || !formData.reason) {
      showToast('Please select customer and reason', 'error')
      return
    }
    addFollowUp(formData)
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track scheduled callbacks, pending customer tasks, and overdue actions.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Plus size={16} /> Schedule Follow-up
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Due Today</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{dueToday}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-red-600 shadow-sm">
          <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertCircle size={13} /> Overdue
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{overdueCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-amber-600 shadow-sm">
          <div className="text-xs font-semibold text-amber-600">Pending Upcoming</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{upcomingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600">Completed</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-purple-600 shadow-sm">
          <div className="text-xs font-semibold text-purple-600">Total Follow-ups</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{followUps?.length || 0}</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, telecaller, reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="Hot">🔥 Hot</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">⚪ Low</option>
        </select>
      </div>

      {/* FOLLOW-UP TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Telecaller</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Reason / Remark</th>
                <th className="px-4 py-3.5">Lead Status</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFollowups.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-gray-900">{f.customer}</td>
                  <td className="px-4 py-3.5 font-semibold text-indigo-700">{f.telecaller}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-700">{f.date} {f.time}</td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[220px] truncate">{f.reason}</td>
                  <td className="px-4 py-3.5 font-semibold text-purple-600">{f.leadStatus}</td>
                  <td className="px-4 py-3.5">{getPriorityBadge(f.priority)}</td>
                  <td className="px-4 py-3.5">
                    {f.status === 'Overdue' ? (
                      <span className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-full text-[10px] animate-pulse shadow-sm">
                        OVERDUE ⚠️
                      </span>
                    ) : f.status === 'Completed' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">
                        Completed ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-full text-[10px]">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    {f.status !== 'Completed' && (
                      <button
                        onClick={() => updateFollowUpStatus(f.id, 'Completed')}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 text-[11px]"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => updateFollowUpStatus(f.id, 'Cancelled')}
                      className="px-2.5 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 text-[11px]"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE FOLLOW-UP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-base">Schedule New Follow-up</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Customer *</label>
                <select
                  required
                  value={formData.customer}
                  onChange={e => {
                    const cust = customers.find(c => c.name === e.target.value)
                    setFormData({ ...formData, customer: e.target.value, leadId: cust?.id || '', mobile: cust?.mobile || '' })
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Assigned Telecaller</label>
                <select
                  value={formData.telecaller}
                  onChange={e => setFormData({ ...formData, telecaller: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                >
                  {telecallers.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Follow-up Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                >
                  <option value="Hot">🔥 Hot</option>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">⚪ Low</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Reason / Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for call..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
