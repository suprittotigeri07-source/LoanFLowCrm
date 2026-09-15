import React, { useState, useEffect } from 'react';
import {
  Users, Upload, UserPlus, PhoneCall, TrendingUp, CheckCircle2,
  AlertTriangle, Filter, Search, Download, ArrowRight, X, Clock,
  FileSpreadsheet, ShieldAlert, Check, ChevronRight, Eye
} from 'lucide-react';
import { api } from '../api';

export default function AdminPortal({ currentUser }) {
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & selection
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(''); // telecaller_id or 'round_robin'
  const [activeLeadDetail, setActiveLeadDetail] = useState(null);

  // CSV upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Notification message
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, assignedFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assigned_to = assignedFilter;
      if (searchQuery) params.search = searchQuery;

      const [mRes, lRes, tRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getLeads(params),
        api.getTelecallers(),
      ]);

      setMetrics(mRes);
      setLeads(lRes.results || lRes);
      setTelecallers(tRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget) {
      alert('Please select a telecaller or round-robin option.');
      return;
    }

    try {
      if (assignTarget === 'round_robin') {
        const callerIds = telecallers.map((t) => t.id);
        const res = await api.assignLeads(selectedLeadIds, null, callerIds);
        setMessage(res.message);
      } else {
        const res = await api.assignLeads(selectedLeadIds, assignTarget);
        setMessage(res.message);
      }

      setShowAssignModal(false);
      setSelectedLeadIds([]);
      setAssignTarget('');
      loadData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setUploadResult(null);
    try {
      const res = await api.uploadCsv(uploadFile);
      setUploadResult(res);
      loadData();
    } catch (err) {
      alert(err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleViewLeadDetail = async (id) => {
    try {
      const detail = await api.getLeadDetail(id);
      setActiveLeadDetail(detail);
    } catch (err) {
      alert('Failed to load lead details: ' + err.message);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "name,mobile,city,business_name,required_loan_amount,monthly_turnover,vintage,gst_available,loan_type\n" +
      "Vikramaditya Rao,9820998811,Mumbai,Rao Precision Motors,3000000,1200000,4.5,yes,Business Loan\n" +
      "Anjali Kulkarni,9821998822,Pune,Kulkarni Logistics,1800000,650000,3.0,yes,Working Capital\n" +
      "Manoj Bansal,9822998833,Nashik,Bansal Agro Processors,4500000,1800000,6.0,yes,Machinery\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_business_loan_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    const num = Number(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner Message */}
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

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {currentUser.role === 'ASM' ? 'ASM Regional Command Center' : 'Executive Business Loan CRM Dashboard'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Pipeline tracking, lead allocation, telecalling team oversight, and mobile deduplication.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Upload size={16} /> Upload CSV Leads
          </button>

          {selectedLeadIds.length > 0 && (
            <button
              onClick={() => setShowAssignModal(true)}
              style={{
                background: '#10b981',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <UserPlus size={16} /> Assign Selected ({selectedLeadIds.length})
            </button>
          )}
        </div>
      </div>

      {/* High-Level Operational Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL LEADS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            {metrics?.overview?.total_leads || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>UNASSIGNED LEADS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
            {metrics?.overview?.unassigned_leads || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>CALLS TODAY</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4', marginTop: 4 }}>
            {metrics?.overview?.calls_today || 0}
            <span style={{ fontSize: '0.85rem', color: '#10b981', marginLeft: 8 }}>
              ({metrics?.overview?.connected_today || 0} connected)
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>INTERESTED CONVERSIONS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {metrics?.overview?.interested_today || 0}
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Stages Bar */}
      {metrics?.pipeline_stages && (
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LOAN OPPORTUNITY PIPELINE FUNNEL
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
            {Object.entries(metrics.pipeline_stages).map(([stage, count]) => (
              <div
                key={stage}
                onClick={() => setStatusFilter(statusFilter === stage ? '' : stage)}
                style={{
                  background: statusFilter === stage ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                  border: statusFilter === stage ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: count > 0 ? '#f8fafc' : '#64748b' }}>
                  {count}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telecaller Performance Table */}
      <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>
          Telecaller Performance Overview
        </h3>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Telecaller</th>
                <th>Territory</th>
                <th>Assigned Leads</th>
                <th>Calls Today</th>
                <th>Connected</th>
                <th>Interested Leads</th>
                <th>Pending Follow-ups</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.telecaller_performance?.map((caller) => (
                <tr key={caller.id}>
                  <td>
                    <strong style={{ color: '#f8fafc' }}>{caller.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{caller.territory}</span>
                  </td>
                  <td>{caller.assigned_leads}</td>
                  <td>
                    <strong style={{ color: '#38bdf8' }}>{caller.calls_today}</strong>
                  </td>
                  <td>{caller.connected_today}</td>
                  <td>
                    <span className="badge badge-success">{caller.interested_leads}</span>
                  </td>
                  <td>
                    <span className={`badge ${caller.pending_followups > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                      {caller.pending_followups}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setAssignedFilter(assignedFilter === caller.id ? '' : caller.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: assignedFilter === caller.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: assignedFilter === caller.id ? '#fff' : '#cbd5e1',
                      }}
                    >
                      {assignedFilter === caller.id ? 'Showing Leads' : 'Filter Leads'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Management Section */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Lead Pipeline Management {leads.length > 0 && `(${leads.length} leads)`}
          </h3>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search business, owner, phone..."
              className="crm-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 240, padding: '8px 12px', fontSize: '0.85rem' }}
            />

            <select
              className="crm-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 170, padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="">All Pipeline Stages</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Eligibility Check">Eligibility Check</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Login">Login</option>
              <option value="Approval">Approval</option>
              <option value="Disbursement">Disbursement</option>
            </select>

            <select
              className="crm-input"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              style={{ width: 160, padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="">All Assignments</option>
              <option value="unassigned">Unassigned Only</option>
              {telecallers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                  />
                </th>
                <th>Business Name & City</th>
                <th>Owner & Mobile</th>
                <th>Required Loan</th>
                <th>Turnover / Vintage</th>
                <th>Stage</th>
                <th>Assigned Caller</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr key={lead.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleLead(lead.id)}
                        />
                      </td>
                      <td>
                        <strong style={{ color: '#f8fafc', display: 'block' }}>{lead.business_name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {lead.customer?.city || 'Location N/A'} • {lead.loan_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#f1f5f9' }}>{lead.customer?.name}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>+91 {lead.customer?.mobile}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>
                          {formatCurrency(lead.required_loan_amount)}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                          {formatCurrency(lead.monthly_turnover)}/mo
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {lead.vintage ? `${lead.vintage} yrs vintage` : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-warning">{lead.status}</span>
                      </td>
                      <td>
                        {lead.assigned_to ? (
                          <span className="badge badge-primary">{lead.assigned_to.name}</span>
                        ) : (
                          <span className="badge badge-danger">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewLeadDetail(lead.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Eye size={12} /> View 360°
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CSV LEAD UPLOAD */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: 16,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 580, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={18} color="#6366f1" /> CSV Lead Upload & Validation
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}>
              Upload leads from CSV. The system automatically validates fields, computes turn-over and loan requirements, and flags duplicate mobile numbers without creating duplicates.
            </p>

            <button
              onClick={downloadSampleCsv}
              style={{
                marginBottom: 16,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Download size={13} /> Download Sample Business Loan CSV Template
            </button>

            <form onSubmit={handleCsvUpload}>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                padding: '24px 16px',
                textAlign: 'center',
                marginBottom: 16,
                cursor: 'pointer',
              }}>
                <FileSpreadsheet size={32} color="#818cf8" style={{ margin: '0 auto 8px' }} />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  style={{ display: 'block', margin: '0 auto', fontSize: '0.85rem', color: '#cbd5e1' }}
                />
              </div>

              {uploadResult && (
                <div style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 16,
                  fontSize: '0.85rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Total Rows: <strong>{uploadResult.total_rows}</strong></span>
                    <span style={{ color: '#10b981' }}>Created: <strong>{uploadResult.created_count}</strong></span>
                    <span style={{ color: '#f59e0b' }}>Duplicates: <strong>{uploadResult.duplicate_count}</strong></span>
                  </div>

                  {uploadResult.duplicates_flagged?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.75rem', marginBottom: 4 }}>
                        Duplicate Mobiles Flagged (Prevented from Re-Creation):
                      </div>
                      <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                        {uploadResult.duplicates_flagged.map((dup, i) => (
                          <div key={i} style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                            Row {dup.row}: {dup.name} ({dup.mobile}) - {dup.business_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Processing & Validating CSV...' : 'Start Lead Import'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LEAD ASSIGNMENT */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: 16,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Assign {selectedLeadIds.length} Selected Leads
              </h3>
              <button onClick={() => setShowAssignModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}>
              Choose a specific telecaller or distribute leads equally in round-robin mode.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                ASSIGNMENT TARGET
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(30, 41, 59, 0.4)',
                  padding: 12,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: assignTarget === 'round_robin' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <input
                    type="radio"
                    name="target"
                    checked={assignTarget === 'round_robin'}
                    onChange={() => setAssignTarget('round_robin')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Round-Robin Distribution</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Distribute evenly across all {telecallers.length} active telecallers
                    </div>
                  </div>
                </label>

                {telecallers.map((t) => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(30, 41, 59, 0.4)',
                      padding: 12,
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: assignTarget === t.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <input
                      type="radio"
                      name="target"
                      checked={assignTarget === t.id}
                      onChange={() => setAssignTarget(t.id)}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Territory: {t.territory || 'General'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                Confirm Lead Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LEAD 360 DETAIL DRAWER */}
      {activeLeadDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: 16,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 720, maxHeight: '85vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: 6 }}>
                  Pipeline Stage: {activeLeadDetail.status}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeLeadDetail.business_name}</h2>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Customer: {activeLeadDetail.customer?.name} • +91 {activeLeadDetail.customer?.mobile} • {activeLeadDetail.customer?.city}
                </div>
              </div>
              <button onClick={() => setActiveLeadDetail(null)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Financial Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>REQUIRED LOAN</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  {formatCurrency(activeLeadDetail.required_loan_amount)}
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MONTHLY TURNOVER</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                  {formatCurrency(activeLeadDetail.monthly_turnover)}
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CIBIL SCORE RANGE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  {activeLeadDetail.cibil_range || 'Not Recorded'}
                </div>
              </div>
            </div>

            {/* Call History Timeline */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: '#cbd5e1' }}>
                Telecalling Call History ({activeLeadDetail.calls?.length || 0})
              </h4>
              {activeLeadDetail.calls?.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No calls logged for this lead yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeLeadDetail.calls.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{c.telecaller_name}</span>
                        <span className="badge badge-primary">{c.outcome}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(c.timestamp).toLocaleString()} • Duration: {c.duration}s
                      </div>
                      {c.remarks && (
                        <div style={{ marginTop: 4, color: '#cbd5e1', fontStyle: 'italic' }}>
                          "{c.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduled Follow-ups */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: '#cbd5e1' }}>
                Follow-ups Scheduled ({activeLeadDetail.follow_ups?.length || 0})
              </h4>
              {activeLeadDetail.follow_ups?.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No follow-ups recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeLeadDetail.follow_ups.map((fu) => (
                    <div
                      key={fu.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{fu.remarks || 'Scheduled Call'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                          Due: {new Date(fu.due_at).toLocaleString()} (Assigned: {fu.assigned_to_name})
                        </div>
                      </div>
                      <span className={`badge ${fu.completed ? 'badge-success' : 'badge-warning'}`}>
                        {fu.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
