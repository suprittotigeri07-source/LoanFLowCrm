import React, { useState } from 'react'
import { FileText, CheckCircle, XCircle, Download, Eye, Upload, Filter, Search, X, ShieldCheck } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminDocumentsPage() {
  const { documents, customers, verifyDocument, showToast } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [verifyModal, setVerifyModal] = useState(null)
  const [verifyStatus, setVerifyStatus] = useState('Verified')
  const [verifyNote, setVerifyNote] = useState('')

  const docTypes = [
    'PAN Card', 'Aadhaar Card', 'GST Certificate', 'ITR (Last 2 Years)',
    'Bank Statement (12 Months)', 'Business Proof', 'Address Proof', 'Other'
  ]

  const totalDocs = documents?.length || 0
  const verifiedCount = documents?.filter(d => d.status === 'Verified').length || 0
  const pendingCount = documents?.filter(d => d.status === 'Pending' || d.status === 'Uploaded').length || 0
  const rejectedCount = documents?.filter(d => d.status === 'Rejected').length || 0

  const filteredDocs = (documents || []).filter(d => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || d.customerName.toLowerCase().includes(q) || d.leadId.toLowerCase().includes(q) || d.docType.toLowerCase().includes(q)
    const matchesType = !docTypeFilter || d.docType === docTypeFilter
    const matchesStatus = !statusFilter || d.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleConfirmVerify = (e) => {
    e.preventDefault()
    if (!verifyModal) return
    verifyDocument(verifyModal.id, verifyStatus, verifyNote)
    setVerifyModal(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review, verify, and request customer KYC and financial documents.</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Total Documents</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalDocs}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600">Verified</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{verifiedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-amber-600 shadow-sm">
          <div className="text-xs font-semibold text-amber-600">Pending Review</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 border-l-4 border-l-red-600 shadow-sm">
          <div className="text-xs font-semibold text-red-600">Rejected</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, document type, lead ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={docTypeFilter}
          onChange={e => setDocTypeFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Document Types</option>
          {docTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* DOCUMENTS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                <th className="px-4 py-3.5">Lead ID</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Document Type</th>
                <th className="px-4 py-3.5">Uploaded File</th>
                <th className="px-4 py-3.5">Uploaded By</th>
                <th className="px-4 py-3.5">Upload Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Verification Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDocs.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">{d.leadId}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-900">{d.customerName}</td>
                  <td className="px-4 py-3.5 font-semibold text-purple-700">{d.docType}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[150px] truncate font-mono text-[11px]">{d.fileName || 'Pending Upload'}</td>
                  <td className="px-4 py-3.5 text-gray-600">{d.uploadedBy}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-400 text-[11px]">{d.uploadDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      d.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : d.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{d.notes || '—'}</td>
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedDoc(d)}
                      className="px-2.5 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-[11px]"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => { setVerifyModal(d); setVerifyStatus('Verified'); setVerifyNote(d.notes || '') }}
                      className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 text-[11px]"
                    >
                      Verify / Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFY / REJECT MODAL */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Verify Document</h2>
                <p className="text-xs text-gray-400">{verifyModal.docType} for {verifyModal.customerName}</p>
              </div>
              <button onClick={() => setVerifyModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmVerify} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Set Verification Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyStatus('Verified')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${verifyStatus === 'Verified' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'border-gray-200 text-gray-700'}`}
                  >
                    ✓ Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyStatus('Rejected')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${verifyStatus === 'Rejected' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'border-gray-200 text-gray-700'}`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Verification Note / Reason</label>
                <textarea
                  rows={3}
                  placeholder="Notes (e.g. Details matched with NSDL / Blur file rejected)..."
                  value={verifyNote}
                  onChange={e => setVerifyNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVerifyModal(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-base">{selectedDoc.docType} Preview</h2>
                <p className="text-xs text-gray-400">{selectedDoc.customerName} ({selectedDoc.leadId})</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 bg-gray-100 rounded-xl border border-gray-200 text-center space-y-3">
              <FileText size={48} className="mx-auto text-indigo-600" />
              <div className="font-bold text-gray-900 text-sm">{selectedDoc.fileName || 'sample_doc_file.pdf'}</div>
              <p className="text-xs text-gray-500">Document File Size: 1.4 MB · PDF Format</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => showToast('File downloaded!')}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download File
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
