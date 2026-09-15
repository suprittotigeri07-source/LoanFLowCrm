import React from 'react'

const colorMap = {
  'New Lead': 'bg-slate-100 text-slate-700',
  'Contacted': 'bg-blue-100 text-blue-700',
  'Interested': 'bg-emerald-100 text-emerald-700',
  'Eligibility Check': 'bg-cyan-100 text-cyan-700',
  'Documents Pending': 'bg-amber-100 text-amber-700',
  'Login': 'bg-violet-100 text-violet-700',
  'Credit / PD': 'bg-pink-100 text-pink-700',
  'Approval': 'bg-orange-100 text-orange-700',
  'Disbursement': 'bg-green-100 text-green-800',
  // Call outcomes
  'Interested': 'bg-emerald-100 text-emerald-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Call Later': 'bg-blue-100 text-blue-700',
  'Number Busy': 'bg-amber-100 text-amber-700',
  'No Response': 'bg-slate-100 text-slate-600',
  'Wrong Number': 'bg-red-100 text-red-600',
  'Already Taken Loan': 'bg-gray-100 text-gray-600',
  'Loan Required – Documents Pending': 'bg-amber-100 text-amber-700',
  'Eligible – Send Documents': 'bg-emerald-100 text-emerald-700',
  'Not Eligible': 'bg-red-100 text-red-700',
}

export default function Badge({ label, className = '' }) {
  const colors = colorMap[label] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors} ${className}`}>
      {label}
    </span>
  )
}
