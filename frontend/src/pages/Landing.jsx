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
    <div className="relative bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden w-full max-w-lg mx-auto">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-indigo-100 ml-2 font-semibold tracking-wide">
            Siddharoodha LoanConnect — Manager MIS
          </span>
        </div>
        <span className="text-[10px] font-bold text-indigo-900 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
          Live Status
        </span>
      </div>

      <div className="p-5 space-y-4 bg-white">
        {/* Today MIS stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total Leads', value: '250', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { label: 'Calls Today', value: '218', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Connected', value: '146', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Interested', value: '42', color: 'bg-violet-50 text-violet-700 border-violet-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-2.5 border ${s.color}`}>
              <div className="text-base font-bold">{s.value}</div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Funnel summary row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Docs Pending', value: '18', badge: 'bg-amber-100 text-amber-800' },
            { label: 'Bank Login', value: '12', badge: 'bg-violet-100 text-violet-800' },
            { label: 'Approval', value: '6', badge: 'bg-sky-100 text-sky-800' },
            { label: 'Disbursed', value: '3', badge: 'bg-emerald-100 text-emerald-800' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-2 text-center border border-indigo-50">
              <div className="text-xs font-bold text-slate-800">{s.value}</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Telecaller activity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Telecaller Workload & Progress</span>
            <span className="text-[10px] text-indigo-600 font-medium">Daily Target: 60 Calls</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Priya Verma', calls: 65, conn: 42, int: 14, login: 4 },
              { name: 'Asha Sharma', calls: 58, conn: 37, int: 11, login: 3 },
              { name: 'Kavya Nair', calls: 72, conn: 45, int: 13, login: 4 },
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <span className="font-semibold text-slate-800">{t.name}</span>
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-slate-500">📞 {t.calls}</span>
                  <span className="text-purple-700 font-bold">✨ {t.int} Int</span>
                  <span className="text-indigo-700 font-bold">🏦 {t.login} Login</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banker match notification */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-100">
              <Landmark size={14} />
              Banker Matching Recommendation
            </div>
            <span className="text-[9px] bg-white text-indigo-900 font-bold px-2 py-0.5 rounded-full shadow-sm">High Eligibility</span>
          </div>
          <p className="text-[11px] text-indigo-100 leading-snug">
            Rajesh Kumar (Hardware · ₹1.20Cr Turnover) matched with <strong className="text-white">Banker A & NBFC B</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── One Customer One Record Timeline Preview ─────────────────────────────────
function OneRecordPreview() {
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">Rajesh Kumar</h4>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">🔥 Hot Lead</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Sharma Traders · Hardware · Turnover: ₹1.20 Cr · Required: ₹25L</p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
          Telecaller: Priya
        </span>
      </div>

      {/* Unified Timeline */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Single Unified Activity Record</div>

        {[
          { icon: PhoneCall, color: 'text-blue-600 bg-blue-50 border-blue-100', title: 'First Telecall Connected', time: '01-Sep 10:15 AM', detail: 'Duration: 3 min · Outcome: Interested · Requirement: ₹25 Lakhs' },
          { icon: MessageSquare, color: 'text-purple-600 bg-purple-50 border-purple-100', title: 'WhatsApp Business API Template Sent', time: '01-Sep 10:18 AM', detail: 'Sent Document Checklist via Official WhatsApp Business API' },
          { icon: Mic, color: 'text-violet-600 bg-violet-50 border-violet-100', title: '🎙️ Telecaller Voice Note', time: '01-Sep 10:20 AM', detail: '"5-year business vintage, GST & 2 years ITR available. Follow up tomorrow 11 AM."' },
          { icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', title: 'KYC & GST Documents Received', time: '02-Sep 02:30 PM', detail: 'ITR (2 yrs), GST 12M, Bank Statement 12M' },
          { icon: Landmark, color: 'text-sky-600 bg-sky-50 border-sky-100', title: 'Lender Case Logged', time: '02-Sep 04:00 PM', detail: 'Submitted to HDFC Bank (Bank Login Stage)' },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-3 text-xs">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
              <item.icon size={14} />
            </div>
            <div className="flex-1 bg-slate-50/70 rounded-xl p-2.5 border border-indigo-50">
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
  const pipelineStages = [
    { name: 'NEW LEAD', color: 'bg-slate-100 text-slate-700' },
    { name: 'CONTACTED', color: 'bg-blue-100 text-blue-700' },
    { name: 'INTERESTED', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'ELIGIBILITY CHECK', color: 'bg-sky-100 text-sky-800' },
    { name: 'DOCUMENTS PENDING', color: 'bg-amber-100 text-amber-800' },
    { name: 'LOGIN', color: 'bg-violet-100 text-violet-800' },
    { name: 'CREDIT / PD', color: 'bg-pink-100 text-pink-800' },
    { name: 'APPROVAL', color: 'bg-purple-100 text-purple-800' },
    { name: 'DISBURSEMENT', color: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold' },
  ]

  return (
    <div className="overflow-x-hidden font-sans bg-white text-slate-800">

      {/* ─── HERO ─── */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/50 pt-24 pb-20 relative border-b border-indigo-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100/80 border border-indigo-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <Sparkles size={14} className="text-violet-600" />
                <span className="text-xs font-bold text-indigo-900 tracking-wide">
                  SHRI SIDDHAROODHA BUSINESS LOAN CRM (Siddharoodha LoanConnect)
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                Business Loan Telecalling <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">
                  Built For Calling Teams
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                A simple, fast telecalling CRM with 1-click auto dialer, 2-second call logging, WhatsApp Business API templates, and automated banker matching.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200">
                  Sign In to CRM Portal
                  <ArrowRight size={18} />
                </Link>
                <a href="#architecture" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50/50 shadow-sm transition-all duration-200">
                  View System Design
                  <ChevronRight size={18} />
                </a>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 border-t border-indigo-100 pt-6">
                <div>
                  <div className="text-xl font-bold text-indigo-900">1 Customer</div>
                  <div className="text-xs text-slate-500">1 Unified History Record</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-violet-700">10 Outcomes</div>
                  <div className="text-xs text-slate-500">2-Second Call Log</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-700">Banker Engine</div>
                  <div className="text-xs text-slate-500">Lender Rule Matching</div>
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
            <div className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 border border-indigo-100">
              System Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Designed For Your 3-Level Team Structure
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Super Admin, Area Sales Managers (ASMs), and Telecallers each get a clean, role-focused workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Level 1 */}
            <div className="bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl p-7 border border-indigo-100 hover:border-violet-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <BarChart2 size={24} />
              </div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">Level 1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Admin & ASM Dashboard</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Full visibility across total leads, daily calls, connected leads, interested leads, documents pending, logins, approvals, and disbursements.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Total, Today's & Assigned Leads</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Calls Made, Connected & Interested</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Bank Login, Approval & Disbursement MIS</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-600" /> Telecaller & Banker-wise Reports</li>
              </ul>
            </div>

            {/* Level 2 */}
            <div className="bg-gradient-to-b from-purple-50/50 to-white rounded-2xl p-7 border border-purple-100 hover:border-purple-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <PhoneCall size={24} />
              </div>
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Level 2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Telecaller App Workspace</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                One lead on screen at a time with customer turnover, loan requirement, big 📞 CALL NOW button, and 10 outcome buttons for quick logging.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-600" /> Customer Name, Business, Turnover</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-600" /> Big 📞 CALL NOW Auto-Dialer</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-600" /> 10 Quick Call Outcome Buttons</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-600" /> 🎙️ Voice Remark Recording</li>
              </ul>
            </div>

            {/* Level 3 */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-7 border border-blue-100 hover:border-blue-300 transition-all shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center mb-5 shadow-md">
                <MessageSquare size={24} />
              </div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Level 3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Business API</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                When telecaller selects INTERESTED, system automatically shows verified WhatsApp template with loan amount, quick processing notes, and document checklist.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Verified WhatsApp Business API setup</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Pre-Approved Business Templates</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Auto Document Checklist Request</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Customer Response Linked to History</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ONE CUSTOMER ONE RECORD FEATURE ─── */}
      <section className="py-20 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-white border-y border-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
                Core Requirement
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                ONE CUSTOMER = ONE RECORD
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Your telecallers don't need to check WhatsApp on phone and CRM on desktop separately. When you open a customer profile, you see full complete history in one place.
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                {[
                  'Call history with duration, call time, and disposition outcome',
                  'WhatsApp messages sent & customer replies attached',
                  '🎙️ Voice remarks stored and transcribed',
                  'Uploaded documents (GST, ITR, Bank Statements)',
                  'Follow-up schedule & assigned telecaller info',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                    <CheckCircle size={16} className="text-violet-600 shrink-0" />
                    <span className="font-medium text-slate-800">{feat}</span>
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
            <div className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 border border-indigo-100">
              Smart Workflow
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Banker Matching Engine & Business Loan Lead Form
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Instead of telecallers guessing where to send a lead, the system recommends lender options based on your internal rules.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Banker Engine */}
            <div className="bg-gradient-to-br from-violet-700 to-indigo-700 text-white rounded-2xl p-7 border border-indigo-600 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Landmark size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Banker Matching Engine</h3>
                  <p className="text-xs text-indigo-200">Recommends Lenders Based On Internal Eligibility Rules</p>
                </div>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                  <div className="font-bold text-indigo-100 mb-1">Lead Details Entered:</div>
                  <div className="text-indigo-100">Loan Req: ₹30L · Turnover: ₹1.5Cr · Vintage: 5 Yrs · GST: Yes · ITR: Yes · Location: Hubli</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white text-indigo-950 rounded-xl shadow-sm">
                    <span className="font-bold">Banker A (HDFC Bank)</span>
                    <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">High Probability</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-indigo-800/80 border border-indigo-500/50 rounded-xl text-white">
                    <span className="font-bold">Banker B (ICICI Bank)</span>
                    <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">Medium Probability</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-indigo-900/60 border border-indigo-700/50 rounded-xl text-indigo-200">
                    <span className="font-bold">NBFC C (Bajaj Finance)</span>
                    <span className="text-[10px] font-bold bg-indigo-700 text-indigo-100 px-2 py-0.5 rounded-full">Backup Option</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Form Schema */}
            <div className="bg-slate-50/70 rounded-2xl p-7 border border-indigo-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-violet-600" />
                Business Loan Lead Form Fields
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="font-bold text-violet-700 mb-1">Customer Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Customer Name & Mobile</li>
                    <li>• Alternate Number</li>
                    <li>• City, Location, Pincode</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="font-bold text-violet-700 mb-1">Business Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Business Name & Type</li>
                    <li>• Business Vintage</li>
                    <li>• GST / ITR / Banking Status</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="font-bold text-violet-700 mb-1">Financial Details</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Monthly & Annual Turnover</li>
                    <li>• Existing Loans & EMI</li>
                    <li>• CIBIL Range & Loan Amount</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="font-bold text-violet-700 mb-1">Loan Requirement</div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li>• Working Capital / Expansion</li>
                    <li>• Machinery / Balance Transfer</li>
                    <li>• Source: Telecaller, DSA, Digital</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9 STAGE LOAN PIPELINE ─── */}
      <section id="pipeline" className="py-20 bg-white border-t border-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-bold text-violet-700 bg-violet-50 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 border border-violet-100">
              Loan Funnel
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">9-Stage Loan Pipeline</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Track every lead from initial phone call to bank sanction and final disbursement.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {pipelineStages.map((st, idx) => (
              <div key={st.name} className="flex flex-col items-center text-center p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 shadow-sm">
                <span className="text-[10px] font-bold text-indigo-600 mb-1">0{idx + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg w-full ${st.color}`}>
                  {st.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER BANNER ─── */}
      <section className="py-16 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-extrabold mb-4">
            Shri Siddharoodha LoanConnect Portal
          </h2>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
            Sign in using your assigned Employee ID or Email address.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-900 font-extrabold rounded-xl hover:bg-indigo-50 shadow-lg transition-all">
              Sign In To Portal
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
