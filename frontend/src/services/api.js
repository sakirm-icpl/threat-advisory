import axios from 'axios';

// Get API URL from environment or default to current host
const getApiUrl = () => {
  // In development, use the environment variable
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }
  
  // In production, construct the API URL based on current host
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = '8000'; // Backend port
  
  return `${protocol}//${host}:${port}`;
};

export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log error details for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` }
          }
        );

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 422 errors specifically
    if (error.response?.status === 422) {
      console.error('422 Validation Error:', error.response.data);
      // You can add specific handling for 422 errors here
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  
  // Vendors
  getVendors: () => api.get('/vendors'),
  createVendor: (data) => api.post('/vendors', data),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
  
  // Products
  getProducts: (params) => api.get('/products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Methods
  getMethods: (params) => api.get('/methods', { params }),
  createMethod: (data) => api.post('/methods', data),
  updateMethod: (id, data) => api.put(`/methods/${id}`, data),
  deleteMethod: (id) => api.delete(`/methods/${id}`),
  
  // Setup Guides
  getSetupGuides: (params) => api.get('/setup-guides', { params }),
  createSetupGuide: (data) => api.post('/setup-guides', data),
  updateSetupGuide: (id, data) => api.put(`/setup-guides/${id}`, data),
  deleteSetupGuide: (id) => api.delete(`/setup-guides/${id}`),
  
  // Regex Testing
  testRegex: (data) => api.post('/regex-test', data),
  
  // Search
  search: ({ q, type }) => api.get('/search', { params: { q, type } }),
  advancedSearch: (data) => api.post('/search/advanced', data),
  
  // Bulk Operations
  exportData: (format) => api.get('/bulk/export', { params: { format } }),
  importData: (data) => api.post('/bulk/import', data),
  createBackup: () => api.get('/bulk/backup'),
  restoreBackup: (data) => api.post('/bulk/restore', data),
  exportAllData: (format) => api.get('/bulk/export-all', { params: { format } }),
  
  // Enhanced Bulk Operations
  cleanupData: (data) => api.post('/bulk/cleanup', data),
  exportSelective: (data) => api.post('/bulk/export-selective', data),
  importPreview: (data) => api.post('/bulk/import-preview', data),
  bulkDelete: (data) => api.post('/bulk/bulk-delete', data),
  exportVendorData: (vendorId, format) => api.get(`/bulk/export-vendor/${vendorId}`, { params: { format } }),
  exportAllComplete: (format) => api.get('/bulk/export-all-complete', { params: { format } }),
  
  // Users (Admin only)
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  resetUserPassword: (data) => api.post('/auth/reset-password', data),
  
  // Health & Metrics
  health: () => api.get('/health'),
  metrics: () => api.get('/metrics'),
  
  // Dashboard
  getDashboardSummary: () => api.get('/dashboard/summary'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
}; 

export default api; 