import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import UnifiedCustomerModal from '../common/UnifiedCustomerModal'
import {
  TrendingUp, LayoutDashboard, Users, Upload, UserPlus, PhoneCall,
  Bell, BarChart2, Settings, LogOut, Menu, X, Layers, Calendar, FileText, Landmark, Search, Shield
} from 'lucide-react'

const navByRole = {
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Leads', icon: Users, path: '/admin/leads' },
    { label: 'Upload Leads', icon: Upload, path: '/admin/leads/upload' },
    { label: 'Telecallers', icon: UserPlus, path: '/admin/telecallers' },
    { label: 'ASMs', icon: Shield, path: '/admin/asms' },
    { label: 'Calls', icon: PhoneCall, path: '/admin/calls' },
    { label: 'Follow-ups', icon: Bell, path: '/admin/follow-ups' },
    { label: 'Pipeline', icon: Layers, path: '/admin/pipeline' },
    { label: 'Documents', icon: FileText, path: '/admin/documents' },
    { label: 'Lenders', icon: Landmark, path: '/admin/lenders' },
    { label: 'Reports', icon: BarChart2, path: '/admin/reports' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  ASM: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/asm/dashboard' },
    { label: 'Team Leads', icon: Users, path: '/asm/team' },
    { label: 'Follow-ups', icon: Bell, path: '/asm/follow-ups' },
    { label: 'Calls', icon: PhoneCall, path: '/asm/calls' },
    { label: 'Pipeline', icon: Layers, path: '/asm/pipeline' },
    { label: 'Performance', icon: BarChart2, path: '/asm/performance' },
  ],
  TELECALLER: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/telecaller/dashboard' },
    { label: 'My Leads', icon: Users, path: '/telecaller/leads' },
    { label: 'Follow-ups', icon: Calendar, path: '/telecaller/follow-ups' },
    { label: 'Call History', icon: PhoneCall, path: '/telecaller/calls' },
  ],
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const adminCtx = useAdmin()
  const customers = adminCtx?.customers || []

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Global Search & Notification State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const navItems = navByRole[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleBadge = {
    ADMIN: 'bg-indigo-100 text-indigo-700 font-bold',
    ASM: 'bg-blue-100 text-blue-700 font-bold',
    TELECALLER: 'bg-emerald-100 text-emerald-700 font-bold',
  }[user?.role] || 'bg-gray-100 text-gray-700'

  // Admin Live Notifications
  const adminNotifications = [
    { id: 1, text: '5 follow-ups are overdue.', target: '/admin/follow-ups', type: 'urgent' },
    { id: 2, text: '12 new leads are waiting for assignment.', target: '/admin/leads', type: 'info' },
    { id: 3, text: 'Priya Verma completed 38 calls today.', target: '/admin/calls', type: 'success' },
    { id: 4, text: '3 documents are waiting for verification.', target: '/admin/documents', type: 'warning' },
    { id: 5, text: '2 applications were approved by Tata Capital.', target: '/admin/pipeline', type: 'success' },
  ]

  // Global Search Results across Customers, Leads, Mobile Numbers, Telecallers, Loan Applications
  const searchResults = searchQuery
    ? customers.filter(c => {
        const q = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          (c.assignedTelecaller && c.assignedTelecaller.toLowerCase().includes(q))
        )
      })
    : []

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo Header */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-sm leading-tight">LoanFlow CRM</div>
            <div className="text-[10px] text-gray-400 font-medium">Business Loan Platform</div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile & Sign Out Footer */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-4 bg-white">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Admin'}</div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleBadge}`}>
              Role: {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50/70 font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-white border-r border-gray-100 shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl animate-slide-in lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* GLOBAL SEARCH INPUT (ITEM 12) */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Global Search: customers, leads, mobile (e.g. 9876543245)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />

              {/* Live Search Modal/Dropdown */}
              {isSearchOpen && searchQuery.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold border-b border-gray-100 pb-1">
                    <span>Search Results for "{searchQuery}"</span>
                    <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs">No matching customer or lead found.</div>
                  ) : (
                    searchResults.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c)
                          setIsSearchOpen(false)
                        }}
                        className="p-3 bg-gray-50 hover:bg-indigo-50/60 rounded-xl border border-gray-100 cursor-pointer transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-500">
                            Lead ID: <span className="font-mono text-indigo-600 font-bold">{c.id}</span> · Mobile: {c.mobile}
                          </div>
                          <div className="text-[10px] text-purple-600">Telecaller: {c.assignedTelecaller || 'Unassigned'}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 text-xs block">₹{(c.loanAmount / 100000).toFixed(1)}L</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">{c.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICATIONS BELL (ITEM 13) */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-900 text-sm">Admin Notifications</span>
                    <span className="bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full">5 New</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {adminNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setIsNotifOpen(false)
                          navigate(n.target)
                        }}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50/60 border border-gray-100 cursor-pointer transition-colors text-xs font-semibold text-gray-800"
                      >
                        {n.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Header Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-900 leading-none">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Role: ADMIN</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Global Customer 360° Modal from Search */}
      {selectedCustomer && (
        <UnifiedCustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
