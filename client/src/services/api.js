import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for friendly error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
    const friendlyError = new Error(message);

    Object.assign(friendlyError, error.response?.data);
    return Promise.reject(friendlyError);
  }
);

// API Service Callers
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  municipalLogin: (data) => api.post('/auth/municipal-login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, data) => api.patch(`/complaints/${id}`, data),
  uploadProof: (id, formData) => api.post(`/complaints/${id}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyResolution: (id, data) => api.post(`/complaints/${id}/verify`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data)
};

export const draftAPI = {
  saveDraft: (data) => api.post('/drafts', data),
  getDrafts: () => api.get('/drafts'),
  getDraftById: (id) => api.get(`/drafts/${id}`),
  deleteDraft: (id) => api.delete(`/drafts/${id}`)
};

export const calendarAPI = {
  getTasks: () => api.get('/calendar'),
  createTask: (data) => api.post('/calendar', data),
  updateTask: (id, data) => api.patch(`/calendar/${id}`, data),
  deleteTask: (id) => api.delete(`/calendar/${id}`)
};

export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: () => api.get('/admin/users')
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all')
};

export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze', data),
  checkDuplicates: (data) => api.post('/ai/duplicate-check', data),
  detectPothole: (formData) => api.post('/ai/detect-pothole', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const municipalityAPI = {
  getAll: (params) => api.get('/municipalities', { params }),
  getByState: (identifier) => api.get(`/municipalities/${identifier}`),
  getStaff: (params) => api.get('/municipalities/staff', { params })
};

export default api;
