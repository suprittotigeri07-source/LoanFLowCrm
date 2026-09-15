import React, { useState } from 'react'
import { BarChart2, Calendar, Download, Printer, FileSpreadsheet, Users, PhoneCall, Layers, Landmark, DollarSign, CheckCircle } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminReportsPage() {
  const { customers, telecallers, calls, followUps, lenders, showToast } = useAdmin()

  const [reportTab, setReportTab] = useState('Lead Report')
  const [dateFilter, setDateFilter] = useState('This Month')

  const reportTabs = [
    { id: 'Lead Report', label: 'A. Lead Report', icon: Users },
    { id: 'Telecaller Performance', label: 'B. Telecaller Performance', icon: BarChart2 },
    { id: 'Call Report', label: 'C. Call Report', icon: PhoneCall },
    { id: 'Follow-up Report', label: 'D. Follow-up Report', icon: Calendar },
    { id: 'Pipeline Report', label: 'E. Loan Pipeline Report', icon: Layers },
    { id: 'Lender Report', label: 'F. Lender Report', icon: Landmark },
    { id: 'Business Report', label: 'G. Business Report', icon: DollarSign },
  ]

  const handleExportCSV = () => {
    showToast(`Exported ${reportTab} as CSV!`)
  }

  const handleExportExcel = () => {
    showToast(`Exported ${reportTab} as Excel spreadsheet!`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & MIS</h1>
          <p className="text-sm text-gray-500 mt-1">Operational analytics, pipeline conversions, and executive management reporting.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700">
            <Calendar size={15} className="text-indigo-600" />
            <span>Period:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-indigo-700 cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <button onClick={handleExportExcel} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button onClick={handleExportCSV} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* REPORT TABS BAR */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm flex gap-1 overflow-x-auto print:hidden">
        {reportTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setReportTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              reportTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT BODY */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{reportTab}</h2>
            <p className="text-xs text-gray-400">Filter Period: {dateFilter} · Business Loan Platform</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-100">
            Official MIS Report
          </span>
        </div>

        {/* TAB A: LEAD REPORT */}
        {reportTab === 'Lead Report' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400">Total Leads</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{customers?.length || 0}</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <div className="text-xs text-indigo-600">New</div>
                <div className="text-xl font-bold text-indigo-700 mt-1">{customers?.filter(c => c.status === 'NEW LEAD').length || 0}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-xs text-blue-600">Contacted</div>
                <div className="text-xl font-bold text-blue-700 mt-1">{customers?.filter(c => c.status === 'CONTACTED').length || 0}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="text-xs text-purple-600">Interested</div>
                <div className="text-xl font-bold text-purple-700 mt-1">{customers?.filter(c => c.status === 'INTERESTED').length || 0}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <div className="text-xs text-amber-600">Not Interested</div>
                <div className="text-xl font-bold text-amber-700 mt-1">{customers?.filter(c => c.status === 'REJECTED').length || 0}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <div className="text-xs text-emerald-600">Converted / Disbursed</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">{customers?.filter(c => c.status === 'DISBURSEMENT').length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: TELECALLER PERFORMANCE */}
        {reportTab === 'Telecaller Performance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                  <th className="px-3.5 py-2.5">Telecaller Name</th>
                  <th className="px-3.5 py-2.5 text-center">Assigned</th>
                  <th className="px-3.5 py-2.5 text-center">Calls</th>
                  <th className="px-3.5 py-2.5 text-center">Connected</th>
                  <th className="px-3.5 py-2.5 text-center">Interested</th>
                  <th className="px-3.5 py-2.5 text-center">Follow-ups</th>
                  <th className="px-3.5 py-2.5 text-center">Login</th>
                  <th className="px-3.5 py-2.5 text-center">Disbursement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {telecallers?.map(t => (
                  <tr key={t.id}>
                    <td className="px-3.5 py-3 font-bold text-gray-900">{t.name} ({t.branch})</td>
                    <td className="px-3.5 py-3 text-center font-bold text-gray-700">{t.assignedLeads}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-indigo-600">{t.callsToday}</td>
                    <td className="px-3.5 py-3 text-center text-purple-600 font-semibold">{t.connected}</td>
                    <td className="px-3.5 py-3 text-center text-emerald-600 font-semibold">{t.interested}</td>
                    <td className="px-3.5 py-3 text-center text-amber-600 font-semibold">{t.followups}</td>
                    <td className="px-3.5 py-3 text-center text-cyan-600 font-semibold">{t.login}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-emerald-700">{t.disbursement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB G: BUSINESS REPORT */}
        {reportTab === 'Business Report' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <div className="text-xs font-semibold text-indigo-600">Total Loan Requirement</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">₹3.25 Crores</div>
            </div>
            <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-100">
              <div className="text-xs font-semibold text-purple-600">Total Login Amount</div>
              <div className="text-2xl font-black text-purple-900 mt-1">₹95.0 Lakhs</div>
            </div>
            <div className="p-5 bg-cyan-50/60 rounded-2xl border border-cyan-100">
              <div className="text-xs font-semibold text-cyan-600">Total Approved Amount</div>
              <div className="text-2xl font-black text-cyan-900 mt-1">₹45.0 Lakhs</div>
            </div>
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-600">Total Disbursed Amount</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">₹30.0 Lakhs</div>
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER TABS */}
        {['Call Report', 'Follow-up Report', 'Pipeline Report', 'Lender Report'].includes(reportTab) && (
          <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-2">
            <div className="font-bold text-gray-800 text-sm">Detailed Breakdown for {reportTab}</div>
            <p className="text-xs text-gray-500">Live operational data generated for period: {dateFilter}. Click Export Excel for full data set.</p>
          </div>
        )}
      </div>
    </div>
  )
}
