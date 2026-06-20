import { api } from './client.js';

export const calcBmi = (data) => api.post('/calculators/bmi', data);
export const calcFatLoss = (data) => api.post('/calculators/fat-loss', data);
export const calcMacros = (data) => api.post('/calculators/macros', data);
export const calcMuscleGain = (data) => api.post('/calculators/muscle-gain', data);
