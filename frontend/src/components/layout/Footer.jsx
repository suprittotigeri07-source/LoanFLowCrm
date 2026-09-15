import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Globe, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-base">LoanFlow CRM</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Business Loan Telecalling CRM — built for high-velocity loan origination teams.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"><Globe size={16} /></a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"><Phone size={16} /></a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"><Mail size={16} /></a>
            </div>
          </div>

          {/* Links */}
          {[
            { heading: 'Product', links: ['Features', 'Pipeline', 'Dashboards', 'Pricing'] },
            { heading: 'Company', links: ['About', 'Contact', 'Careers', 'Blog'] },
            { heading: 'Resources', links: ['Documentation', 'Support', 'API Reference', 'Changelog'] },
          ].map(col => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 LoanFlow CRM. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
