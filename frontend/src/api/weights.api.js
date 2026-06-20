import { api } from './client.js';

export const listWeights = () => api.get('/weights');
export const logWeight = (data) => api.post('/weights', data);
