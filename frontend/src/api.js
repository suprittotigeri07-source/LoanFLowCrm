// API client helper for Business Loan Telecalling CRM

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('crm_access_token');
export const setAuthTokens = (access, refresh, user) => {
  localStorage.setItem('crm_access_token', access);
  if (refresh) localStorage.setItem('crm_refresh_token', refresh);
  if (user) localStorage.setItem('crm_user', JSON.stringify(user));
};
export const getStoredUser = () => {
  const data = localStorage.getItem('crm_user');
  return data ? JSON.parse(data) : null;
};
export const clearAuth = () => {
  localStorage.removeItem('crm_access_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_user');
};

async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    clearAuth();
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  if (options.isBlob) {
    if (!response.ok) throw new Error('Failed to download file');
    return await response.blob();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let errorMsg = 'Request failed';
    if (typeof data === 'object' && data !== null) {
      if (data.error) errorMsg = data.error;
      else if (data.detail) errorMsg = data.detail;
      else errorMsg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: async (employeeId, password) => {
    const res = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId, password }),
    });
    setAuthTokens(res.access, res.refresh, res.user);
    return res;
  },

  getCurrentUser: () => apiFetch('/auth/me/'),

  // Users Management
  getAsms: () => apiFetch('/users/asms/'),
  getTelecallers: () => apiFetch('/users/telecallers/'),
  createAsm: (data) =>
    apiFetch('/users/create-asm/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createTelecaller: (data) =>
    apiFetch('/users/create-telecaller/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resendCredentials: (userId, password) =>
    apiFetch(`/users/${userId}/resend-credentials/`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  resetPassword: (userId, newPassword, confirmPassword) =>
    apiFetch(`/users/${userId}/reset-password/`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
    }),
  toggleUserStatus: (userId) =>
    apiFetch(`/users/${userId}/toggle-status/`, {
      method: 'PATCH',
    }),
  deleteUser: (userId) =>
    apiFetch(`/users/${userId}/delete/`, {
      method: 'DELETE',
    }),
  restoreUser: (userId) =>
    apiFetch(`/users/${userId}/restore/`, {
      method: 'POST',
    }),

  // Excel Bulk User Operations
  downloadUserTemplate: async (role = 'TELECALLER') => {
    const blob = await apiFetch(`/users/excel-template/?role=${role}`, { isBlob: true });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${role === 'ASM' ? 'ASM' : 'Telecaller'}_Template.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  previewExcelUserImport: (file, role = 'TELECALLER') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    return apiFetch('/users/import-excel-preview/', {
      method: 'POST',
      body: formData,
    });
  },
  importExcelUsers: (rows, role = 'TELECALLER') =>
    apiFetch('/users/import-excel/', {
      method: 'POST',
      body: JSON.stringify({ rows, role }),
    }),

  // Leads
  getLeads: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/leads/${query ? `?${query}` : ''}`);
  },
  getLeadDetail: (id) => apiFetch(`/leads/${id}/`),
  getTelecallerQueue: (single = false) => apiFetch(`/leads/telecaller-queue/?single=${single}`),

  // CSV Upload & Lead Assignment
  uploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/leads/upload-csv/', {
      method: 'POST',
      body: formData,
    });
  },
  assignLeads: (leadIds, telecallerId, telecallerIds = []) =>
    apiFetch('/leads/assign/', {
      method: 'POST',
      body: JSON.stringify({
        lead_ids: leadIds,
        telecaller_id: telecallerId,
        telecaller_ids: telecallerIds,
      }),
    }),

  // Telephony & Follow-ups
  submitDisposition: (data) =>
    apiFetch('/calls/disposition/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTodayFollowUps: () => apiFetch('/follow-ups/today/'),
  getOverdueFollowUps: () => apiFetch('/follow-ups/overdue/'),
  completeFollowUp: (id) =>
    apiFetch(`/follow-ups/${id}/complete/`, {
      method: 'PATCH',
    }),

  // Analytics
  getTelecallerMetrics: () => apiFetch('/analytics/telecaller/'),
  getAdminMetrics: () => apiFetch('/analytics/admin/'),
};
