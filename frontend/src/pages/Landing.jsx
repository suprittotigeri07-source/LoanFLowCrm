import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Phone, Users, FileText, BarChart2, Clock, Shield, CheckCircle,
  ArrowRight, ChevronRight, Star, Upload, UserCheck, PhoneCall, Target,
  AlertCircle, Bell, Layers, Database, Lock, Activity, Zap, MessageSquare,
  Mic, Landmark, PieChart, Sparkles, Building2, CheckSquare, Award, Smartphone
} from 'lucide-react'

// ─── Mock Dashboard Preview Card ─────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-lg mx-auto">
      {/* Title bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-slate-300 ml-2 font-medium tracking-wide">
            Siddharoodha LoanConnect — Admin MIS
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
          Live Sync
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Today MIS stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total Leads', value: '250', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { label: 'Calls Today', value: '218', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Connected', value: '146', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Interested', value: '42', color: 'bg-amber-50 text-amber-700 border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-2.5 border ${s.color}`}>
              <div className="text-base font-extrabold">{s.value}</div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Funnel row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Docs Pending', value: '18', badge: 'bg-amber-100 text-amber-800' },
            { label: 'Bank Login', value: '12', badge: 'bg-violet-100 text-violet-800' },
            { label: 'Approval', value: '6', badge: 'bg-sky-100 text-sky-800' },
            { label: 'Disbursed', value: '3', badge: 'bg-emerald-100 text-emerald-800' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
              <div className="text-xs font-bold text-slate-800">{s.value}</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Telecaller performance table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Telecaller Live Funnel</span>
            <span className="text-[10px] text-slate-400">Target: 60 Calls/Day</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Priya Verma', calls: 65, conn: 42, int: 14, login: 4 },
              { name: 'Asha Sharma', calls: 58, conn: 37, int: 11, login: 3 },
              { name: 'Kavya Nair', calls: 72, conn: 45, int: 13, login: 4 },
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <span className="font-semibold text-slate-800">{t.name}</span>
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-slate-500">📞 {t.calls}</span>
                  <span className="text-emerald-700 font-bold">✨ {t.int}</span>
                  <span className="text-indigo-700 font-bold">🏦 {t.login}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banker match preview */}
        <div className="bg-indigo-900/90 text-white rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
              <Landmark size={14} />
              Banker Matching Engine
            </div>
            <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">High Fit</span>
          </div>
          <p className="text-[11px] text-indigo-100">
            Rajesh Kumar (Hardware · ₹1.2Cr Turnover) matched with <strong className="text-white">Banker A & NBFC B</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── One Customer One Record Timeline Preview ─────────────────────────────────
function OneRecordPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">Rajesh Kumar</h4>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 Hot Lead</span>
          </div>
          <p className="text-xs text-slate-500">Sharma Traders · Hardware · Turnover: ₹1.20 Cr · Required: ₹25L</p>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
          Assigned to: Priya
        </span>
      </div>

      {/* Unified Timeline */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unified 360° Activity Record</div>

        {[
          { icon: PhoneCall, color: 'text-blue-600 bg-blue-50', title: 'First Telecall Initiated', time: '01-Sep 10:15 AM', detail: 'Duration: 3 min · Outcome: Interested · Req: ₹25L' },
          { icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50', title: 'WhatsApp Business API Template Sent', time: '01-Sep 10:18 AM', detail: 'Sent Document List via Official Business API' },
          { icon: Mic, color: 'text-violet-600 bg-violet-50', title: '🎙️ Voice Remark Logged', time: '01-Sep 10:20 AM', detail: '"Customer has 5-yr vintage, GST available. Call back tomorrow 11 AM."' },
          { icon: FileText, color: 'text-amber-600 bg-amber-50', title: 'KYC & GST Documents Uploaded', time: '02-Sep 02:30 PM', detail: 'ITR 2 yrs, GST Returns, Bank Statement 12 Months' },
          { icon: Landmark, color: 'text-indigo-600 bg-indigo-50', title: 'Banker Match Recommended', time: '02-Sep 04:00 PM', detail: 'Mapped to HDFC Bank (Login Stage)' },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-3 text-xs">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={14} />
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-800">{item.title}</span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
              <div className="text-slate-600 text-[11px]">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const [selectedOutcome, setSelectedOutcome] = useState('Interested')

  const outcomes = [
    '1. Interested',
    '2. Not Interested',
    '3. Call Later',
    '4. Number Busy',
    '5. No Response',
    '6. Wrong Number',
    '7. Already Taken Loan',
    '8. Loan Required – Docs Pending',
    '9. Eligible – Send Docs',
    '10. Not Eligible'
  ]

  const pipelineStages = [
    { name: 'NEW LEAD', color: 'bg-slate-100 text-slate-700' },
    { name: 'CONTACTED', color: 'bg-blue-100 text-blue-700' },
    { name: 'INTERESTED', color: 'bg-emerald-100 text-emerald-800' },
    { name: 'ELIGIBILITY CHECK', color: 'bg-sky-100 text-sky-800' },
    { name: 'DOCUMENTS PENDING', color: 'bg-amber-100 text-amber-800' },
    { name: 'LOGIN', color: 'bg-violet-100 text-violet-800' },
    { name: 'CREDIT / PD', color: 'bg-pink-100 text-pink-800' },
    { name: 'APPROVAL', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'DISBURSEMENT', color: 'bg-emerald-600 text-white font-bold' },
  ]

  return (
    <div className="overflow-x-hidden font-sans bg-slate-50">

      {/* ─── HERO ─── */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-24 pb-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-700/60 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-indigo-200 tracking-wide">
                  SHRI SIDDHAROODHA BUSINESS LOAN CRM (LoanConnect)
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                Purpose-Built For <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
                  Business Loan Telecalling
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
                The complete Telecalling CRM + Auto Dialer + WhatsApp Automation + Banker Matching Engine designed specifically for loan DSAs, ASMs, and telecaller teams.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/30 transition-all duration-200">
                  Sign In to System
                  <ArrowRight size={18} />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800/80 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all duration-200">
                  Explore Specification
                  <ChevronRight size={18} />
                </a>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-6">
                <div>
                  <div className="text-xl font-bold text-white">1 Record</div>
                  <div className="text-xs text-slate-400">Calls + WhatsApp + Docs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-400">10 Outcomes</div>
                  <div className="text-xs text-slate-400">2-Sec Call Logging</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-sky-400">Banker Match</div>
                  <div className="text-xs text-slate-400">Automated Rules Engine</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative hidden lg:block">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3 LEVEL SYSTEM ARCHITECTURE ─── */}
      <section id="architecture" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
              System Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Designed For 3 Tier Operational Workflow
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Every level of your loan organization has a dedicated workspace designed specifically for their daily tasks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Level 1 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <BarChart2 size={24} />
              </div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Level 1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Super Admin & ASM Dashboard</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Full organizational oversight across leads, telecallers, DSAs, lenders, locations, and revenue conversion metrics.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Total, Today's & Assigned Leads</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Connected vs Interested Calls</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Login, Approval & Disbursement MIS</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Telecaller & Banker-wise Performance</li>
              </ul>
            </div>

            {/* Level 2 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-emerald-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <PhoneCall size={24} />
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Level 2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Telecaller Workspace</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Fast, focused one-lead-at-a-time calling queue with business financials, auto-dialer, and 2-second outcome logging.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-600" /> Customer Name, Turnover, Loan Req</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-600" /> 1-Click Auto Call Dialing</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-600" /> 10 Predefined Call Outcomes</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-600" /> 🎙️ Voice Remarks & Quick Remarks</li>
              </ul>
            </div>

            {/* Level 3 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-sky-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <MessageSquare size={24} />
              </div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-1">Level 3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Business API</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Official WhatsApp Business API integration triggering verified document checklist templates instantly when marked Interested.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-sky-600" /> Official Business API Integration</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-sky-600" /> Verified Pre-Approved Templates</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-sky-600" /> Automated Document Collection</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-sky-600" /> Integrated Timeline & Reply Tracking</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ONE CUSTOMER ONE RECORD FEATURE ─── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
                Core Feature
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                ONE CUSTOMER = ONE RECORD
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                No more switching between dialing apps, WhatsApp, spreadsheets, and emails. Everything related to a customer lives in a single, unified 360° record timeline.
              </p>
              <ul className="space-y-3 text-xs text-slate-200">
                {[
                  'Complete call history with duration and disposition logs',
                  'WhatsApp messages sent and customer responses attached',
                  'Voice notes stored and transcribed to text',
                  'Uploaded KYC, GST, and ITR documents in profile',
                  'Banker matching recommendations & sanction status',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <OneRecordPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── BANKER MATCHING ENGINE & LEAD FORM ─── */}
      <section id="banker-matching" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
              Automated Intelligence
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Banker Matching Engine & Business Loan Lead Schema
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Instantly match business profiles to the right banking partners based on internal eligibility rules.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Banker Engine */}
            <div className="bg-indigo-950 text-white rounded-2xl p-7 border border-indigo-900 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Landmark size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Banker Matching Engine</h3>
                  <p className="text-xs text-indigo-300">Configurable Lender Eligibility Criteria</p>
                </div>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
                  <div className="font-bold text-indigo-200 mb-1">Input Criteria:</div>
                  <div className="text-slate-300">Loan: ₹30L · Turnover: ₹1.5Cr · Vintage: 5 Yrs · GST: Yes · ITR: Yes · Location: Hubli</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200">
                    <span className="font-bold">Banker A (HDFC Bank)</span>
                    <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">High Probability</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-indigo-900/40 border border-indigo-800 rounded-xl text-indigo-200">
                    <span className="font-bold">Banker B (ICICI Bank)</span>
                    <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">Medium Probability</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300">
                    <span className="font-bold">NBFC C (Bajaj Finance)</span>
                    <span className="text-[10px] font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">Backup Option</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Form Schema */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Business Loan Lead Form Schema
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-indigo-600 mb-1">Customer Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Customer Name & Mobile</li>
                    <li>• Alternate Phone</li>
                    <li>• City, Location, Pincode</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-indigo-600 mb-1">Business Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Business Name & Type</li>
                    <li>• Vintage & Ownership</li>
                    <li>• GST / ITR / Banking Available</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-indigo-600 mb-1">Financial Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Monthly & Annual Turnover</li>
                    <li>• Existing Loans & EMI</li>
                    <li>• CIBIL Range & Loan Req.</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-indigo-600 mb-1">Loan Purpose & Source</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Working Capital / Expansion</li>
                    <li>• Machinery / BT</li>
                    <li>• Source: Telecaller, DSA, Digital</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9 STAGE LOAN PIPELINE ─── */}
      <section id="pipeline" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
              Funnel Management
            </div>
            <h2 className="text-3xl font-extrabold mb-4">9-Stage Business Loan Pipeline</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Track lead stage progression with complete visibility from initial contact to bank disbursement.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {pipelineStages.map((st, idx) => (
              <div key={st.name} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] font-bold text-slate-400 mb-1">0{idx + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg w-full ${st.color}`}>
                  {st.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER BANNER ─── */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to Deploy Shri Siddharoodha LoanConnect?
          </h2>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
            Access your secure role-based dashboard for Admin, ASM, and Telecallers.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-extrabold rounded-xl hover:bg-indigo-50 shadow-lg transition-all">
              Sign In To Portal
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
