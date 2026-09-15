// Central Data Store for LoanFlow CRM — Business Loan Platform
// ALL DEMO/SAMPLE BUSINESS DATA REMOVED FOR FRESH PRODUCTION SETUP

export const PIPELINE_STAGES = [
  'NEW LEAD',
  'CONTACTED',
  'INTERESTED',
  'ELIGIBILITY',
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

export const CALL_STATUSES = [
  'Connected',
  'Busy',
  'No Answer',
  'Rejected',
  'Failed',
  'Wrong Number',
]

export const CALL_OUTCOMES = [
  'Interested',
  'Not Interested',
  'Call Later',
  'Number Busy',
  'No Response',
  'Wrong Number',
  'Already Taken Loan',
  'Documents Pending',
  'Eligible',
  'Not Eligible',
]

export const DOCUMENT_TYPES = [
  'PAN Card',
  'Aadhaar Card',
  'GST Certificate',
  'ITR (Last 2 Years)',
  'Bank Statement (12 Months)',
  'Business Proof',
  'Address Proof',
  'Other',
]

export const INITIAL_TELECALLERS = []
export const INITIAL_CUSTOMERS = []
export const INITIAL_CALLS = []
export const INITIAL_FOLLOWUPS = []
export const INITIAL_DOCUMENTS = []
export const INITIAL_LENDERS = []
export const INITIAL_AUDIT_LOGS = []

export const INITIAL_SETTINGS = {
  profile: { name: 'Super Admin', email: 'admin@crm.local', mobile: '', role: 'ADMIN' },
  company: { name: 'LoanFlow CRM', logo: '', address: '', phone: '', email: 'admin@crm.local', website: '' },
  leadSources: ['Google Ads', 'IndiaMART', 'Facebook Ads', 'Referral', 'Website', 'CSV Upload', 'WhatsApp', 'Cold Call'],
  callOutcomes: CALL_OUTCOMES,
  callStatuses: CALL_STATUSES,
  notifications: { overdueAlerts: true, leadAssignment: true, docUpload: true, approvalAlerts: true, emailSummary: true },
  integrations: { telephonyProvider: 'Telephony API', waApi: 'Meta Business API', emailProvider: 'Django SMTP' },
}
