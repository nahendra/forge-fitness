import { PLANS } from '../data/plans.data.js';
import { ApiError } from '../utils/ApiError.js';
import { enrichPlanNote } from './ai.service.js';

export async function generatePlan({ bodyType, goal, note }) {
  const plan = PLANS[bodyType]?.[goal];
  if (!plan) throw ApiError.badRequest('No plan exists for that body type / goal combination.');

  const insight = await enrichPlanNote({ bodyType, goal, plan, note });

  return {
    bodyType,
    goal,
    calories: plan.cals,
    split: plan.split,
    protein: plan.protein,
    carbs: plan.carbs,
    fats: plan.fats,
    insight: {
      text: insight.text,
      source: insight.source, // 'rule-engine' | 'ai' | 'rule-engine' (fallback)
      model: insight.model,
    },
  };
}
