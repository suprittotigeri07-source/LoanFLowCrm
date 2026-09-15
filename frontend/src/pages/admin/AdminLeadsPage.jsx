import React, { useState } from 'react'
import { Search, Plus, Upload, Download, UserCheck, Eye, Filter, X, ChevronDown, CheckSquare, Square } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import UnifiedCustomerModal from '../../components/common/UnifiedCustomerModal'
import { useNavigate } from 'react-router-dom'

export default function AdminLeadsPage() {
  const { customers, telecallers, addCustomerLead, assignLeadsBulk, showToast } = useAdmin()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [telecallerFilter, setTelecallerFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignee, setAssignee] = useState('')

  // Add Lead Form State
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    mobile: '',
    altMobile: '',
    businessName: '',
    businessType: 'Retail',
    vintage: '3 Years',
    constitution: 'Proprietorship',
    city: 'Hubli',
    pincode: '580020',
    gstAvailable: 'Yes',
    itrAvailable: 'Yes',
    bankingAvailable: 'Yes',
    monthlyTurnover: '₹10 Lakhs',
    annualTurnover: '₹1.2 Crores',
    existingLoans: '₹0',
    existingEmi: '₹0',
    cibilRange: '750 - 780',
    loanAmount: 1500000,
    loanRequirement: 'Business Loan',
    leadSource: 'Google Ads',
    campaign: 'Direct-Web',
    assignedTelecaller: '',
    status: 'NEW LEAD',
  })

  // Filtering
  const filteredCustomers = (customers || []).filter(c => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.businessName.toLowerCase().includes(q)

    const matchesStatus = !statusFilter || c.status === statusFilter
    const matchesTelecaller = !telecallerFilter || c.assignedTelecaller === telecallerFilter
    const matchesLocation = !locationFilter || c.city.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesSource = !sourceFilter || c.leadSource === sourceFilter

    return matchesSearch && matchesStatus && matchesTelecaller && matchesLocation && matchesSource
  })

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredCustomers.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredCustomers.map(c => c.id))
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedLeads(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const handleAddLeadSubmit = (e) => {
    e.preventDefault()
    if (!newLeadData.name || !newLeadData.mobile || !newLeadData.businessName) {
      showToast('Please fill required fields (Name, Mobile, Business Name)', 'error')
      return
    }

    const success = addCustomerLead(newLeadData)
    if (success) {
      setIsAddModalOpen(false)
      setNewLeadData({
        name: '',
        mobile: '',
        altMobile: '',
        businessName: '',
        businessType: 'Retail',
        vintage: '3 Years',
        constitution: 'Proprietorship',
        city: 'Hubli',
        pincode: '580020',
        gstAvailable: 'Yes',
        itrAvailable: 'Yes',
        bankingAvailable: 'Yes',
        monthlyTurnover: '₹10 Lakhs',
        annualTurnover: '₹1.2 Crores',
        existingLoans: '₹0',
        existingEmi: '₹0',
        cibilRange: '750 - 780',
        loanAmount: 1500000,
        loanRequirement: 'Business Loan',
        leadSource: 'Google Ads',
        campaign: 'Direct-Web',
        assignedTelecaller: '',
        status: 'NEW LEAD',
      })
    }
  }

  const handleAssignLeads = () => {
    if (!assignee) {
      showToast('Select a telecaller to assign', 'error')
      return
    }
    assignLeadsBulk(selectedLeads, assignee)
    setSelectedLeads([])
    setIsAssignModalOpen(false)
  }

  const exportToCSV = () => {
    const headers = ['Lead ID,Customer Name,Mobile,Location,Business,Loan Amount,Lead Source,Assigned Telecaller,Status,Created Date\n']
    const rows = filteredCustomers.map(
      c => `"${c.id}","${c.name}","${c.mobile}","${c.city}","${c.businessName}","₹${c.loanAmount}","${c.leadSource}","${c.assignedTelecaller || 'Unassigned'}","${c.status}","${c.createdDate}"\n`
    )
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LoanFlow_Leads_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast('Leads exported successfully!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Managing <span className="font-bold text-indigo-600">{filteredCustomers.length}</span> leads in pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus size={16} /> Add Lead
          </button>
          <button
            onClick={() => navigate('/admin/leads/upload')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Upload size={16} /> Import Leads
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            <Download size={16} /> Export
          </button>
          <button
            disabled={selectedLeads.length === 0}
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all"
          >
            <UserCheck size={16} /> Assign Leads ({selectedLeads.length})
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, lead ID, business name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Lead Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="">All Lead Statuses</option>
            {[
              'NEW LEAD', 'CONTACTED', 'INTERESTED', 'NOT INTERESTED', 'CALL LATER',
              'DOCUMENTS PENDING', 'DOCUMENTS RECEIVED', 'ELIGIBILITY', 'LOGIN',
              'CREDIT / PD', 'APPROVAL', 'DISBURSEMENT', 'REJECTED', 'CLOSED'
            ].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Telecaller Filter */}
        <div className="relative">
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
        </div>

        {/* Location Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter Location..."
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="w-36 bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none"
          />
        </div>

        {/* Lead Source Filter */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="">All Sources</option>
            {['Google Ads', 'IndiaMART', 'Facebook Ads', 'Referral', 'Website', 'CSV Upload', 'WhatsApp', 'Cold Call'].map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LEAD TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold whitespace-nowrap">
                <th className="px-4 py-3.5 text-center">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600">
                    {selectedLeads.length > 0 && selectedLeads.length === filteredCustomers.length ? (
                      <CheckSquare size={16} className="text-indigo-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Lead ID</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Mobile</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Business</th>
                <th className="px-4 py-3.5">Loan Amount</th>
                <th className="px-4 py-3.5">Lead Source</th>
                <th className="px-4 py-3.5">Assigned Telecaller</th>
                <th className="px-4 py-3.5">Lead Status</th>
                <th className="px-4 py-3.5">Next Follow-up</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 whitespace-nowrap">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-gray-400 text-xs">
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => toggleSelectOne(c.id)} className="text-gray-400 hover:text-indigo-600">
                        {selectedLeads.includes(c.id) ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">{c.id}</td>
                    <td
                      onClick={() => setSelectedCustomer(c)}
                      className="px-4 py-3.5 font-bold text-gray-900 cursor-pointer hover:text-indigo-600"
                    >
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-700">{c.mobile}</td>
                    <td className="px-4 py-3.5 text-gray-600">{c.city || c.location}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 max-w-[150px] truncate">{c.businessName}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      ₹{(c.loanAmount / 100000).toFixed(1)} Lakhs
                    </td>
                    <td className="px-4 py-3.5 text-purple-600 font-semibold">{c.leadSource}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">
                      {c.assignedTelecaller ? (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{c.assignedTelecaller}</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-[11px]">{c.nextFollowup || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px]">{c.createdDate}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition-colors"
                      >
                        <Eye size={13} /> View 360°
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Add New Business Loan Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadData.name}
                    onChange={e => setNewLeadData({ ...newLeadData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile"
                    value={newLeadData.mobile}
                    onChange={e => setNewLeadData({ ...newLeadData, mobile: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadData.businessName}
                    onChange={e => setNewLeadData({ ...newLeadData, businessName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Business Type</label>
                  <input
                    type="text"
                    value={newLeadData.businessType}
                    onChange={e => setNewLeadData({ ...newLeadData, businessType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Location / City</label>
                  <input
                    type="text"
                    value={newLeadData.city}
                    onChange={e => setNewLeadData({ ...newLeadData, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Required Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={newLeadData.loanAmount}
                    onChange={e => setNewLeadData({ ...newLeadData, loanAmount: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Lead Source</label>
                  <select
                    value={newLeadData.leadSource}
                    onChange={e => setNewLeadData({ ...newLeadData, leadSource: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  >
                    {['Google Ads', 'IndiaMART', 'Facebook Ads', 'Referral', 'Website', 'CSV Upload', 'WhatsApp', 'Cold Call'].map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Assign Telecaller</label>
                  <select
                    value={newLeadData.assignedTelecaller}
                    onChange={e => setNewLeadData({ ...newLeadData, assignedTelecaller: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2"
                  >
                    <option value="">Leave Unassigned</option>
                    {telecallers.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ASSIGN MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="font-bold text-gray-900 text-base">Bulk Assign Selected Leads</h2>
            <p className="text-xs text-gray-500">
              Assigning <span className="font-bold text-indigo-600">{selectedLeads.length}</span> lead(s) to a telecaller.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Telecaller</label>
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium"
              >
                <option value="">-- Choose Telecaller --</option>
                {telecallers.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.branch})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignLeads}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Customer Modal */}
      {selectedCustomer && (
        <UnifiedCustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
