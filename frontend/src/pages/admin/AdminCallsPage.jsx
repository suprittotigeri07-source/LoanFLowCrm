import React, { useState } from 'react'
import { PhoneCall, Download, Search, Play, Volume2, Calendar, Filter, X, CheckCircle, Clock } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminCallsPage() {
  const { calls, telecallers, showToast } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [telecallerFilter, setTelecallerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('')
  const [selectedCall, setSelectedCall] = useState(null)

  const totalCalls = calls?.length || 0
  const connectedCount = calls?.filter(c => c.status === 'Connected').length || 0
  const notConnectedCount = totalCalls - connectedCount
  const interestedCount = calls?.filter(c => c.outcome === 'Interested').length || 0
  const avgDuration = '03:15'

  const filteredCalls = (calls || []).filter(c => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || c.customer.toLowerCase().includes(q) || c.mobile.includes(q) || c.telecaller.toLowerCase().includes(q)
    const matchesTelecaller = !telecallerFilter || c.telecaller === telecallerFilter
    const matchesStatus = !statusFilter || c.status === statusFilter
    const matchesOutcome = !outcomeFilter || c.outcome === outcomeFilter
    return matchesSearch && matchesTelecaller && matchesStatus && matchesOutcome
  })

  const exportCallLogs = () => {
    const headers = ['Date & Time,Telecaller,Customer,Mobile,Duration,Type,Status,Outcome,Lead Status,Remarks\n']
    const rows = filteredCalls.map(
      c => `"${c.dateTime}","${c.telecaller}","${c.customer}","${c.mobile}","${c.duration}","${c.type}","${c.status}","${c.outcome}","${c.leadStatus}","${c.remarks}"\n`
    )
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LoanFlow_Call_Logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast('Call logs exported successfully!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all customer calls and telecaller activity.</p>
        </div>
        <button
          onClick={exportCallLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Download size={16} /> Export Call Logs (CSV)
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Total Calls</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalCalls}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600">Connected</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{connectedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-amber-600 shadow-sm">
          <div className="text-xs font-semibold text-amber-600">Not Connected</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{notConnectedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-purple-600 shadow-sm">
          <div className="text-xs font-semibold text-purple-600">Interested</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{interestedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-cyan-600 shadow-sm">
          <div className="text-xs font-semibold text-cyan-600">Average Duration</div>
          <div className="text-2xl font-bold text-cyan-700 mt-1">{avgDuration}</div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, mobile, telecaller..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={telecallerFilter}
          onChange={e => setTelecallerFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Telecallers</option>
          {telecallers.map(t => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Call Statuses</option>
          {['Connected', 'Busy', 'No Answer', 'Rejected', 'Failed', 'Wrong Number'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Outcomes</option>
          {[
            'Interested', 'Not Interested', 'Call Later', 'Number Busy', 'No Response',
            'Wrong Number', 'Already Taken Loan', 'Documents Pending', 'Eligible', 'Not Eligible'
          ].map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* CALL LOG TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Telecaller</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Mobile</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Call Type</th>
                <th className="px-4 py-3.5">Call Status</th>
                <th className="px-4 py-3.5">Outcome</th>
                <th className="px-4 py-3.5">Lead Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCalls.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-gray-500 text-[11px]">{c.dateTime}</td>
                  <td className="px-4 py-3.5 font-bold text-indigo-700">{c.telecaller}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-900">{c.customer}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-700">{c.mobile}</td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-gray-800">{c.duration}</td>
                  <td className="px-4 py-3.5 text-gray-600">{c.type || 'Outgoing'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-purple-700">{c.outcome}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px]">
                      {c.leadStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedCall(c)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px]"
                    >
                      Call Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALL DETAILS MODAL */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Call Log Details</h2>
                <p className="text-xs text-gray-400">{selectedCall.dateTime}</p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Customer Name</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedCall.customer}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Mobile Number</span>
                  <span className="font-bold font-mono text-indigo-600 text-sm">{selectedCall.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Telecaller Executive</span>
                  <span className="font-semibold text-purple-700">{selectedCall.telecaller}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Call Duration</span>
                  <span className="font-bold font-mono text-gray-800">{selectedCall.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <span className="text-indigo-600 font-semibold block">Call Status</span>
                  <span className="font-bold text-indigo-900 text-sm">{selectedCall.status}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <span className="text-purple-600 font-semibold block">Call Outcome</span>
                  <span className="font-bold text-purple-900 text-sm">{selectedCall.outcome}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold block mb-1">Telecaller Remarks</span>
                <p className="text-gray-800">{selectedCall.remarks || 'No detailed remarks entered.'}</p>
              </div>

              {/* Call Recording Player Mockup */}
              <div className="p-4 bg-gray-900 text-white rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Volume2 size={14} className="text-indigo-400" /> Audio Recording</span>
                  <span>Exotel Telephony Cloud</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500">
                    <Play size={14} />
                  </button>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
                  </div>
                  <span className="font-mono text-[10px] text-gray-300">{selectedCall.duration}</span>
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  Note: Call recordings are streamed securely directly from integrated telephony provider.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
