import { api } from './client.js';

export const fetchLeaderboard = () => api.get('/community/leaderboard');
export const fetchStories = () => api.get('/community/stories');
