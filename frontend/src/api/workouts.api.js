import { api } from './client.js';

export const listWorkouts = (params) => api.get('/workouts', params);
export const getWorkout = (id) => api.get(`/workouts/${id}`);
export const createWorkout = (data) => api.post('/workouts', data);
export const deleteWorkout = (id) => api.del(`/workouts/${id}`);
export const fetchPlateauAlerts = () => api.get('/workouts/plateau-alerts');
