import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TrendingUp, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Dashboards', href: '#dashboards' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base tracking-tight">LoanFlow</span>
              <span className="font-bold text-indigo-600 text-base tracking-tight"> CRM</span>
            </div>
          </Link>

          {/* Desktop nav */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-150">
                  {l.label}
                </a>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-150">
              Login
            </Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150">
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {isLanding && navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Login</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
