import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Clock, CheckCircle, User, Building, TrendingUp, Loader2 } from 'lucide-react'
import Badge from '../../components/common/Badge'
import { api } from '../../api'

const tabs = ['Overview', 'Calls', 'Follow-ups', 'Timeline']
const formatLakh = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await api.getLeadDetail(id)
        setLead(data)
      } catch (err) {
        setError(err.message || 'Failed to load lead')
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500">Loading lead details...</span>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{error || 'Lead not found.'}</p>
        <Link to="/admin/leads" className="text-indigo-600 text-sm font-medium mt-2 inline-block">← Back to leads</Link>
      </div>
    )
  }

  const customer = lead.customer || {}
  const assignedTo = lead.assigned_to || {}
  const leadCalls = lead.calls || []
  const leadFollowUps = lead.follow_ups || []

  // Build timeline from calls and follow-ups
  const timeline = [
    { event: 'Lead Created', date: lead.created_at?.slice(0, 10), icon: User, color: 'bg-gray-400', desc: `Source: ${lead.lead_source}` },
    ...leadCalls.map(c => ({
      event: 'Call Made',
      date: typeof c.timestamp === 'string' ? c.timestamp.slice(0, 10) : '',
      icon: Phone,
      color: 'bg-blue-500',
      desc: `Outcome: ${c.outcome} · Duration: ${Math.floor((c.duration || 0) / 60)}m ${(c.duration || 0) % 60}s`
    })),
    ...leadFollowUps.filter(f => !f.completed).map(f => ({
      event: 'Follow-up Scheduled',
      date: typeof f.due_at === 'string' ? f.due_at.slice(0, 10) : '',
      icon: Clock,
      color: 'bg-amber-500',
      desc: f.remarks || 'Follow-up scheduled'
    })),
    { event: `Status: ${lead.status}`, date: lead.updated_at?.slice(0, 10) || lead.created_at?.slice(0, 10), icon: CheckCircle, color: 'bg-indigo-500', desc: 'Current pipeline stage' },
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin/leads" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors">
            <ArrowLeft size={16} /> Back to Leads
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{customer.name || 'Unknown'}</h1>
          <p className="text-sm text-gray-500">{lead.business_name} · #{String(lead.id).slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={lead.status} />
          <a href={`tel:${customer.mobile || ''}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            <Phone size={15} /> Call
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'Overview' && (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                <User size={14} /> Customer Information
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', value: customer.name || 'N/A' },
                  { label: 'Mobile', value: customer.mobile || 'N/A' },
                  { label: 'Alt Mobile', value: customer.alt_mobile || '—' },
                  { label: 'City', value: customer.city || 'N/A' },
                  { label: 'Pincode', value: customer.pincode || '—' },
                  { label: 'Loan Type', value: lead.loan_type },
                  { label: 'Lead Source', value: lead.lead_source },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                <Building size={14} /> Business Information
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Business Name', value: lead.business_name },
                  { label: 'Business Type', value: lead.business_type || 'N/A' },
                  { label: 'Vintage', value: lead.vintage ? `${lead.vintage} years` : 'N/A' },
                  { label: 'Ownership Type', value: lead.ownership_type || 'N/A' },
                  { label: 'GST Available', value: lead.gst_available ? '✓ Yes' : '✗ No' },
                  { label: 'ITR Available', value: lead.itr_available ? '✓ Yes' : '✗ No' },
                  { label: 'Banking Available', value: lead.banking_available ? '✓ Yes' : '✗ No' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                <TrendingUp size={14} /> Financial Information
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Required Loan', value: formatLakh(Number(lead.required_loan_amount || 0)) },
                  { label: 'Monthly Turnover', value: formatLakh(Number(lead.monthly_turnover || 0)) },
                  { label: 'Annual Turnover', value: formatLakh(Number(lead.annual_turnover || 0)) },
                  { label: 'Existing EMI', value: lead.existing_emi ? formatLakh(Number(lead.existing_emi)) : '₹0' },
                  { label: 'Existing Loans', value: lead.existing_loans ? 'Yes' : 'No' },
                  { label: 'CIBIL Range', value: lead.cibil_range || 'N/A' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-semibold text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                <CheckCircle size={14} /> Status & Assignment
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Current Status</span><Badge label={lead.status} /></div>
                <div className="flex justify-between text-sm border-t border-gray-50 pt-2"><span className="text-gray-500">Assigned To</span><span className="font-medium text-gray-900">{assignedTo.name || 'Unassigned'}</span></div>
                {assignedTo.territory && (
                  <div className="flex justify-between text-sm border-t border-gray-50 pt-2"><span className="text-gray-500">Territory</span><span className="font-medium text-gray-900">{assignedTo.territory}</span></div>
                )}
                <div className="flex justify-between text-sm border-t border-gray-50 pt-2"><span className="text-gray-500">Created</span><span className="font-medium text-gray-900">{new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Calls' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {leadCalls.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No calls recorded for this lead.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Date & Time', 'Telecaller', 'Duration', 'Outcome', 'Remarks'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadCalls.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{new Date(c.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3.5 text-gray-700">{c.telecaller_name || 'Unknown'}</td>
                      <td className="px-4 py-3.5 text-gray-600">{Math.floor((c.duration || 0) / 60)}m {(c.duration || 0) % 60}s</td>
                      <td className="px-4 py-3.5"><Badge label={c.outcome} /></td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[200px] truncate">{c.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Follow-ups' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {leadFollowUps.length > 0 ? (
              <div className="space-y-4">
                {leadFollowUps.map(f => (
                  <div key={f.id} className={`p-4 rounded-xl border ${f.completed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-gray-800">{f.completed ? '✓ Completed' : '⏳ Pending'}</div>
                      <div className="text-xs text-gray-500">{f.assigned_to_name}</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">{new Date(f.due_at).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                    {f.remarks && <div className="text-sm text-gray-700 mt-1">{f.remarks}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">No follow-ups scheduled.</div>
            )}
          </div>
        )}

        {activeTab === 'Timeline' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-6 relative">
              <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-100" />
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                    <event.icon size={14} className="text-white" />
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-semibold text-gray-900">{event.event}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{event.desc}</div>
                    <div className="text-xs text-gray-400 mt-1">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
