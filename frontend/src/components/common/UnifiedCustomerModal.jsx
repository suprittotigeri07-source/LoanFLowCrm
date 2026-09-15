import React, { useState } from 'react'
import { X, Phone, MessageSquare, Calendar, FileText, Landmark, Clock, User, ShieldCheck, Tag, MapPin, Building, CreditCard, Award, ChevronRight } from 'lucide-react'
import Badge from './Badge'
import { useAdmin } from '../../context/AdminContext'

export default function UnifiedCustomerModal({ customer, onClose }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const { calls, followUps, documents, auditLogs, updateLeadStage } = useAdmin()

  if (!customer) return null

  const customerCalls = (calls || []).filter(c => c.customer === customer.name || c.leadId === customer.id)
  const customerFollowups = (followUps || []).filter(f => f.customer === customer.name || f.leadId === customer.id)
  const customerDocs = (documents || []).filter(d => d.customerName === customer.name || d.leadId === customer.id)
  const customerAudits = (auditLogs || []).filter(a => a.customerName === customer.name || a.leadId === customer.id)

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: User },
    { id: 'Calls', label: `Calls (${customerCalls.length})`, icon: Phone },
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'Follow-ups', label: `Follow-ups (${customerFollowups.length})`, icon: Calendar },
    { id: 'Documents', label: `Documents (${customerDocs.length})`, icon: FileText },
    { id: 'Loan Application', label: 'Loan Application', icon: CreditCard },
    { id: 'Lender', label: 'Lender Match', icon: Landmark },
    { id: 'Activity History', label: 'Activity History', icon: Clock },
  ]

  const formatCurrency = (val) => {
    if (!val) return '₹0'
    if (typeof val === 'number') return `₹${(val / 100000).toFixed(1)} Lakhs`
    return val
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white text-xl font-bold flex items-center justify-center">
              {customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <span className="text-xs bg-indigo-500/40 text-indigo-100 px-2 py-0.5 rounded-md font-mono">{customer.id}</span>
                <span className="text-xs bg-emerald-500/80 text-white font-semibold px-2 py-0.5 rounded-full">{customer.status}</span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 flex items-center gap-4">
                <span>📱 {customer.mobile}</span>
                <span>🏢 {customer.businessName} ({customer.businessType})</span>
                <span>📍 {customer.city || customer.location}</span>
                <span>👤 Assigned: {customer.assignedTelecaller || 'Unassigned'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Unified Tabs Bar */}
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-medium">Required Loan</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">{formatCurrency(customer.loanAmount)}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-medium">CIBIL Score Range</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{customer.cibilRange || '720-750'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-medium">Monthly Turnover</div>
                  <div className="text-lg font-bold text-gray-800 mt-1">{customer.monthlyTurnover || '—'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-medium">Lead Source</div>
                  <div className="text-sm font-semibold text-purple-600 mt-1">{customer.leadSource || 'Direct'}</div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Business Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Building size={16} className="text-indigo-600" /> Business Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Business Name</span>
                      <span className="font-semibold text-gray-800">{customer.businessName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Constitution</span>
                      <span className="font-semibold text-gray-800">{customer.constitution || 'Proprietorship'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Business Vintage</span>
                      <span className="font-semibold text-gray-800">{customer.vintage || '3+ Years'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Annual Turnover</span>
                      <span className="font-semibold text-gray-800">{customer.annualTurnover || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Existing EMI</span>
                      <span className="font-semibold text-gray-800">{customer.existingEmi || '₹0'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Existing Loans</span>
                      <span className="font-semibold text-gray-800">{customer.existingLoans || '₹0'}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance & Verification */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" /> Compliance Check
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-600">GST Registration</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${customer.gstAvailable === 'Yes' || customer.gstAvailable === true ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {customer.gstAvailable === 'Yes' || customer.gstAvailable === true ? 'AVAILABLE' : 'NOT AVAILABLE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-600">ITR Documents</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${customer.itrAvailable === 'Yes' || customer.itrAvailable === true ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {customer.itrAvailable === 'Yes' || customer.itrAvailable === true ? 'AVAILABLE (2 Yrs)' : 'NOT FILED'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-600">Banking Records</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${customer.bankingAvailable === 'Yes' || customer.bankingAvailable === true ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {customer.bankingAvailable === 'Yes' || customer.bankingAvailable === true ? '12 MONTHS READY' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mt-3">
                    <div className="text-[11px] font-semibold text-indigo-900">Latest Remarks</div>
                    <p className="text-xs text-indigo-700 mt-1">{customer.lastActivity || 'No recent remarks logged.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALLS TAB */}
          {activeTab === 'Calls' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Call Logs for {customer.name}</h3>
              {customerCalls.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No call logs recorded yet for this customer.</p>
              ) : (
                <div className="space-y-3">
                  {customerCalls.map(c => (
                    <div key={c.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between text-xs">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <span>📞 {c.telecaller}</span>
                          <span className="text-gray-400 font-normal">({c.type})</span>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">{c.outcome}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{c.remarks || 'No detailed call note.'}</p>
                        <div className="text-[10px] text-gray-400 mt-1.5">{c.dateTime} · Duration: {c.duration}</div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded-md">{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WHATSAPP TAB */}
          {activeTab === 'WhatsApp' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-500" /> WhatsApp Communication Thread
                </h3>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">WhatsApp API Connected</span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl space-y-3 max-h-72 overflow-y-auto">
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-md text-xs border border-emerald-100">
                  <div className="font-semibold text-emerald-800 mb-1">System Template Sent</div>
                  <p className="text-gray-700">"Hello {customer.name}, thank you for your interest in LoanFlow Business Loans. Our executive {customer.assignedTelecaller} will call you shortly."</p>
                  <div className="text-[10px] text-gray-400 text-right mt-1">Delivered · 10:14 AM</div>
                </div>
                <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm max-w-md ml-auto text-xs">
                  <p>Requested documents checklist sent: PAN, Aadhaar, GST 3B, 12M Bank Statement.</p>
                  <div className="text-[10px] text-emerald-200 text-right mt-1">Read · 10:18 AM</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Type WhatsApp message..." className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2" />
                <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700">Send WA</button>
              </div>
            </div>
          )}

          {/* FOLLOW-UPS TAB */}
          {activeTab === 'Follow-ups' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Scheduled Follow-ups</h3>
              {customerFollowups.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No follow-ups scheduled for this customer.</p>
              ) : (
                <div className="space-y-3">
                  {customerFollowups.map(f => (
                    <div key={f.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-gray-900">{f.reason}</div>
                        <div className="text-[11px] text-gray-500 mt-1">Date: {f.date} {f.time} · Assigned to: {f.telecaller}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${f.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'Documents' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Customer Documents</h3>
              {customerDocs.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No documents uploaded yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {customerDocs.map(d => (
                    <div key={d.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{d.docType}</div>
                        <div className="text-gray-500 text-[11px] truncate max-w-[160px]">{d.fileName || 'Pending upload'}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{d.notes}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${d.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOAN APPLICATION TAB */}
          {activeTab === 'Loan Application' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Loan Application Details</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block">Requested Amount</span>
                  <span className="text-base font-bold text-indigo-600">{formatCurrency(customer.loanAmount)}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block">Purpose</span>
                  <span className="text-sm font-semibold text-gray-800">{customer.loanRequirement || 'Business Growth'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block">Application Stage</span>
                  <span className="text-sm font-semibold text-purple-600">{customer.status}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block">Lead Source</span>
                  <span className="text-sm font-semibold text-gray-800">{customer.leadSource}</span>
                </div>
              </div>
            </div>
          )}

          {/* LENDER MATCH TAB */}
          {activeTab === 'Lender' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Recommended Lender Partners</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-indigo-900 text-sm">HDFC Bank — Unsecured Business Loan</div>
                    <div className="text-indigo-700 text-[11px]">Match Score: 94% · Eligible up to ₹25.0 Lakhs</div>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold text-[11px]">Initiate Login</button>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">Bajaj Finance — Flexi Loan</div>
                    <div className="text-gray-500 text-[11px]">Match Score: 88% · Fast 48hr Disbursal</div>
                  </div>
                  <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-[11px]">Select Lender</button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY HISTORY (AUDIT LOG) */}
          {activeTab === 'Activity History' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Audit Trail & Action Log</h3>
              {customerAudits.length === 0 ? (
                <div className="text-xs text-gray-400 py-6 text-center">Standard customer registration recorded.</div>
              ) : (
                <div className="space-y-3">
                  {customerAudits.map(a => (
                    <div key={a.id} className="flex items-start gap-3 text-xs py-2 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">{a.action} by <span className="text-indigo-600">{a.user}</span></div>
                        <div className="text-gray-500 mt-0.5">Changed from <span className="line-through text-gray-400">{a.oldValue}</span> to <span className="font-medium text-gray-800">{a.newValue}</span></div>
                        <div className="text-[10px] text-gray-400 mt-1">{a.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
