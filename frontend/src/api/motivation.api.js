import { api } from './client.js';

export const fetchRandomMotivation = () => api.get('/motivation/random');
export const fetchFitnessTruths = () => api.get('/motivation/truths');
