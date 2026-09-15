import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  INITIAL_CUSTOMERS,
  INITIAL_TELECALLERS,
  INITIAL_CALLS,
  INITIAL_FOLLOWUPS,
  INITIAL_DOCUMENTS,
  INITIAL_LENDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  PIPELINE_STAGES,
} from '../services/adminDataStore'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  // Load from localStorage or initial defaults
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('loanflow_customers')
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS
  })

  const [telecallers, setTelecallers] = useState(() => {
    const saved = localStorage.getItem('loanflow_telecallers')
    return saved ? JSON.parse(saved) : INITIAL_TELECALLERS
  })

  const [calls, setCalls] = useState(() => {
    const saved = localStorage.getItem('loanflow_calls')
    return saved ? JSON.parse(saved) : INITIAL_CALLS
  })

  const [followUps, setFollowUps] = useState(() => {
    const saved = localStorage.getItem('loanflow_followups')
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS
  })

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('loanflow_documents')
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS
  })

  const [lenders, setLenders] = useState(() => {
    const saved = localStorage.getItem('loanflow_lenders')
    return saved ? JSON.parse(saved) : INITIAL_LENDERS
  })

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('loanflow_audit_logs')
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('loanflow_settings')
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS
  })

  const [toast, setToast] = useState(null)

  // Save changes to local storage
  useEffect(() => { localStorage.setItem('loanflow_customers', JSON.stringify(customers)) }, [customers])
  useEffect(() => { localStorage.setItem('loanflow_telecallers', JSON.stringify(telecallers)) }, [telecallers])
  useEffect(() => { localStorage.setItem('loanflow_calls', JSON.stringify(calls)) }, [calls])
  useEffect(() => { localStorage.setItem('loanflow_followups', JSON.stringify(followUps)) }, [followUps])
  useEffect(() => { localStorage.setItem('loanflow_documents', JSON.stringify(documents)) }, [documents])
  useEffect(() => { localStorage.setItem('loanflow_lenders', JSON.stringify(lenders)) }, [lenders])
  useEffect(() => { localStorage.setItem('loanflow_audit_logs', JSON.stringify(auditLogs)) }, [auditLogs])
  useEffect(() => { localStorage.setItem('loanflow_settings', JSON.stringify(settings)) }, [settings])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Audit helper
  const addAuditLog = (action, leadId, customerName, oldValue, newValue) => {
    const newLog = {
      id: Date.now(),
      user: 'Admin',
      action,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      leadId,
      customerName,
      oldValue,
      newValue,
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  // Lead actions
  const addCustomerLead = (leadData) => {
    // Check duplicate mobile
    const existing = customers.find(c => c.mobile.replace(/\D/g, '') === leadData.mobile.replace(/\D/g, ''))
    if (existing) {
      showToast(`Duplicate mobile number! Lead already exists as ${existing.name} (${existing.id})`, 'error')
      return false
    }

    const newLeadId = `LD-${1000 + customers.length + 1}`
    const newCustId = `CUST-${800 + customers.length + 1}`
    const newCustomer = {
      id: newLeadId,
      customerId: newCustId,
      ...leadData,
      status: leadData.status || 'NEW LEAD',
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: 'Lead registered by Admin.',
    }

    setCustomers(prev => [newCustomer, ...prev])
    addAuditLog('Lead Created', newLeadId, leadData.name, 'None', newCustomer.status)
    showToast(`Lead ${newLeadId} for ${leadData.name} created successfully!`)
    return true
  }

  const updateLeadStage = (leadId, newStage, remark = '') => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === leadId) {
          const oldStage = c.status
          addAuditLog('Stage Changed', leadId, c.name, oldStage, newStage)
          return {
            ...c,
            status: newStage,
            lastActivity: remark || `Stage updated from ${oldStage} to ${newStage}`,
          }
        }
        return c
      })
    )
    showToast(`Lead ${leadId} updated to ${newStage}`)
  }

  const assignLeadsBulk = (leadIds, telecallerName) => {
    const tele = telecallers.find(t => t.name === telecallerName)
    setCustomers(prev =>
      prev.map(c => {
        if (leadIds.includes(c.id)) {
          addAuditLog('Lead Reassigned', c.id, c.name, c.assignedTelecaller || 'Unassigned', telecallerName)
          return { ...c, assignedTelecaller: telecallerName, telecallerId: tele?.id || null }
        }
        return c
      })
    )

    if (tele) {
      setTelecallers(prev =>
        prev.map(t => (t.id === tele.id ? { ...t, assignedLeads: t.assignedLeads + leadIds.length } : t))
      )
    }

    showToast(`${leadIds.length} lead(s) assigned to ${telecallerName}`)
  }

  // Telecaller actions
  const addTelecaller = (tData) => {
    const newId = telecallers.length + 1
    const newTele = {
      id: newId,
      empId: tData.empId || `EMP-${100 + newId}`,
      assignedLeads: 0,
      callsToday: 0,
      followups: 0,
      connected: 0,
      interested: 0,
      login: 0,
      disbursement: 0,
      ...tData,
    }
    setTelecallers(prev => [...prev, newTele])
    addAuditLog('Telecaller Created', '—', tData.name, 'None', tData.status)
    showToast(`Telecaller ${tData.name} created!`)
  }

  const updateTelecallerStatus = (id, newStatus) => {
    setTelecallers(prev =>
      prev.map(t => {
        if (t.id === id) {
          addAuditLog('Telecaller Status Changed', '—', t.name, t.status, newStatus)
          return { ...t, status: newStatus }
        }
        return t
      })
    )
    showToast(`Telecaller status updated to ${newStatus}`)
  }

  // Followup actions
  const addFollowUp = (fuData) => {
    const newFu = {
      id: Date.now(),
      status: 'Pending',
      ...fuData,
    }
    setFollowUps(prev => [newFu, ...prev])
    addAuditLog('Follow-up Created', fuData.leadId, fuData.customer, 'None', `${fuData.priority} - ${fuData.date}`)
    showToast(`Follow-up scheduled for ${fuData.customer}`)
  }

  const updateFollowUpStatus = (id, newStatus) => {
    setFollowUps(prev =>
      prev.map(f => {
        if (f.id === id) {
          addAuditLog('Follow-up Status Updated', f.leadId, f.customer, f.status, newStatus)
          return { ...f, status: newStatus }
        }
        return f
      })
    )
    showToast(`Follow-up marked as ${newStatus}`)
  }

  // Document actions
  const verifyDocument = (docId, status, notes = '') => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          addAuditLog('Document Status Updated', d.leadId, d.customerName, d.status, status)
          return { ...d, status, notes: notes || d.notes }
        }
        return d
      })
    )
    showToast(`Document ${docId} set to ${status}`)
  }

  // Lender actions
  const addLender = (lenderData) => {
    const newLender = {
      id: lenders.length + 1,
      status: 'Active',
      ...lenderData,
    }
    setLenders(prev => [...prev, newLender])
    addAuditLog('Lender Added', '—', lenderData.name, 'None', 'Active')
    showToast(`Lender ${lenderData.name} added!`)
  }

  const toggleLenderStatus = (id) => {
    setLenders(prev =>
      prev.map(l => {
        if (l.id === id) {
          const next = l.status === 'Active' ? 'Inactive' : 'Active'
          addAuditLog('Lender Status Changed', '—', l.name, l.status, next)
          return { ...l, status: next }
        }
        return l
      })
    )
  }

  return (
    <AdminContext.Provider
      value={{
        customers,
        telecallers,
        calls,
        followUps,
        documents,
        lenders,
        auditLogs,
        settings,
        setSettings,
        toast,
        showToast,
        addCustomerLead,
        updateLeadStage,
        assignLeadsBulk,
        addTelecaller,
        updateTelecallerStatus,
        addFollowUp,
        updateFollowUpStatus,
        verifyDocument,
        addLender,
        toggleLenderStatus,
        addAuditLog,
        setCustomers,
      }}
    >
      {children}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-3 animate-bounce ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30">
            ✕
          </button>
        </div>
      )}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) {
    // Return fallback empty or throw exception
    return {}
  }
  return ctx
}
