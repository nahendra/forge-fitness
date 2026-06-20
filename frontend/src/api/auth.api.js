import { api } from './client.js';

export const fetchCsrfToken = () => api.get('/auth/csrf-token');
export const registerRequest = (data) => api.post('/auth/register', data);
export const loginRequest = (data) => api.post('/auth/login', data);
export const logoutRequest = () => api.post('/auth/logout');
export const fetchMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const forgotPasswordRequest = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordRequest = (data) => api.post('/auth/reset-password', data);
