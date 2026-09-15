import React, { useState } from 'react'
import { Settings, User, Building, Shield, Tag, Layers, Phone, Bell, Sliders, Key, Save, Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminSettingsPage() {
  const { settings, setSettings, showToast } = useAdmin()

  const [activeTab, setActiveTab] = useState('Profile')

  const [profileData, setProfileData] = useState(settings?.profile || { name: 'Admin', email: 'admin@loanflow.com', mobile: '+91 99000 11223', role: 'ADMIN' })
  const [companyData, setCompanyData] = useState(settings?.company || { name: 'LoanFlow Capital Services Pvt Ltd', logo: '', address: 'Level 4, Business Tower, MG Road, Bengaluru, Karnataka - 560001', phone: '+91 80 4455 6677', email: 'support@loanflow.com', website: 'https://loanflow.demo' })
  const [leadSources, setLeadSources] = useState(settings?.leadSources || ['Google Ads', 'IndiaMART', 'Facebook Ads', 'Referral', 'Website', 'CSV Upload', 'WhatsApp', 'Cold Call'])
  const [newSource, setNewSource] = useState('')
  const [notifications, setNotifications] = useState(settings?.notifications || { overdueAlerts: true, leadAssignment: true, docUpload: true, approvalAlerts: true, emailSummary: true })

  const tabs = [
    { id: 'Profile', label: 'A. Profile', icon: User },
    { id: 'Company', label: 'B. Company', icon: Building },
    { id: 'Roles', label: 'C. Users & Roles', icon: Shield },
    { id: 'Lead Sources', label: 'D. Lead Sources', icon: Tag },
    { id: 'Pipeline', label: 'E. Pipeline Stages', icon: Layers },
    { id: 'Call Config', label: 'F. Call Outcomes', icon: Phone },
    { id: 'Follow-ups', label: 'G. Follow-up Rules', icon: Sliders },
    { id: 'Notifications', label: 'H. Notifications', icon: Bell },
    { id: 'Integrations', label: 'I. Integrations', icon: Key },
  ]

  const handleSaveSettings = (e) => {
    e.preventDefault()
    setSettings({
      ...settings,
      profile: profileData,
      company: companyData,
      leadSources,
      notifications,
    })
    showToast('Admin settings saved successfully!')
  }

  const addLeadSource = () => {
    if (!newSource.trim()) return
    setLeadSources([...leadSources, newSource.trim()])
    setNewSource('')
    showToast('Lead source added!')
  }

  const removeLeadSource = (src) => {
    setLeadSources(leadSources.filter(s => s !== src))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure company profiles, CRM parameters, pipeline stages, and integrations.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Save size={16} /> Save All Changes
        </button>
      </div>

      {/* SETTINGS NAV TABS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* SETTINGS CARD BODY */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {/* A. PROFILE SETTINGS */}
        {activeTab === 'Profile' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Admin Profile Settings</h3>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Admin Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Mobile Number</label>
              <input
                type="text"
                value={profileData.mobile}
                onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </form>
        )}

        {/* B. COMPANY SETTINGS */}
        {activeTab === 'Company' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Company Details</h3>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Company Name</label>
              <input
                type="text"
                value={companyData.name}
                onChange={e => setCompanyData({ ...companyData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Office Address</label>
              <textarea
                rows={3}
                value={companyData.address}
                onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Support Phone</label>
                <input
                  type="text"
                  value={companyData.phone}
                  onChange={e => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Support Email</label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={e => setCompanyData({ ...companyData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </form>
        )}

        {/* C. ROLES & PERMISSIONS */}
        {activeTab === 'Roles' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">User & Permission Roles</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { role: 'Super Admin', desc: 'Full platform control, billing, user creation' },
                { role: 'Admin', desc: 'Complete operational management of leads, team & reports' },
                { role: 'ASM (Area Sales Mgr)', desc: 'Territory lead allocation and team tracking' },
                { role: 'Telecaller', desc: 'Restricted strictly to assigned calling queue' },
                { role: 'DSA Partner', desc: 'Third-party lead sourcing portal access' },
                { role: 'Operations / Credit', desc: 'Document verification and bank login handling' },
              ].map(r => (
                <div key={r.role} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="font-bold text-gray-900 text-xs">{r.role}</div>
                  <p className="text-gray-500 text-[11px] mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. LEAD SOURCES */}
        {activeTab === 'Lead Sources' && (
          <div className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Configurable Lead Sources</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Lead Source Name..."
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs"
              />
              <button onClick={addLeadSource} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-1">
                <Plus size={14} /> Add Source
              </button>
            </div>

            <div className="space-y-2">
              {leadSources.map(src => (
                <div key={src} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center font-medium text-gray-800">
                  <span>{src}</span>
                  <button onClick={() => removeLeadSource(src)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* H. NOTIFICATION SETTINGS */}
        {activeTab === 'Notifications' && (
          <div className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Notification Alert Toggles</h3>
            <div className="space-y-3">
              {[
                { key: 'overdueAlerts', label: 'Overdue Follow-up Alerts', desc: 'Notify Admin when calls pass scheduled time' },
                { key: 'leadAssignment', label: 'Unassigned Leads Alert', desc: 'Notify when new web/CSV leads enter queue' },
                { key: 'docUpload', label: 'Document Upload Notifications', desc: 'Notify when customer uploads KYC files' },
                { key: 'approvalAlerts', label: 'Sanction & Approval Alerts', desc: 'Notify when lender issues approval letter' },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-900">{item.label}</div>
                    <div className="text-gray-500 text-[11px]">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!notifications[item.key]}
                    onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* I. INTEGRATIONS */}
        {activeTab === 'Integrations' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">System Integrations</h3>
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-semibold mb-4">
              🔒 Security Notice: API keys and webhooks secrets are securely stored on backend environment variables and never exposed in the browser frontend.
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="font-bold text-gray-900">Exotel Telephony Cloud</div>
                <p className="text-gray-500 text-[11px]">Click-to-call, auto-dialer and call recording sync</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">CONNECTED ✓</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="font-bold text-gray-900">WhatsApp Business API</div>
                <p className="text-gray-500 text-[11px]">Automated doc requests & template messaging</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">CONNECTED ✓</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="font-bold text-gray-900">SendGrid Email Webhooks</div>
                <p className="text-gray-500 text-[11px]">Sanction letter delivery & daily summary emails</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">CONNECTED ✓</span>
              </div>
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER SETTINGS TABS */}
        {['Pipeline', 'Call Config', 'Follow-ups'].includes(activeTab) && (
          <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-2 text-xs">
            <div className="font-bold text-gray-800 text-sm">Configured parameters for {activeTab}</div>
            <p className="text-gray-500">Historical records remain preserved even if stage names are reconfigured.</p>
          </div>
        )}
      </div>
    </div>
  )
}
