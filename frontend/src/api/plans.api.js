import { api } from './client.js';

export const generatePlan = (data) => api.post('/plans/generate', data);
