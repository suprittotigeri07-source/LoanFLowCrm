import React, { useState } from 'react'
import { Landmark, Plus, ShieldAlert, CheckCircle, Search, Edit, Eye, X, Phone, Mail, MapPin } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminLendersPage() {
  const { lenders, addLender, toggleLenderStatus, showToast } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedLender, setSelectedLender] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank',
    locations: 'Pan India',
    products: ['Business Loan', 'Working Capital'],
    minLoan: 500000,
    maxLoan: 5000000,
    vintageReq: '3 Years',
    gstReq: 'Mandatory',
    itrReq: '2 Years',
    bankingReq: '12 Months',
    cibilReq: '750+',
    status: 'Active',
    contactPerson: '',
    phone: '',
    email: '',
  })

  const filteredLenders = (lenders || []).filter(l => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q) || l.locations.toLowerCase().includes(q)
    const matchesType = !typeFilter || l.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.contactPerson) {
      showToast('Please fill lender name and contact person', 'error')
      return
    }
    addLender(formData)
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lender Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure bank, NBFC, and financial institution funding partners.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Plus size={16} /> Add Lender Partner
        </button>
      </div>

      {/* IMPORTANT DISCLAIMER NOTICE */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-sm">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Important System Policy & Disclaimer:</span>
          Eligibility rules are internal configurable rules to assist telecallers in filtering leads. The system does <strong>NOT</strong> claim or guarantee loan approval from any lending partner. Final sanction is subject to lender credit policy.
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lender name, type, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Partner Types</option>
          <option value="Bank">Bank</option>
          <option value="NBFC">NBFC</option>
          <option value="Financial Institution">Financial Institution</option>
        </select>
      </div>

      {/* LENDER LIST TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                <th className="px-4 py-3.5">Lender Name</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Locations Served</th>
                <th className="px-4 py-3.5">Min Loan</th>
                <th className="px-4 py-3.5">Max Loan</th>
                <th className="px-4 py-3.5">Min CIBIL</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLenders.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      <Landmark size={15} />
                    </div>
                    <div>
                      <div>{l.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{l.contactPerson}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-purple-700">{l.type}</td>
                  <td className="px-4 py-3.5 text-gray-600">{l.locations}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-800">₹{(l.minLoan / 100000).toFixed(1)}L</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">₹{(l.maxLoan / 100000).toFixed(1)}L</td>
                  <td className="px-4 py-3.5 font-semibold text-cyan-600">{l.cibilReq}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${l.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedLender(l)}
                      className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 text-[11px]"
                    >
                      View Criteria
                    </button>
                    <button
                      onClick={() => toggleLenderStatus(l.id)}
                      className={`px-2.5 py-1.5 font-bold rounded-lg text-[11px] ${l.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      {l.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LENDER CRITERIA & PROFILE MODAL */}
      {selectedLender && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">{selectedLender.name} ({selectedLender.type})</h2>
                  <p className="text-xs text-gray-400">Locations: {selectedLender.locations}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLender(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block">Contact Person</span>
                <span className="font-bold text-gray-900">{selectedLender.contactPerson}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block">Phone & Email</span>
                <span className="font-semibold text-indigo-600 block">{selectedLender.phone}</span>
                <span className="text-gray-500 text-[10px]">{selectedLender.email}</span>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-2">Internal Eligibility Criteria</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl">
                <span className="text-indigo-600 font-semibold block">Min Vintage Req</span>
                <span className="font-bold text-indigo-950">{selectedLender.vintageReq}</span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl">
                <span className="text-purple-600 font-semibold block">GST Requirement</span>
                <span className="font-bold text-purple-950">{selectedLender.gstReq}</span>
              </div>
              <div className="p-3 bg-cyan-50/60 rounded-xl">
                <span className="text-cyan-600 font-semibold block">ITR Filing Req</span>
                <span className="font-bold text-cyan-950">{selectedLender.itrReq}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl">
                <span className="text-emerald-600 font-semibold block">CIBIL Score Min</span>
                <span className="font-bold text-emerald-950">{selectedLender.cibilReq}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLender(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LENDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-base">Add Lender Partner</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Lender Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Axis Bank"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold text-indigo-900"
                  >
                    <option value="Bank">Bank</option>
                    <option value="NBFC">NBFC</option>
                    <option value="Financial Institution">Financial Institution</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
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
                  Save Lender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
