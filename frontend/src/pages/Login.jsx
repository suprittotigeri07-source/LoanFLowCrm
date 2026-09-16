import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { api } from '../api'
import { TrendingUp, Eye, EyeOff, CheckCircle, ArrowRight, AlertCircle, Key, Lock } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false)

  // First Login Password Change State
  const [mustChangePw, setMustChangePw] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(employeeId, password)
      if (res.user?.must_change_password) {
        setMustChangePw(true)
        setOldPw(password)
      } else {
        navigate(authService.getRedirectPath(res.user.role), { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Invalid Employee ID / Email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      setError('New passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.changePassword(oldPw, newPw, confirmPw)
      const user = authService.getCurrentUser()
      navigate(authService.getRedirectPath(user?.role || 'TELECALLER'), { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">

        {/* Left — Branding */}
        <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-10 hidden lg:flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

          <div className="relative">
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">LoanFlow CRM</span>
            </Link>

            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
              Manage Leads.<br />Make Calls.<br />Close Loans.
            </h2>
            <p className="text-indigo-100 mb-10 leading-relaxed text-sm">
              The complete Business Loan Telecalling CRM platform for Admin, ASM, and Telecallers.
            </p>

            <ul className="space-y-4">
              {['Role-Based Lead Isolation', 'Automatic Credentials Email', 'Interactive Pipeline Kanban', 'Unified 360° Customer Records'].map(f => (
                <li key={f} className="flex items-center gap-3 text-white">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle size={13} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex -space-x-2">
              {['A', 'P', 'R'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center border-2 border-indigo-600">{l}</div>
              ))}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Business Loan Telecalling Operations</div>
              <div className="text-indigo-200 text-xs">Secure Role-Based Access</div>
            </div>
          </div>
        </div>

        {/* Right — Login Form / Password Change */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">LoanFlow CRM</span>
          </div>

          {!mustChangePw ? (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5">Welcome Back</h1>
              <p className="text-slate-500 text-xs mb-6">Sign in using your Employee ID or Email and password</p>

              {error && (
                <div className="mb-4 flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID or Email *</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. suprittotiger05@gmail.com, ADMIN-001"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all pr-11"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-violet-600 rounded" />
                    <span className="text-xs text-slate-600 font-medium">Remember Employee ID</span>
                  </label>
                  <a href="#" className="text-xs text-violet-600 hover:underline font-bold">Forgot Password?</a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            /* FIRST LOGIN MANDATORY PASSWORD CHANGE */
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-2">
                <Key size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Change Temporary Password</h2>
              <p className="text-gray-500 text-xs">For security reasons, please change your password before continuing to your dashboard.</p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Continue'}
                </button>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-[10px] text-gray-400">
            🔒 LoanFlow CRM · Secure Password Hashing & Backend RBAC Enforced
          </p>
        </div>
      </div>
    </div>
  )
}
