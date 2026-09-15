import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Phone, Users, FileText, BarChart2, Clock, Shield, CheckCircle,
  ArrowRight, ChevronRight, Star, Upload, UserCheck, PhoneCall, Target,
  AlertCircle, Bell, Layers, Database, Lock, Activity, Zap
} from 'lucide-react'

// ─── Mock Dashboard Preview Card ─────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-lg mx-auto">
      {/* Title bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
        <span className="text-xs text-gray-500 ml-2 font-medium">LoanFlow CRM — Admin Dashboard</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Total Leads', value: '12,540', color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Calls Today', value: '426', color: 'bg-blue-50 text-blue-600' },
            { label: 'Interested', value: '64', color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Disbursed', value: '₹4.2Cr', color: 'bg-amber-50 text-amber-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-2.5 ${s.color}`}>
              <div className="text-base font-bold">{s.value}</div>
              <div className="text-[10px] opacity-80 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart mock */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Calls This Week</div>
          <div className="flex items-end gap-1.5 h-20">
            {[55, 72, 48, 80, 65, 90, 76].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm bg-indigo-500 opacity-80" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] text-gray-400 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Lead table */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">Recent Leads</div>
          <div className="space-y-2">
            {[
              { name: 'Rajesh Kumar', biz: 'Sharma Traders', amt: '₹15L', status: 'Interested', color: 'text-emerald-600 bg-emerald-50' },
              { name: 'Sunita Agarwal', biz: 'Agarwal Textiles', amt: '₹25L', status: 'Docs Pending', color: 'text-amber-600 bg-amber-50' },
              { name: 'Kavitha Reddy', biz: 'Reddy Pharma', amt: '₹35L', status: 'Login', color: 'text-violet-600 bg-violet-50' },
            ].map(l => (
              <div key={l.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{l.name}</div>
                  <div className="text-[10px] text-gray-400">{l.biz}</div>
                </div>
                <div className="text-xs font-bold text-gray-700 mx-2">{l.amt}</div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.color}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telecaller performance */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">Team Performance</div>
          <div className="space-y-2">
            {[
              { name: 'Arjun Sharma', pct: 85 },
              { name: 'Priya Verma', pct: 72 },
              { name: 'Rahul Nair', pct: 64 },
            ].map(t => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium text-gray-700">{t.name}</span><span className="text-[10px] text-gray-500">{t.pct}%</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.pct}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Problem Card ─────────────────────────────────────────────────────────────
function ProblemCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
        <Icon size={20} className="text-red-500" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 group">
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
        <Icon size={20} className="text-indigo-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// ─── Telecaller Workspace Preview ─────────────────────────────────────────────
function WorkspacePreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Lead #1024</div>
            <div className="text-indigo-200 text-xs mt-0.5">Bengaluru, Karnataka</div>
          </div>
          <span className="bg-emerald-400 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full">Interested</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Lead info */}
        <div>
          <div className="text-lg font-bold text-gray-900">Rajesh Kumar</div>
          <div className="text-sm text-gray-500">Sharma Traders · Wholesale</div>
          <div className="text-sm text-gray-500 mt-0.5">📞 +91 98XXX XXXXX</div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Monthly Turnover', value: '₹8,50,000' },
            { label: 'Required Loan', value: '₹15,00,000' },
          ].map(f => (
            <div key={f.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">{f.label}</div>
              <div className="text-sm font-bold text-gray-900">{f.value}</div>
            </div>
          ))}
        </div>

        {/* Call button */}
        <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
          <Phone size={18} />
          Call Now
        </button>

        {/* Outcomes preview */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">Call Outcome</div>
          <div className="flex flex-wrap gap-1.5">
            {['Interested', 'Call Later', 'No Response', 'Not Eligible'].map(o => (
              <span key={o} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all">{o}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline Column ──────────────────────────────────────────────────────────
function PipelineColumn({ stage, count, leads }) {
  const stageColors = {
    'New Lead': 'bg-slate-100 text-slate-600',
    'Contacted': 'bg-blue-100 text-blue-600',
    'Interested': 'bg-emerald-100 text-emerald-700',
    'Documents Pending': 'bg-amber-100 text-amber-700',
    'Login': 'bg-violet-100 text-violet-700',
    'Approval': 'bg-orange-100 text-orange-700',
    'Disbursement': 'bg-green-100 text-green-800',
  }
  const col = stageColors[stage] || 'bg-gray-100 text-gray-600'
  return (
    <div className="min-w-[200px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col}`}>{stage}</span>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-2.5">
        {leads.map((l, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-200">
            <div className="text-xs font-semibold text-gray-800 truncate">{l.name}</div>
            <div className="text-[11px] text-gray-500 truncate">{l.biz}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600">{l.amount}</span>
              <div className="w-5 h-5 rounded-full bg-gray-100 text-[9px] font-bold text-gray-600 flex items-center justify-center">{l.assignee[0]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ num, icon: Icon, title, desc }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
        <Icon size={24} className="text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">{num}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const pipelineData = [
    { stage: 'New Lead', count: 142, leads: [{ name: 'Meena Pillai', biz: 'Pillai Saree House', amount: '₹8L', assignee: 'Vijay' }, { name: 'Farhan Sheikh', biz: 'Sheikh Logistics', amount: '₹18L', assignee: 'Priya' }] },
    { stage: 'Interested', count: 64, leads: [{ name: 'Rajesh Kumar', biz: 'Sharma Traders', amount: '₹15L', assignee: 'Arjun' }, { name: 'Ravi Menon', biz: 'Menon Auto', amount: '₹22L', assignee: 'Priya' }] },
    { stage: 'Documents Pending', count: 38, leads: [{ name: 'Sunita Agarwal', biz: 'Agarwal Textiles', amount: '₹25L', assignee: 'Priya' }] },
    { stage: 'Login', count: 22, leads: [{ name: 'Deepa Nair', biz: 'Nair Organic Foods', amount: '₹20L', assignee: 'Vijay' }] },
    { stage: 'Approval', count: 9, leads: [{ name: 'Suresh Yadav', biz: 'Yadav Agro', amount: '₹12L', assignee: 'Sneha' }] },
    { stage: 'Disbursement', count: 6, leads: [{ name: 'Lakshmi Iyer', biz: 'Iyer Software', amount: '₹40L', assignee: 'Arjun' }] },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white pt-24 pb-20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-indigo-700">Built for Business Loan Teams</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Turn Every Lead Into a{' '}
                <span className="text-indigo-600 relative">
                  Loan Opportunity
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C60 2 140 2 298 8" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
                A powerful CRM built for business loan telecalling teams. Manage leads, calls, follow-ups, documents, and loan applications — all from one workspace.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all duration-200 hover:translate-y-[-1px]">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200">
                  Explore Features
                  <ChevronRight size={18} />
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['A', 'P', 'R', 'V', 'S'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white">{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-gray-500">Trusted by 50+ loan teams</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard Preview */}
            <div className="animate-fade-in relative hidden lg:block">
              <div className="absolute -top-6 -right-6 w-full h-full bg-indigo-100/30 rounded-2xl" />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-indigo-600 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Business Locations' },
              { value: '10K+', label: 'Leads Managed' },
              { value: '95%', label: 'Follow-up Visibility' },
              { value: '24/7', label: 'CRM Accessibility' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-indigo-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEMS ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-4">The Problem</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Managing Loan Leads Shouldn't Be Complicated</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Most loan teams are stuck with scattered data, missed follow-ups, and zero visibility.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ProblemCard icon={Database} title="Scattered Lead Data" desc="Customer information is spread across spreadsheets, WhatsApp chats, and sticky notes." />
            <ProblemCard icon={Bell} title="Missed Follow-ups" desc="Important callbacks get forgotten, leading to lost loan opportunities." />
            <ProblemCard icon={FileText} title="Manual Tracking" desc="Telecallers spend hours updating spreadsheets instead of calling leads." />
            <ProblemCard icon={AlertCircle} title="Limited Visibility" desc="Managers can't easily understand team performance or pipeline health." />
          </div>
        </div>
      </section>

      {/* ─── SOLUTION / FEATURES ─── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">The Solution</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything Your Loan Team Needs in One CRM</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Designed from the ground up for business loan telecalling workflows.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={Users} title="Lead Management" desc="Import, assign, track, and manage business loan leads. Bulk CSV upload with validation." />
            <FeatureCard icon={Phone} title="Smart Calling Workflow" desc="Telecallers can quickly view a lead and initiate a call. One-click disposition logging." />
            <FeatureCard icon={Bell} title="Follow-up Management" desc="Never miss an important callback. Overdue alerts, today's list, and upcoming queue." />
            <FeatureCard icon={Layers} title="Loan Pipeline" desc="Track leads from New Lead to Disbursement across 9 clearly defined stages." />
            <FeatureCard icon={BarChart2} title="Team Performance" desc="Managers monitor call volume, connection rate, and conversion metrics in real time." />
            <FeatureCard icon={Activity} title="Customer Timeline" desc="Calls, follow-ups, WhatsApp messages, documents, and status changes — all in one view." />
          </div>
        </div>
      </section>

      {/* ─── FEATURE SHOWCASE 1 — Lead Table ─── */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">Lead Management</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Every Lead. Fully Organized.</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">Import leads from CSV, assign to telecallers, filter by status, and track follow-ups — all in one powerful table view.</p>
              <ul className="space-y-3">
                {['Bulk CSV import with validation', 'One-click telecaller assignment', 'Status filter and search', 'Inline follow-up scheduling'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Lead Table Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">All Leads</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">12,540 total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Customer', 'Business', 'Loan Amt', 'Status', 'Assigned'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Rajesh Kumar', biz: 'Sharma Traders', amt: '₹15L', status: 'Interested', statusCls: 'bg-emerald-50 text-emerald-700', assignee: 'Arjun' },
                      { name: 'Sunita Agarwal', biz: 'Agarwal Textiles', amt: '₹25L', status: 'Docs Pending', statusCls: 'bg-amber-50 text-amber-700', assignee: 'Priya' },
                      { name: 'Kavitha Reddy', biz: 'Reddy Pharma', amt: '₹35L', status: 'Login', statusCls: 'bg-violet-50 text-violet-700', assignee: 'Arjun' },
                      { name: 'Amit Bansal', biz: 'Bansal Const.', amt: '₹50L', status: 'Credit/PD', statusCls: 'bg-pink-50 text-pink-700', assignee: 'Rahul' },
                    ].map(r => (
                      <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                        <td className="px-4 py-3 text-gray-500">{r.biz}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{r.amt}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.statusCls}`}>{r.status}</span></td>
                        <td className="px-4 py-3 text-gray-500">{r.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SHOWCASE 2 — Telecaller Workspace ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <WorkspacePreview />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">Telecaller Workspace</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Speed. Optimized for Calls.</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">The telecaller dashboard surfaces one lead at a time with all context needed — no tab-switching, no confusion. Log the outcome in seconds.</p>
              <ul className="space-y-3">
                {['Next-lead queue with full business context', 'One-click call initiation', '10 call outcomes for precise logging', 'Follow-up scheduling in 2 clicks', 'Real-time remarks and notes'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Zap size={16} className="text-indigo-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section id="pipeline" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">Loan Pipeline</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Every Loan From Lead to Disbursement</h2>
            <p className="text-gray-500 max-w-lg mx-auto">A 9-stage Kanban pipeline with real-time counts and lead cards for instant visibility.</p>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max px-1">
              {pipelineData.map(col => (
                <PipelineColumn key={col.stage} {...col} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple 4-Step Workflow</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
            {/* Connector line (desktop only) */}
            <div className="absolute top-7 left-[12%] right-[12%] h-0.5 bg-indigo-100 hidden lg:block" />
            <StepCard num="01" icon={Upload} title="Import Leads" desc="Upload CSV files. Smart validation removes duplicates and flags invalid entries before import." />
            <StepCard num="02" icon={UserCheck} title="Assign Leads" desc="Auto or manual assignment of leads to the right telecaller based on territory or workload." />
            <StepCard num="03" icon={PhoneCall} title="Call & Follow Up" desc="Telecallers call leads, log outcomes from 10 predefined dispositions, and schedule follow-ups." />
            <StepCard num="04" icon={Target} title="Track & Convert" desc="Managers monitor team performance and guide leads through the 9-stage loan pipeline to disbursement." />
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD SHOWCASE ─── */}
      <section id="dashboards" className="py-20 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-semibold text-indigo-400 bg-indigo-900/50 border border-indigo-800 px-3 py-1 rounded-full mb-4">Role-Based Dashboards</div>
            <h2 className="text-3xl font-bold mb-4">The Right View for Every Role</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Admin, ASM, and Telecaller each get a dashboard designed specifically for their workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Admin', icon: BarChart2, color: 'indigo',
                stats: ['Total Leads · 12,540', 'Calls Today · 426', 'Connected · 287', 'Interested · 64', 'Conversion Rate · 5.2%'],
                desc: 'Full organizational visibility. Upload leads, manage telecallers, and see revenue-level reporting.',
              },
              {
                role: 'ASM', icon: Users, color: 'blue',
                stats: ['Team Leads · 3,120', 'Today\'s Follow-ups · 28', 'Overdue · 5', 'Team Calls · 142', 'Leaderboard'],
                desc: 'Team-level performance dashboards. Lead the team with data-driven insights.',
              },
              {
                role: 'Telecaller', icon: Phone, color: 'emerald',
                stats: ['Today\'s Leads · 24', 'Calls Made · 18', 'Follow-ups · 5', 'Overdue · 1', 'Interested · 4'],
                desc: 'Clean, fast, focused workspace. The next lead is always one click away.',
              },
            ].map(d => {
              const colors = { indigo: 'border-indigo-700 bg-indigo-900/30', blue: 'border-blue-700 bg-blue-900/30', emerald: 'border-emerald-700 bg-emerald-900/30' }
              const iconColors = { indigo: 'bg-indigo-600', blue: 'bg-blue-600', emerald: 'bg-emerald-600' }
              return (
                <div key={d.role} className={`rounded-2xl border p-6 ${colors[d.color]} hover:scale-[1.02] transition-transform duration-200`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconColors[d.color]}`}>
                    <d.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{d.role} Dashboard</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{d.desc}</p>
                  <ul className="space-y-1.5 mb-6">
                    {d.stats.map(s => (
                      <li key={s} className="text-xs text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-500" />{s}
                      </li>
                    ))}
                  </ul>
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:gap-2.5 transition-all duration-150">
                    View Dashboard <ArrowRight size={15} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECURITY ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">Security</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built With Security in Mind</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">Your customer data is sensitive. LoanFlow is designed with data protection and access control as core principles.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Lock, title: 'Role-Based Access', desc: 'Admin, ASM, Telecaller roles with fine-grained permissions.' },
                { icon: Shield, title: 'Secure Authentication', desc: 'Token-based auth, session management, and secure login flows.' },
                { icon: Database, title: 'Protected Customer Data', desc: 'PII hashing and restricted data exposure by role.' },
                { icon: Activity, title: 'Audit-Ready Logs', desc: 'Full audit trail of lead changes, calls, and document access.' },
                { icon: UserCheck, title: 'Server-Side Control', desc: 'Authorization enforced at the API level, not just UI.' },
                { icon: FileText, title: 'Document Security', desc: 'Secure document storage with access control policies.' },
              ].map(s => (
                <div key={s.title} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all duration-200">
                  <s.icon size={18} className="text-indigo-500 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 mb-1">{s.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Simplify Your Loan Calling Process?</h2>
          <p className="text-indigo-200 mb-8 text-lg leading-relaxed">
            Bring leads, calls, follow-ups, documents, and loan progress into one centralized workspace.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 shadow-md transition-all duration-200">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-700 text-white font-semibold rounded-xl hover:bg-indigo-800 transition-all duration-200">
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
