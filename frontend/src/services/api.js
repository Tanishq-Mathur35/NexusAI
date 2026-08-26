import api from '../api/axios.js';

export const interviewService = {
    start: (config) => api.post('/interviews/start', config),
    submitAnswer: (data) => api.post('/interviews/answer', data),
    complete: (data) => api.post('/interviews/complete', data),
    getAll: (params) => api.get('/interviews', { params }),
    getById: (id) => api.get(`/interviews/${id}`),
    getStats: () => api.get('/interviews/stats')
};

export const resumeService = {
    upload: (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getAll: () => api.get('/resume'),
    getById: (id) => api.get(`/resume/${id}`),
    analyzeATS: (data) => api.post('/resume/ats', data),
    delete: (id) => api.delete(`/resume/${id}`)
};

export const analyticsService = {
    overview: () => api.get('/analytics/overview'),
    emotions: () => api.get('/analytics/emotions')
};

export const userService = {
    updateProfile: (data) => api.patch('/users/profile', data),
    changePassword: (data) => api.patch('/users/password', data)
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
    getInterviews: (params) => api.get('/admin/interviews', { params })
};
