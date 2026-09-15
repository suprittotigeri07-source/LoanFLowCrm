import React, { useState } from 'react'
import { Users, PhoneCall, Target, TrendingUp, Calendar, ChevronDown, CheckCircle, FileText, Landmark, Clock, ArrowUpRight, Award } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import UnifiedCustomerModal from '../../components/common/UnifiedCustomerModal'

export default function AdminDashboard() {
  const { customers, telecallers, calls, followUps, documents } = useAdmin()
  const [dateFilter, setDateFilter] = useState('Today')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [sortField, setSortField] = useState('callsToday')

  // Calculated Summary Metrics
  const totalLeads = customers?.length || 0
  const newLeads = customers?.filter(c => c.status === 'NEW LEAD').length || 0
  const callsToday = calls?.length || 0
  const connectedCalls = calls?.filter(c => c.status === 'Connected').length || 0
  const interestedLeads = customers?.filter(c => c.status === 'INTERESTED').length || 0
  const followupsDue = followUps?.filter(f => f.status === 'Pending' || f.status === 'Overdue').length || 0
  const docsPending = documents?.filter(d => d.status === 'Pending').length || 0
  const loginCases = customers?.filter(c => c.status === 'LOGIN').length || 0
  const approvalCases = customers?.filter(c => c.status === 'APPROVAL').length || 0
  const disbursements = customers?.filter(c => c.status === 'DISBURSEMENT').length || 0

  const summaryCards = [
    { label: 'Total Leads', val: totalLeads, sub: `${newLeads} new today`, icon: Users, color: 'border-l-indigo-600 bg-indigo-50/40 text-indigo-700' },
    { label: 'New Leads', val: newLeads, sub: 'Needs initial calling', icon: Target, color: 'border-l-blue-600 bg-blue-50/40 text-blue-700' },
    { label: 'Calls Today', val: callsToday, sub: `${connectedCalls} connected`, icon: PhoneCall, color: 'border-l-purple-600 bg-purple-50/40 text-purple-700' },
    { label: 'Connected Calls', val: connectedCalls, sub: `${Math.round((connectedCalls / (callsToday || 1)) * 100)}% connection rate`, icon: CheckCircle, color: 'border-l-emerald-600 bg-emerald-50/40 text-emerald-700' },
    { label: 'Interested', val: interestedLeads, sub: 'High intent leads', icon: TrendingUp, color: 'border-l-teal-600 bg-teal-50/40 text-teal-700' },
    { label: 'Follow-ups Due', val: followupsDue, sub: 'Action required', icon: Clock, color: 'border-l-amber-600 bg-amber-50/40 text-amber-700' },
    { label: 'Documents Pending', val: docsPending, sub: 'Awaiting customer files', icon: FileText, color: 'border-l-orange-600 bg-orange-50/40 text-orange-700' },
    { label: 'Login Cases', val: loginCases, sub: 'In bank credit processing', icon: Landmark, color: 'border-l-cyan-600 bg-cyan-50/40 text-cyan-700' },
    { label: 'Approved', val: approvalCases, sub: 'Sanction letter issued', icon: Award, color: 'border-l-emerald-600 bg-emerald-50/40 text-emerald-700' },
    { label: 'Disbursed', val: disbursements, sub: 'Loan funds released', icon: CheckCircle, color: 'border-l-indigo-700 bg-indigo-100/50 text-indigo-900' },
  ]

  // Pipeline stage breakdown
  const stages = [
    'NEW LEAD', 'CONTACTED', 'INTERESTED', 'ELIGIBILITY',
    'DOCUMENTS PENDING', 'DOCUMENTS RECEIVED', 'LOGIN',
    'CREDIT / PD', 'APPROVAL', 'DISBURSEMENT', 'REJECTED',
  ]

  const stageCounts = stages.map(st => {
    const count = customers?.filter(c => c.status === st).length || 0
    const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0
    return { name: st, count, pct }
  })

  // Telecaller sorting
  const sortedTelecallers = [...(telecallers || [])].sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your business loan operations today.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700">
            <Calendar size={15} className="text-indigo-600" />
            <span>Range:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-indigo-700"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS GRID */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Metrics Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {summaryCards.map(c => (
            <div key={c.label} className={`bg-white rounded-2xl p-4 border border-gray-100 border-l-4 ${c.color} shadow-sm transition-transform hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 truncate">{c.label}</span>
                <c.icon size={16} className="opacity-70" />
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">{c.val.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 font-medium mt-1 truncate">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN SECTION */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* TELECALLER PERFORMANCE TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Telecaller Performance</h3>
              <p className="text-xs text-gray-400">Live operational activity per team member</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="callsToday">Calls Today</option>
                <option value="assignedLeads">Assigned Leads</option>
                <option value="interested">Interested</option>
                <option value="disbursement">Disbursement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="px-3.5 py-2.5">Telecaller</th>
                  <th className="px-3.5 py-2.5 text-center">Assigned</th>
                  <th className="px-3.5 py-2.5 text-center">Calls</th>
                  <th className="px-3.5 py-2.5 text-center">Connected</th>
                  <th className="px-3.5 py-2.5 text-center">Interested</th>
                  <th className="px-3.5 py-2.5 text-center">Follow-ups</th>
                  <th className="px-3.5 py-2.5 text-center">Login</th>
                  <th className="px-3.5 py-2.5 text-center">Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedTelecallers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3.5 py-3 font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {t.name[0]}
                      </div>
                      <div>
                        <div>{t.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{t.branch}</div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-gray-700">{t.assignedLeads}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-indigo-600">{t.callsToday}</td>
                    <td className="px-3.5 py-3 text-center font-semibold text-purple-600">{t.connected}</td>
                    <td className="px-3.5 py-3 text-center font-semibold text-emerald-600">{t.interested}</td>
                    <td className="px-3.5 py-3 text-center text-amber-600">{t.followups}</td>
                    <td className="px-3.5 py-3 text-center font-semibold text-cyan-600">{t.login}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-emerald-700">{t.disbursement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEAD PIPELINE SUMMARY */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Lead Pipeline Summary</h3>
            <p className="text-xs text-gray-400">Stage-wise business loan distribution</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {stageCounts.map(st => (
              <div key={st.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{st.name}</span>
                  <span className="text-gray-900 font-bold">
                    {st.count} <span className="text-gray-400 font-normal">({st.pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(st.pct, st.count ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT LEADS QUICK TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Customer Leads</h3>
            <p className="text-xs text-gray-400">Click any customer row to view their unified 360° record</p>
          </div>
          <a href="/admin/leads" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Leads <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                <th className="px-4 py-2.5">Lead ID</th>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Business</th>
                <th className="px-4 py-2.5">Loan Amount</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Telecaller</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers?.slice(0, 5).map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.businessName}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">
                    ₹{(c.loanAmount / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.assignedTelecaller || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                      Open Record →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Customer Modal */}
      {selectedCustomer && (
        <UnifiedCustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
