import React, { useState, useEffect } from 'react'
import { Phone, Bell, AlertCircle, Target, MapPin, TrendingUp, CheckCircle, ChevronRight, Loader2 } from 'lucide-react'
import StatCard from '../../components/dashboard/StatCard'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import Badge from '../../components/common/Badge'
import { api } from '../../api'

const CALL_OUTCOMES = [
  'Interested',
  'Not Interested',
  'Call Later',
  'Number Busy',
  'No Response',
  'Wrong Number',
  'Already Taken Loan',
  'Loan Required – Documents Pending',
  'Eligible – Send Documents',
  'Not Eligible',
]

const formatLakh = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`
const formatCrore = (v) => v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : formatLakh(v)

const FOLLOWUP_OPTIONS = ['Today', 'Tomorrow', 'Custom Date']

export default function TelecallerDashboard() {
  const [currentLead, setCurrentLead] = useState(null)
  const [remainingCount, setRemainingCount] = useState(0)
  const [metrics, setMetrics] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [callMade, setCallMade] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [followupOption, setFollowupOption] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [queueData, metricsData, fuData] = await Promise.all([
        api.getTelecallerQueue(true),
        api.getTelecallerMetrics(),
        api.getTodayFollowUps().catch(() => ({ follow_ups: [] })),
      ])
      setCurrentLead(queueData.lead || null)
      setRemainingCount(queueData.remaining_count || 0)
      setMetrics(metricsData)
      setFollowUps(fuData.follow_ups || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCallNow = () => {
    setCallMade(true)
  }

  const handleSaveOutcome = async () => {
    if (!selectedOutcome || !currentLead) return
    setSaving(true)
    try {
      // Calculate follow-up date
      let followUpDueAt = null
      if (followupOption === 'Today') {
        const d = new Date()
        d.setHours(d.getHours() + 2)
        followUpDueAt = d.toISOString()
      } else if (followupOption === 'Tomorrow') {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(10, 0, 0, 0)
        followUpDueAt = d.toISOString()
      } else if (followupOption === 'Custom Date' && customDate) {
        followUpDueAt = new Date(customDate).toISOString()
      }

      await api.submitDisposition({
        lead_id: currentLead.id,
        outcome: selectedOutcome,
        duration: 0,
        remarks: remarks,
        follow_up_due_at: followUpDueAt,
        follow_up_remarks: remarks,
      })

      setModalOpen(false)
      setCallMade(false)
      setSelectedOutcome('')
      setFollowupOption('')
      setRemarks('')
      setCustomDate('')
      setToast({ message: 'Call outcome saved successfully', type: 'success' })

      // Refresh queue for next lead
      setTimeout(() => fetchData(), 400)
    } catch (err) {
      setToast({ message: err.message || 'Failed to save outcome', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    // Fetch next lead in queue
    setLoading(true)
    setCallMade(false)
    await fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500">Loading your queue...</span>
      </div>
    )
  }

  const m = metrics?.metrics || {}

  if (!currentLead) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-xl font-bold text-gray-900">Telecaller Dashboard</h1></div>
        {/* Stats still visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Assigned" value={m.total_assigned || 0} sub="All leads" icon={Target} color="indigo" />
          <StatCard label="Calls Today" value={m.calls_today || 0} sub={`${m.connected_today || 0} connected`} icon={Phone} color="blue" />
          <StatCard label="Follow-ups" value={m.followups_due_today || 0} sub="Due today" icon={Bell} color="emerald" />
          <StatCard label="Overdue" value={m.followups_overdue || 0} sub="Needs attention" icon={AlertCircle} color="red" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h2>
          <p className="text-gray-500 text-sm">No more leads in your queue for now.</p>
        </div>
      </div>
    )
  }

  // Extract lead data (API returns nested customer object)
  const customer = currentLead.customer || {}
  const assignedTo = currentLead.assigned_to || {}

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Telecaller Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Queue Remaining" value={m.queue_remaining || remainingCount} sub="In your queue" icon={Target} color="indigo" />
        <StatCard label="Calls Today" value={m.calls_today || 0} sub={`${m.connected_today || 0} connected`} icon={Phone} color="blue" />
        <StatCard label="Follow-ups" value={m.followups_due_today || 0} sub="Due today" icon={Bell} color="emerald" />
        <StatCard label="Overdue" value={m.followups_overdue || 0} sub="Needs attention" icon={AlertCircle} color="red" />
      </div>

      {/* Queue progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Queue Progress</span>
          <span className="text-xs text-gray-500">{m.total_assigned ? `${m.total_assigned - (m.queue_remaining || 0)} of ${m.total_assigned} leads` : 'Loading...'}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: m.total_assigned ? `${((m.total_assigned - (m.queue_remaining || 0)) / m.total_assigned) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Next Lead card */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Lead info */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Lead header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-indigo-200 text-xs font-medium mb-1">Lead #{String(currentLead.id).slice(0, 8)}</div>
                <h2 className="text-xl font-bold text-white">{customer.name || 'Unknown'}</h2>
                <p className="text-indigo-200 text-sm mt-0.5">{currentLead.business_name} · {currentLead.business_type || 'N/A'}</p>
                <div className="flex items-center gap-1.5 text-indigo-200 text-sm mt-1">
                  <MapPin size={13} />
                  {customer.city || 'N/A'}
                </div>
              </div>
              <Badge label={currentLead.status} className="mt-1" />
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Phone size={18} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Mobile Number</div>
                <div className="font-semibold text-gray-900 text-sm">{customer.mobile || '+91 XXXXX XXXXX'}</div>
              </div>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Monthly Turnover', value: formatLakh(Number(currentLead.monthly_turnover || 0)) },
                { label: 'Annual Turnover', value: formatCrore(Number(currentLead.annual_turnover || 0)) },
                { label: 'Required Loan', value: formatLakh(Number(currentLead.required_loan_amount || 0)) },
                { label: 'Business Vintage', value: currentLead.vintage ? `${currentLead.vintage} yrs` : 'N/A' },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">{f.label}</div>
                  <div className="font-bold text-gray-900 text-sm">{f.value}</div>
                </div>
              ))}
            </div>

            {/* Docs available */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'GST Available', ok: currentLead.gst_available },
                { label: 'ITR Available', ok: currentLead.itr_available },
                { label: 'Banking Available', ok: currentLead.banking_available },
              ].map(d => (
                <div key={d.label} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${d.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {d.ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {d.label}
                </div>
              ))}
              {currentLead.cibil_range && (
                <div className="text-xs text-gray-500">CIBIL: <span className="font-semibold text-gray-800">{currentLead.cibil_range}</span></div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!callMade ? (
                <a
                  href={`tel:${customer.mobile || '+910000000000'}`}
                  onClick={handleCallNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                >
                  <Phone size={20} />
                  📞 Call Now
                </a>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
                >
                  <CheckCircle size={20} />
                  Log Call Outcome
                </button>
              )}
              <button
                onClick={handleSkip}
                className="px-4 py-3.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Skip <ChevronRight size={16} className="inline" />
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming follow-ups sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Today's Follow-ups</h3>
          <div className="space-y-3">
            {followUps.length > 0 ? followUps.slice(0, 4).map(f => (
              <div key={f.id} className={`p-3 rounded-xl border ${f.is_overdue ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="text-sm font-semibold text-gray-900">{f.customer_name}</div>
                <div className="text-xs text-gray-500 mb-1.5">{f.lead_business_name}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${f.is_overdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {f.is_overdue ? '⚠ Overdue' : `Today • ${new Date(f.due_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 text-sm py-4">No follow-ups today</div>
            )}
          </div>
          <a href="/telecaller/follow-ups" className="mt-4 block text-center text-xs text-indigo-600 font-medium hover:text-indigo-700">
            View all follow-ups →
          </a>
        </div>
      </div>

      {/* Call Disposition Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="How did the call go?" size="md">
        <div className="space-y-5">
          {/* Lead reminder */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-700">{(customer.name || 'U')[0]}</div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{customer.name || 'Unknown'}</div>
              <div className="text-xs text-gray-500">{currentLead.business_name}</div>
            </div>
            <Badge label={currentLead.status} className="ml-auto" />
          </div>

          {/* Outcomes */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2.5">Call Outcome *</label>
            <div className="grid grid-cols-2 gap-2">
              {CALL_OUTCOMES.map(o => (
                <button
                  key={o}
                  onClick={() => setSelectedOutcome(o)}
                  className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-all ${
                    selectedOutcome === o
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2.5">Schedule Follow-up</label>
            <div className="flex gap-2 mb-2">
              {FOLLOWUP_OPTIONS.map(o => (
                <button
                  key={o}
                  onClick={() => setFollowupOption(o)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                    followupOption === o ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            {followupOption === 'Custom Date' && (
              <input
                type="datetime-local"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add call remarks..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSaveOutcome}
              disabled={!selectedOutcome || saving}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
              ) : 'Save & Next Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
