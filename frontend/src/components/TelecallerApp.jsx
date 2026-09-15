import React, { useState, useEffect } from 'react';
import {
  Phone, PhoneCall, PhoneForwarded, Clock, CheckCircle2, AlertTriangle,
  Calendar, Building2, User, MapPin, IndianRupee, FileText, ArrowRight,
  TrendingUp, RefreshCw, Check, AlertCircle, ChevronRight
} from 'lucide-react';
import { api } from '../api';

const OUTCOMES = [
  { id: 'Interested', label: 'Interested', group: 'positive', color: '#10b981' },
  { id: 'Eligible – Send Documents', label: 'Eligible – Send Documents', group: 'positive', color: '#06b6d4' },
  { id: 'Loan Required – Documents Pending', label: 'Loan Required – Docs Pending', group: 'positive', color: '#6366f1' },
  { id: 'Call Later', label: 'Call Later (Schedule)', group: 'followup', color: '#f59e0b' },
  { id: 'Number Busy', label: 'Number Busy', group: 'followup', color: '#94a3b8' },
  { id: 'No Response', label: 'No Response', group: 'followup', color: '#94a3b8' },
  { id: 'Already Taken Loan', label: 'Already Taken Loan', group: 'negative', color: '#a855f7' },
  { id: 'Wrong Number', label: 'Wrong Number', group: 'negative', color: '#f43f5e' },
  { id: 'Not Eligible', label: 'Not Eligible', group: 'negative', color: '#f43f5e' },
  { id: 'Not Interested', label: 'Not Interested', group: 'negative', color: '#ef4444' },
];

export default function TelecallerApp({ currentUser }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'followups' | 'overdue'
  const [metrics, setMetrics] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [remainingCount, setRemainingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Call timer state
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Disposition form state
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpType, setFollowUpType] = useState(''); // 'today_eve' | 'tom_am' | 'tom_pm' | 'custom' | ''
  const [customFollowUpDate, setCustomFollowUpDate] = useState('');
  const [followUpRemarks, setFollowUpRemarks] = useState('');

  // Follow-ups lists
  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  // Call duration timer
  useEffect(() => {
    let interval = null;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, qRes, fuRes, odRes] = await Promise.all([
        api.getTelecallerMetrics(),
        api.getTelecallerQueue(true),
        api.getTodayFollowUps(),
        api.getOverdueFollowUps(),
      ]);

      setMetrics(mRes.metrics || {});
      setCurrentLead(qRes.lead);
      setRemainingCount(qRes.remaining_count || 0);
      setTodayFollowUps(fuRes.follow_ups || []);
      setOverdueFollowUps(odRes.overdue_follow_ups || []);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Error loading queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = () => {
    setIsCalling(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  const computeFollowUpDueAt = () => {
    const now = new Date();
    if (followUpType === 'today_eve') {
      const d = new Date();
      d.setHours(18, 0, 0, 0);
      return d.toISOString();
    } else if (followUpType === 'tom_am') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 30, 0, 0);
      return d.toISOString();
    } else if (followUpType === 'tom_pm') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(15, 30, 0, 0);
      return d.toISOString();
    } else if (followUpType === 'custom' && customFollowUpDate) {
      return new Date(customFollowUpDate).toISOString();
    }
    return null;
  };

  const handleSubmitDisposition = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOutcome) {
      alert('Please select a call outcome before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const fuDueAt = computeFollowUpDueAt();
      const payload = {
        lead_id: currentLead.id,
        duration: callDuration || 15,
        outcome: selectedOutcome,
        remarks: remarks,
        follow_up_due_at: fuDueAt,
        follow_up_remarks: followUpRemarks || (fuDueAt ? `Follow-up after ${selectedOutcome}` : ''),
      };

      const res = await api.submitDisposition(payload);

      // Reset disposition form
      setSelectedOutcome('');
      setRemarks('');
      setFollowUpType('');
      setCustomFollowUpDate('');
      setFollowUpRemarks('');
      setIsCalling(false);
      setCallDuration(0);

      setMessage(`Outcome "${res.new_status}" logged for ${currentLead.business_name}!`);
      setTimeout(() => setMessage(''), 4000);

      // Auto-advance to next lead
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to submit disposition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteFollowUp = async (id) => {
    try {
      await api.completeFollowUp(id);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to complete follow-up');
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    const num = Number(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading && !currentLead) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#818cf8' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px' }} />
          <p>Loading telecaller queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Header Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={14} /> CALLS TODAY
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: '#f8fafc' }}>
            {metrics?.calls_today || 0}
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginLeft: 8 }}>
              ({metrics?.connected_today || 0} connected)
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} /> QUEUE REMAINING
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: '#06b6d4' }}>
            {remainingCount} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>leads</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} /> DUE FOLLOW-UPS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>
            {todayFollowUps.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> OVERDUE
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: overdueFollowUps.length > 0 ? '#ef4444' : '#10b981' }}>
            {overdueFollowUps.length}
          </div>
        </div>
      </div>

      {/* Alert toast message */}
      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#6ee7b7',
          padding: '12px 18px',
          borderRadius: 10,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
        }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            background: activeTab === 'queue' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'queue' ? '#fff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <PhoneCall size={16} />
          <span>Live Dialing Queue</span>
          {remainingCount > 0 && (
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 10, fontSize: '0.75rem' }}>
              {remainingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            background: activeTab === 'followups' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'followups' ? '#fff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Clock size={16} />
          <span>Today's Follow-ups</span>
          {todayFollowUps.length > 0 && (
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 10, fontSize: '0.75rem' }}>
              {todayFollowUps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            background: activeTab === 'overdue' ? '#ef4444' : 'transparent',
            color: activeTab === 'overdue' ? '#fff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertTriangle size={16} />
          <span>Overdue Alerts</span>
          {overdueFollowUps.length > 0 && (
            <span style={{ background: '#7f1d1d', color: '#fca5a5', padding: '2px 6px', borderRadius: 10, fontSize: '0.75rem' }}>
              {overdueFollowUps.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ONE-LEAD-AT-A-TIME CALLING QUEUE */}
      {activeTab === 'queue' && (
        <div>
          {!currentLead ? (
            <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Queue Completed!</h2>
              <p style={{ color: '#94a3b8', maxWidth: 450, margin: '0 auto 20px' }}>
                You have reached out to all assigned leads for now. Check your scheduled follow-ups or ask the ASM/Admin to assign new leads.
              </p>
              <button
                onClick={loadDashboardData}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <RefreshCw size={16} /> Refresh Queue
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Left Column: Rich Lead Profile Card */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 6 }}>
                      {currentLead.loan_type || 'Business Loan'}
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                      {currentLead.business_name}
                    </h2>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Stage: {currentLead.status}
                  </span>
                </div>

                {/* Big Glowing Required Loan Highlight */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '16px 20px',
                  borderRadius: 12,
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.05em' }}>
                      REQUIRED LOAN AMOUNT
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                      {formatCurrency(currentLead.required_loan_amount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lead Source</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{currentLead.lead_source}</div>
                  </div>
                </div>

                {/* Key Business Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={13} /> PROPRIETOR / OWNER
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4, color: '#f1f5f9' }}>
                      {currentLead.customer?.name}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> LOCATION
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4, color: '#f1f5f9' }}>
                      {currentLead.customer?.city || 'N/A'} {currentLead.customer?.pincode ? `(${currentLead.customer.pincode})` : ''}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={13} /> BUSINESS VINTAGE
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4, color: '#f1f5f9' }}>
                      {currentLead.vintage ? `${currentLead.vintage} Years` : 'Not specified'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>MONTHLY TURNOVER</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4, color: '#38bdf8' }}>
                      {formatCurrency(currentLead.monthly_turnover)}
                    </div>
                  </div>
                </div>

                {/* Financial Health Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  <span className={`badge ${currentLead.gst_available ? 'badge-success' : 'badge-neutral'}`}>
                    GST: {currentLead.gst_available ? 'Verified' : 'No'}
                  </span>
                  <span className={`badge ${currentLead.itr_available ? 'badge-success' : 'badge-neutral'}`}>
                    ITR: {currentLead.itr_available ? 'Available' : 'No'}
                  </span>
                  <span className={`badge ${currentLead.banking_available ? 'badge-success' : 'badge-neutral'}`}>
                    Banking: {currentLead.banking_available ? '12M Ready' : 'No'}
                  </span>
                  {currentLead.cibil_range && (
                    <span className="badge badge-warning">
                      CIBIL: {currentLead.cibil_range}
                    </span>
                  )}
                </div>

                {/* DIALER CALL ACTION */}
                <div style={{
                  background: isCalling ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isCalling ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: 18,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                    Customer Contact Phone
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em', marginBottom: 14 }}>
                    +91 {currentLead.customer?.mobile}
                  </div>

                  {!isCalling ? (
                    <a
                      href={`tel:+91${currentLead.customer?.mobile}`}
                      onClick={handleStartCall}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                        textDecoration: 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <PhoneCall size={20} />
                      <span>CLICK TO CALL (TEL DIALER)</span>
                    </a>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', fontWeight: 700 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulseAlert 1s infinite' }} />
                        <span>Call In Progress — Duration: {formatSeconds(callDuration)}</span>
                      </div>
                      <button
                        onClick={handleEndCall}
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          padding: '12px 20px',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                        }}
                      >
                        Hang Up Call & Fill Disposition
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Post-Call Disposition Form */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Log Call Outcome</h3>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    Call Duration: <strong style={{ color: '#38bdf8' }}>{formatSeconds(callDuration)}</strong>
                  </span>
                </div>

                <form onSubmit={handleSubmitDisposition}>
                  {/* The 10 Call Outcomes */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                      SELECT DISPOSITION OUTCOME (1 of 10) *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {OUTCOMES.map((out) => {
                        const isSelected = selectedOutcome === out.id;
                        return (
                          <button
                            type="button"
                            key={out.id}
                            onClick={() => {
                              setSelectedOutcome(out.id);
                              if (out.id === 'Call Later' && !followUpType) {
                                setFollowUpType('tom_am');
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 8,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isSelected ? out.color : 'rgba(30, 41, 59, 0.6)',
                              color: isSelected ? '#fff' : '#cbd5e1',
                              border: isSelected ? `2px solid ${out.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                              transition: 'all 0.15s ease',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{out.label}</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Follow-up Section (activated if Call Later or user chooses) */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={15} /> Schedule Automated Follow-up Reminder
                      </span>
                      {selectedOutcome === 'Call Later' && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Recommended</span>
                      )}
                    </div>

                    {/* Quick Follow-up Chips */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                      {[
                        { id: 'today_eve', label: 'Today 6 PM' },
                        { id: 'tom_am', label: 'Tomorrow 10:30 AM' },
                        { id: 'tom_pm', label: 'Tomorrow 3:30 PM' },
                        { id: 'custom', label: 'Custom Date' },
                      ].map((chip) => (
                        <button
                          type="button"
                          key={chip.id}
                          onClick={() => setFollowUpType(followUpType === chip.id ? '' : chip.id)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: followUpType === chip.id ? '#f59e0b' : 'rgba(15, 23, 42, 0.7)',
                            color: followUpType === chip.id ? '#000' : '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            textAlign: 'center',
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {followUpType === 'custom' && (
                      <div style={{ marginBottom: 10 }}>
                        <input
                          type="datetime-local"
                          className="crm-input"
                          value={customFollowUpDate}
                          onChange={(e) => setCustomFollowUpDate(e.target.value)}
                        />
                      </div>
                    )}

                    {followUpType && (
                      <input
                        type="text"
                        className="crm-input"
                        placeholder="Follow-up note (e.g. Ask for last 6 months GST return)"
                        value={followUpRemarks}
                        onChange={(e) => setFollowUpRemarks(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      />
                    )}
                  </div>

                  {/* Remarks Field */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                      CALL REMARKS / CLIENT FEEDBACK
                    </label>
                    <textarea
                      className="crm-input"
                      rows={3}
                      placeholder="e.g., Customer willing to take ₹20 Lakhs if interest rate is below 15% p.a. Needs callback after accountant consult."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  {/* Submit & Auto-Advance Button */}
                  <button
                    type="submit"
                    disabled={submitting || !selectedOutcome}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: 10,
                      background: !selectedOutcome ? '#334155' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: !selectedOutcome ? '#94a3b8' : '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      cursor: !selectedOutcome ? 'not-allowed' : 'pointer',
                      boxShadow: selectedOutcome ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        <span>Saving Disposition...</span>
                      </>
                    ) : (
                      <>
                        <span>SAVE DISPOSITION & NEXT LEAD</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TODAY'S DUE FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Today's Due Follow-ups</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Sorted chronologically by scheduled callback time.
              </p>
            </div>
            <button onClick={loadDashboardData} className="badge badge-neutral" style={{ padding: '6px 12px' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {todayFollowUps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <p>No follow-ups due today. You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{fu.lead_business_name}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({fu.customer_name})</span>
                      <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                        <Clock size={11} /> {new Date(fu.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      "{fu.remarks || 'No remarks added'}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a
                      href={`tel:+91${fu.customer_mobile}`}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none',
                      }}
                    >
                      <PhoneCall size={14} /> Call Now
                    </a>
                    <button
                      onClick={() => handleCompleteFollowUp(fu.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#f8fafc',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Check size={14} /> Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OVERDUE ALERTS */}
      {activeTab === 'overdue' && (
        <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} /> Overdue Follow-ups Alert
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Callbacks that were scheduled in the past but have not been completed yet.
              </p>
            </div>
          </div>

          {overdueFollowUps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#10b981' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
              <p>Zero overdue follow-ups! Great discipline.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {overdueFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{fu.lead_business_name}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({fu.customer_name})</span>
                      <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                        Overdue since {new Date(fu.due_at).toLocaleDateString()} {new Date(fu.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                      "{fu.remarks || 'No remarks recorded'}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a
                      href={`tel:+91${fu.customer_mobile}`}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none',
                      }}
                    >
                      <PhoneCall size={14} /> Call Now
                    </a>
                    <button
                      onClick={() => handleCompleteFollowUp(fu.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#f8fafc',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Check size={14} /> Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
