import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, Eye, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../../components/common/Badge'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

const PIPELINE_STAGES = [
  'New Lead', 'Contacted', 'Interested', 'Eligibility Check',
  'Documents Pending', 'Login', 'Credit/PD', 'Approval', 'Disbursement',
]

const formatLakh = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = { page }
      if (statusFilter) params.status = statusFilter
      if (search) params.search = search
      const data = await api.getLeads(params)
      setLeads(data.results || [])
      setTotalCount(data.count || 0)
      setNextPage(data.next)
      setPrevPage(data.previous)
    } catch (err) {
      setError(err.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [page, statusFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchLeads()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const totalPages = Math.ceil(totalCount / 25) // backend PAGE_SIZE is 25

  const basePath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'ASM' ? '/asm' : '/telecaller'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.role === 'TELECALLER' ? 'My Leads' : 'All Leads'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} leads found</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/admin/leads/upload" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            + Upload Leads
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, business, mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="ml-3 text-gray-500">Loading leads...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Customer', 'Business', 'Location', 'Loan Amount', 'Status', 'Assigned To', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No leads match your search.</td></tr>
                  ) : leads.map(lead => (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {(lead.customer?.name || 'U')[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{lead.customer?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">#{String(lead.id).slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-[140px] truncate">{lead.business_name}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{lead.customer?.city || '—'}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{formatLakh(Number(lead.required_loan_amount))}</td>
                      <td className="px-4 py-3.5"><Badge label={lead.status} /></td>
                      <td className="px-4 py-3.5 text-gray-600">{lead.assigned_to?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                      <td className="px-4 py-3.5">
                        <Link to={`/leads/${lead.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Page {page} of {totalPages} ({totalCount} total)</span>
                <div className="flex gap-1.5">
                  <button disabled={!prevPage} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                  <button disabled={!nextPage} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
