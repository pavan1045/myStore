import { getAuthHeaders, API_BASE_URL } from '../utils/api';

const API_BASE = API_BASE_URL;

const handleResponseError = async (res) => {
  let errorMessage = 'Request failed';
  try {
    const data = await res.json();
    errorMessage = data.error || errorMessage;
  } catch (e) {
    // ignore json parse error
  }
  if (res.status === 401 || errorMessage.toLowerCase().includes('token')) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
      window.location.href = '/login';
    }
  }
  throw new Error(errorMessage);
};

export const supplierService = {
  // Suppliers
  async getSuppliers() {
    const res = await fetch(`${API_BASE}/suppliers`, { headers: getAuthHeaders() });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async addSupplier(supplierData) {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async updateSupplier(id, supplierData) {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async deleteSupplier(id) {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  // Bills
  async getBills(filters = {}) {
    const params = new URLSearchParams();
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/supplier-bills${queryString}`, { headers: getAuthHeaders() });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async getBillDetail(id) {
    const res = await fetch(`${API_BASE}/supplier-bills/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async addBill(billData) {
    const res = await fetch(`${API_BASE}/supplier-bills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(billData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async updateBill(id, billData) {
    const res = await fetch(`${API_BASE}/supplier-bills/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(billData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async deleteBill(id) {
    const res = await fetch(`${API_BASE}/supplier-bills/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  // Payments
  async recordPayment(paymentData) {
    const res = await fetch(`${API_BASE}/supplier-payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  async updatePayment(id, paymentData) {
    const res = await fetch(`${API_BASE}/supplier-payments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  },

  // Dashboard Metrics
  async getDashboardMetrics() {
    const res = await fetch(`${API_BASE}/supplier-dashboard/metrics`, { headers: getAuthHeaders() });
    if (!res.ok) await handleResponseError(res);
    return await res.json();
  }
};
