import React, { useState } from 'react'
import { Layers, ChevronRight, UserCheck, FileText, Phone, Landmark, Clock, X, ArrowRight } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import UnifiedCustomerModal from '../../components/common/UnifiedCustomerModal'

export default function AdminPipelinePage() {
  const { customers, updateLeadStage, telecallers, assignLeadsBulk, showToast } = useAdmin()

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [moveStageModal, setMoveStageModal] = useState(null) // customer object to move stage
  const [targetStage, setTargetStage] = useState('')
  const [stageRemark, setStageRemark] = useState('')

  const stages = [
    'NEW LEAD',
    'CONTACTED',
    'INTERESTED',
    'ELIGIBILITY',
    'DOCUMENTS PENDING',
    'DOCUMENTS RECEIVED',
    'LOGIN',
    'CREDIT / PD',
    'APPROVAL',
    'DISBURSEMENT',
    'REJECTED',
  ]

  const handleOpenMoveModal = (cust, defaultNextStage) => {
    setMoveStageModal(cust)
    setTargetStage(defaultNextStage)
    setStageRemark('')
  }

  const handleConfirmStageMove = (e) => {
    e.preventDefault()
    if (!moveStageModal || !targetStage) return

    updateLeadStage(moveStageModal.id, targetStage, stageRemark || `Moved stage to ${targetStage}`)
    setMoveStageModal(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Interactive Kanban view of business loan applications across 11 stages.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700">
          <Layers size={16} /> Total Pipeline Leads: {customers?.length || 0}
        </div>
      </div>

      {/* KANBAN BOARD WRAPPER */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[680px]">
        {stages.map(st => {
          const stageLeads = (customers || []).filter(c => c.status === st)
          const totalAmount = stageLeads.reduce((acc, c) => acc + (c.loanAmount || 0), 0)

          return (
            <div key={st} className="w-72 bg-gray-50/90 rounded-2xl border border-gray-200/70 shrink-0 flex flex-col shadow-sm">
              {/* Stage Column Header */}
              <div className="p-3.5 border-b border-gray-200/70 bg-white rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-xs font-black text-gray-900 tracking-wide uppercase">{st}</h3>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    ₹{(totalAmount / 100000).toFixed(1)}L Total
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="text-[11px] text-gray-400 italic text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map(c => (
                    <div
                      key={c.id}
                      className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div
                            onClick={() => setSelectedCustomer(c)}
                            className="font-bold text-gray-900 text-sm hover:text-indigo-600 cursor-pointer"
                          >
                            {c.name}
                          </div>
                          <div className="text-[11px] text-gray-500">{c.businessName}</div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {c.id}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                        <span className="text-xs font-black text-emerald-700">
                          ₹{(c.loanAmount / 100000).toFixed(1)}L
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{c.city || c.location}</span>
                      </div>

                      <div className="text-[11px] text-gray-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Telecaller:</span>
                          <span className="font-semibold text-gray-800">{c.assignedTelecaller || 'Unassigned'}</span>
                        </div>
                        {c.nextFollowup && (
                          <div className="flex justify-between text-amber-700">
                            <span>Next Follow-up:</span>
                            <span className="font-mono text-[10px] font-bold">{c.nextFollowup}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Pipeline Action Buttons */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-semibold"
                        >
                          View 360°
                        </button>
                        <button
                          onClick={() => {
                            const currentIdx = stages.indexOf(st)
                            const nextStage = stages[currentIdx + 1] || 'DISBURSEMENT'
                            handleOpenMoveModal(c, nextStage)
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-sm"
                        >
                          Move Stage <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MOVE STAGE MODAL (WITH MANDATORY AUDIT REMARK) */}
      {moveStageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Move Stage: {moveStageModal.name}</h2>
                <p className="text-xs text-gray-400">Current Stage: <span className="font-bold text-indigo-600">{moveStageModal.status}</span></p>
              </div>
              <button onClick={() => setMoveStageModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmStageMove} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Target Pipeline Stage *</label>
                <select
                  required
                  value={targetStage}
                  onChange={e => setTargetStage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-indigo-900"
                >
                  {stages.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Activity Remark / Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record why the stage is being changed (e.g. Credit PD complete, Sanction issued)..."
                  value={stageRemark}
                  onChange={e => setStageRemark(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  * Note: Changing pipeline stage automatically logs an audit trail in customer history.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoveStageModal(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Confirm & Record Stage
                </button>
              </div>
            </form>
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
