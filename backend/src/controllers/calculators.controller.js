import { asyncHandler } from '../utils/asyncHandler.js';
import {
  calculateBmi,
  calculateFatLoss,
  calculateMacros,
  calculateMuscleGainProjection,
} from '../services/calculators.service.js';

export const bmi = asyncHandler(async (req, res) => {
  res.json(calculateBmi(req.body));
});

export const fatLoss = asyncHandler(async (req, res) => {
  res.json(calculateFatLoss(req.body));
});

export const macros = asyncHandler(async (req, res) => {
  res.json(calculateMacros(req.body));
});

export const muscleGain = asyncHandler(async (req, res) => {
  res.json(calculateMuscleGainProjection(req.body));
});
