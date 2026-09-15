import React, { useState, useEffect } from 'react';
import {
  Plus, Users, Search, Download, Upload, FileSpreadsheet, RefreshCw, Key,
  Mail, CheckCircle, AlertTriangle, XCircle, Trash2, Power, Eye, X, Lock, Shield
} from 'lucide-react';
import { api } from '../../api';

export default function AdminTelecallersPage() {
  const [telecallers, setTelecallers] = useState([]);
  const [asms, setAsms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State for Manual Create
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    employee_id: '',
    email: '',
    branch: '',
    asm: '',
    password: '',
    confirm_password: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Reset State
  const [resetPassData, setResetPassData] = useState({ new_password: '', confirm_password: '' });
  const [isResetting, setIsResetting] = useState(false);

  // Excel Bulk Import State
  const [importFile, setImportFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tcData, asmData] = await Promise.all([
        api.getTelecallers(),
        api.getAsms(),
      ]);
      setTelecallers(Array.isArray(tcData) ? tcData : (tcData?.results || []));
      setAsms(Array.isArray(asmData) ? asmData : (asmData?.results || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch telecallers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Telecallers
  const filteredTelecallers = telecallers.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.employee_id && t.employee_id.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.branch && t.branch.toLowerCase().includes(q));
    const matchesStatus = !statusFilter || (statusFilter === 'Active' ? t.is_active : !t.is_active);
    return matchesSearch && matchesStatus;
  });

  // Manual Creation Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.employee_id || !formData.email || !formData.password) {
      showToast('Please fill all mandatory fields (*)', 'error');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        role: 'TELECALLER',
        asm: formData.asm ? formData.asm : null,
      };
      const res = await api.createTelecaller(payload);
      showToast(res.message || 'Telecaller created successfully!');
      setIsAddModalOpen(false);
      setFormData({
        name: '', mobile: '', employee_id: '', email: '', branch: '', asm: '', password: '', confirm_password: '', is_active: true
      });
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel Preview Validation
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setIsValidating(true);
    setPreviewData(null);
    setImportResult(null);

    try {
      const data = await api.previewExcelUserImport(file, 'TELECALLER');
      setPreviewData(data);
    } catch (err) {
      showToast(`Validation failed: ${err.message}`, 'error');
      setImportFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Execute Excel Import
  const handleExecuteImport = async () => {
    if (!previewData || !previewData.rows) return;
    setIsImporting(true);
    try {
      const res = await api.importExcelUsers(previewData.rows, 'TELECALLER');
      setImportResult(res);
      showToast(res.message || 'Import complete!');
      fetchUsers();
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Error Report
  const handleDownloadErrorReport = () => {
    if (!importResult || !importResult.error_reports) return;
    let content = "Row Number,Employee ID,Reason\n";
    importResult.error_reports.forEach(r => {
      content += `Row ${r.row_number},"${r.employee_id || ''}","${r.reason}"\n`;
    });

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Import_Error_Report.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // User Actions
  const handleToggleStatus = async (user) => {
    try {
      await api.toggleUserStatus(user.id);
      showToast(`Status updated for ${user.name}`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResendCredentials = async (user) => {
    try {
      await api.resendCredentials(user.id);
      showToast(`Credentials email sent to ${user.email}`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPassData.new_password || resetPassData.new_password !== resetPassData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsResetting(true);
    try {
      await api.resetPassword(selectedUser.id, resetPassData.new_password, resetPassData.confirm_password);
      showToast(`Password reset successfully for ${selectedUser.name}`);
      setIsResetPassModalOpen(false);
      setResetPassData({ new_password: '', confirm_password: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? Historical CRM records will be preserved.`)) return;
    try {
      await api.deleteUser(user.id);
      showToast(`Telecaller ${user.name} deleted.`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-xs bg-white/20 px-2 py-0.5 rounded">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telecallers Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage calling team, create accounts manually, or bulk upload via Excel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setImportFile(null);
              setPreviewData(null);
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <FileSpreadsheet size={16} /> Import from Excel
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus size={16} /> Add Telecaller
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      {telecallers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, email, mobile..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* TELECALLERS TABLE / EMPTY STATE */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-600" />
          Loading telecallers...
        </div>
      ) : telecallers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Telecallers Yet</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your LoanFlow CRM setup is clean. Add your first telecaller manually using the form or import multiple telecallers using an Excel template.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              + Add Telecaller
            </button>
            <button
              onClick={() => {
                setImportFile(null);
                setPreviewData(null);
                setImportResult(null);
                setIsImportModalOpen(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <FileSpreadsheet size={16} /> Import from Excel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Telecaller Name</th>
                  <th className="p-4 font-bold">Employee ID</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Mobile</th>
                  <th className="p-4 font-bold">Reporting ASM</th>
                  <th className="p-4 font-bold">Branch</th>
                  <th className="p-4 font-bold">Email Status</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTelecallers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{t.name}</td>
                    <td className="p-4 text-xs font-mono font-bold text-indigo-600">{t.employee_id || '—'}</td>
                    <td className="p-4 text-gray-600">{t.email}</td>
                    <td className="p-4 text-gray-600">{t.mobile || '—'}</td>
                    <td className="p-4 text-gray-700 font-medium">{t.asm_name ? `${t.asm_name} (${t.asm_employee_id || ''})` : 'Unassigned'}</td>
                    <td className="p-4 text-gray-600">{t.branch || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.credentials_email_status === 'Credentials Sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.credentials_email_status === 'Email Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t.credentials_email_status || 'Not Sent'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleResendCredentials(t)}
                        title="Resend Email Credentials"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(t);
                          setIsResetPassModalOpen(true);
                        }}
                        title="Reset Password"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(t)}
                        title={t.is_active ? 'Deactivate Account' : 'Activate Account'}
                        className={`p-1.5 rounded-lg ${t.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(t)}
                        title="Delete Telecaller"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPTION 1: MANUAL CREATE TELECALLER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Create New Telecaller</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. TC-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. telecaller@crm.local"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Branch / Location</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reporting Manager / ASM</label>
                  <select
                    value={formData.asm}
                    onChange={e => setFormData({ ...formData, asm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {asms.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.employee_id || 'ASM'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">LOGIN CREDENTIALS</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      min={6}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">System Role</label>
                  <input
                    type="text"
                    disabled
                    value="TELECALLER"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Telecaller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPTION 2: EXCEL BULK UPLOAD MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={20} />
                <h3 className="font-bold text-gray-900 text-lg">Import Telecallers from Excel</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Step 1: Template Download */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Download Blank Excel Template</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">Contains column headers only without demo data.</p>
                </div>
                <button
                  onClick={() => api.downloadUserTemplate('TELECALLER')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto"
                >
                  <Download size={15} /> Download Excel Template
                </button>
              </div>

              {/* Step 2: File Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Upload Telecallers Excel (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-sm focus:outline-none hover:border-emerald-500 transition-colors"
                />
              </div>

              {/* Loading Indicator */}
              {isValidating && (
                <div className="p-6 text-center text-gray-500">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
                  Validating Excel file and checking database duplicate records...
                </div>
              )}

              {/* Step 3: Validation Preview Table */}
              {previewData && !isValidating && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">Validation Preview Table</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">Valid: {previewData.valid_count}</span>
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full">Duplicates: {previewData.duplicate_count}</span>
                      <span className="text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-full">Errors: {previewData.error_count}</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="p-2.5 font-bold">Row</th>
                          <th className="p-2.5 font-bold">Name</th>
                          <th className="p-2.5 font-bold">Employee ID</th>
                          <th className="p-2.5 font-bold">Email</th>
                          <th className="p-2.5 font-bold">Mobile</th>
                          <th className="p-2.5 font-bold">ASM</th>
                          <th className="p-2.5 font-bold">Validation</th>
                          <th className="p-2.5 font-bold">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.rows.map(r => (
                          <tr key={r.row_number} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold">{r.row_number}</td>
                            <td className="p-2.5">{r.name || '—'}</td>
                            <td className="p-2.5 font-mono">{r.employee_id || '—'}</td>
                            <td className="p-2.5">{r.email || '—'}</td>
                            <td className="p-2.5">{r.mobile || '—'}</td>
                            <td className="p-2.5">{r.asm_name ? `${r.asm_name} (${r.asm_employee_id})` : (r.asm_employee_id || 'Unassigned')}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                r.validation_status === 'VALID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.validation_status === 'DUPLICATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {r.validation_status}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-500 max-w-xs truncate" title={r.error_message}>{r.error_message || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 4: Import Summary */}
              {importResult && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">Import Summary</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <div className="text-xs font-bold text-emerald-800">Successfully Created</div>
                      <div className="text-xl font-bold text-emerald-900 mt-1">{importResult.successfully_created}</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-xl">
                      <div className="text-xs font-bold text-red-800">Failed</div>
                      <div className="text-xl font-bold text-red-900 mt-1">{importResult.failed}</div>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <div className="text-xs font-bold text-amber-800">Skipped</div>
                      <div className="text-xl font-bold text-amber-900 mt-1">{importResult.skipped}</div>
                    </div>
                  </div>

                  {importResult.error_reports && importResult.error_reports.length > 0 && (
                    <button
                      onClick={handleDownloadErrorReport}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      <Download size={14} /> Download Error Report
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100"
              >
                Close
              </button>
              {previewData && previewData.valid_count > 0 && !importResult && (
                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isImporting ? 'Importing...' : `Import ${previewData.valid_count} Valid Users`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-base">Reset Password for {selectedUser.name}</h3>
              <button onClick={() => setIsResetPassModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  min={6}
                  value={resetPassData.new_password}
                  onChange={e => setResetPassData({ ...resetPassData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={resetPassData.confirm_password}
                  onChange={e => setResetPassData({ ...resetPassData, confirm_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
