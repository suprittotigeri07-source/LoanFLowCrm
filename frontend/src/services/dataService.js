import { leads, followUps, calls } from '../data/mockData'

// Lead Service — replace mock returns with fetch('/api/leads/') for Django backend
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export const leadService = {
  getLeads: async (filters = {}) => {
    await delay()
    let data = [...leads]
    if (filters.status) data = data.filter(l => l.status === filters.status)
    if (filters.assignedToId) data = data.filter(l => l.assignedToId === filters.assignedToId)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      data = data.filter(l => l.customerName.toLowerCase().includes(q) || l.businessName.toLowerCase().includes(q))
    }
    return data
  },

  getLead: async (id) => {
    await delay()
    return leads.find(l => l.id === Number(id)) || null
  },

  getTelecallerQueue: async (telecallerId) => {
    await delay()
    return leads.filter(l => l.assignedToId === telecallerId && ['New Lead', 'Contacted', 'Interested'].includes(l.status))
  },
}

export const callService = {
  logCall: async (data) => {
    await delay(600)
    return { id: Date.now(), ...data, timestamp: new Date().toISOString() }
  },

  getCalls: async (leadId) => {
    await delay()
    return calls.filter(c => c.leadId === Number(leadId))
  },
}

export const followUpService = {
  getTodayFollowUps: async () => {
    await delay()
    const today = new Date().toDateString()
    return followUps.filter(f => !f.completed && new Date(f.dueAt).toDateString() === today)
  },

  getOverdueFollowUps: async () => {
    await delay()
    return followUps.filter(f => !f.completed && new Date(f.dueAt) < new Date())
  },

  createFollowUp: async (data) => {
    await delay(500)
    return { id: Date.now(), ...data, completed: false }
  },

  completeFollowUp: async (id) => {
    await delay(400)
    return { id, completed: true, completedAt: new Date().toISOString() }
  },
}
