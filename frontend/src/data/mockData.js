// LoanFlow CRM Configuration & Empty Initial Constants
// ALL DEMO / MOCK BUSINESS DATA HAS BEEN REMOVED FOR PRODUCTION FRESH INITIALIZATION

export const PIPELINE_STAGES = [
  'NEW LEAD',
  'CONTACTED',
  'INTERESTED',
  'ELIGIBILITY CHECK',
  'DOCUMENTS PENDING',
  'DOCUMENTS RECEIVED',
  'LENDER SELECTED',
  'LOGIN',
  'CREDIT / PD',
  'APPROVAL',
  'DISBURSEMENT',
  'REJECTED',
  'CLOSED',
]

export const CALL_OUTCOMES = [
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

export const telecallers = []
export const asms = []
export const customers = []
export const leads = []
export const followUps = []
export const calls = []
export const documents = []
export const dashboardStats = {
  totalLeads: 0,
  callsToday: 0,
  connectedCalls: 0,
  interestedLeads: 0,
  followupsDue: 0,
  documentsPending: 0,
  loginCases: 0,
  approvalCases: 0,
  disbursements: 0,
}
