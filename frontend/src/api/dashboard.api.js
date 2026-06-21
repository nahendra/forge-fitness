import { api } from './client.js';

export const fetchDashboardSummary = () => api.get('/dashboard/summary');
export const fetchStrengthSeries = (exercise) => api.get('/dashboard/strength', { exercise });
export const fetchConsistency = () => api.get('/dashboard/consistency');
