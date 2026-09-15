import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AppLayout from '../components/layout/AppLayout'

// Pages
import Landing from '../pages/Landing'
import Login from '../pages/Login'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminLeadsPage from '../pages/admin/AdminLeadsPage'
import AdminUploadLeads from '../pages/admin/AdminUploadLeads'
import AdminTelecallersPage from '../pages/admin/AdminTelecallersPage'
import AdminAsmPage from '../pages/admin/AdminAsmPage'
import AdminCallsPage from '../pages/admin/AdminCallsPage'
import AdminFollowUpsPage from '../pages/admin/AdminFollowUpsPage'
import AdminPipelinePage from '../pages/admin/AdminPipelinePage'
import AdminDocumentsPage from '../pages/admin/AdminDocumentsPage'
import AdminLendersPage from '../pages/admin/AdminLendersPage'
import AdminReportsPage from '../pages/admin/AdminReportsPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'

// ASM & Telecaller Pages
import AsmDashboard from '../pages/asm/AsmDashboard'
import TelecallerDashboard from '../pages/telecaller/TelecallerDashboard'
import LeadDetail from '../pages/leads/LeadDetail'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = { ADMIN: '/admin/dashboard', ASM: '/asm/dashboard', TELECALLER: '/telecaller/dashboard' }
    return <Navigate to={redirects[user.role] || '/login'} replace />
  }
  return <AppLayout>{children}</AppLayout>
}

// Public route — redirect logged-in users
function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) {
    const redirects = { ADMIN: '/admin/dashboard', ASM: '/asm/dashboard', TELECALLER: '/telecaller/dashboard' }
    return <Navigate to={redirects[user.role] || '/admin/dashboard'} replace />
  }
  return children
}

// Placeholder for pages not yet built
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500">This section is coming soon.</p>
    </div>
  )
}

export default function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {/* Show Navbar/Footer only on landing page */}
      {isLanding && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<><Landing /><Footer /></>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Complete Admin Section Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLeadsPage /></ProtectedRoute>} />
        <Route path="/admin/leads/upload" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUploadLeads /></ProtectedRoute>} />
        <Route path="/admin/telecallers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminTelecallersPage /></ProtectedRoute>} />
        <Route path="/admin/asms" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAsmPage /></ProtectedRoute>} />
        <Route path="/admin/calls" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCallsPage /></ProtectedRoute>} />
        <Route path="/admin/follow-ups" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFollowUpsPage /></ProtectedRoute>} />
        <Route path="/admin/pipeline" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPipelinePage /></ProtectedRoute>} />
        <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDocumentsPage /></ProtectedRoute>} />
        <Route path="/admin/lenders" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLendersPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReportsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettingsPage /></ProtectedRoute>} />

        {/* ASM routes */}
        <Route path="/asm/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AsmDashboard /></ProtectedRoute>} />
        <Route path="/asm/team" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AdminLeadsPage /></ProtectedRoute>} />
        <Route path="/asm/follow-ups" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AdminFollowUpsPage /></ProtectedRoute>} />
        <Route path="/asm/calls" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AdminCallsPage /></ProtectedRoute>} />
        <Route path="/asm/pipeline" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AdminPipelinePage /></ProtectedRoute>} />
        <Route path="/asm/performance" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM']}><AdminReportsPage /></ProtectedRoute>} />

        {/* Telecaller routes */}
        <Route path="/telecaller/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM', 'TELECALLER']}><TelecallerDashboard /></ProtectedRoute>} />
        <Route path="/telecaller/leads" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM', 'TELECALLER']}><AdminLeadsPage /></ProtectedRoute>} />
        <Route path="/telecaller/follow-ups" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM', 'TELECALLER']}><AdminFollowUpsPage /></ProtectedRoute>} />
        <Route path="/telecaller/calls" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM', 'TELECALLER']}><AdminCallsPage /></ProtectedRoute>} />

        {/* Shared lead detail */}
        <Route path="/leads/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'ASM', 'TELECALLER']}><LeadDetail /></ProtectedRoute>} />
        <Route path="/leads/upload" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUploadLeads /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
