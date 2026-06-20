// Deterministic rule-based plan table — ported as-is from the original
// prototype. This is intentionally NOT generative: it's fast, free, has zero
// hallucination risk, and works with no external dependency. See
// services/ai.service.js for the optional LLM enrichment layer built on top.
export const PLANS = {
  ectomorph: {
    cut: {
      cals: '+200 surplus first, then gradual cut',
      split: 'Push/Pull/Legs x2 (6 days)',
      key: 'Prioritise compound lifts. Eat every 3hrs. Calorie surplus is your friend.',
      protein: '2.5g/kg',
      carbs: 'High — rice, oats, banana',
      fats: 'Moderate — nuts, olive oil',
    },
    bulk: {
      cals: '+400-500 cal surplus',
      split: 'Upper/Lower x2 (4 days)',
      key: 'Eat MORE. Train heavy. Sleep 8hrs. Your metabolism is fast — stay ahead of it.',
      protein: '2.2g/kg',
      carbs: 'Very high — every meal',
      fats: 'Moderate',
    },
    shred: {
      cals: '-200 deficit with carb cycling',
      split: 'PPL + 2 HIIT sessions',
      key: 'Shredding as an ecto is fast — but keep protein high to preserve muscle.',
      protein: '2.8g/kg',
      carbs: 'Cycle: high/low alternating',
      fats: 'Low-moderate',
    },
  },
  mesomorph: {
    cut: {
      cals: '-300-400 deficit',
      split: 'Push/Pull/Legs (6 days)',
      key: 'You respond well to training. Lean cut with 20% deficit. Walk 10K steps daily.',
      protein: '2.2g/kg',
      carbs: 'Moderate — time around workouts',
      fats: 'Moderate',
    },
    bulk: {
      cals: '+250-300 surplus (lean bulk)',
      split: 'Upper/Lower x2 (4 days)',
      key: 'Your body responds fast. Keep surplus lean — 250-300 cal. Track strength weekly.',
      protein: '2.0g/kg',
      carbs: 'High around workouts',
      fats: 'Moderate-high',
    },
    shred: {
      cals: '-400 + refeed every 5th day',
      split: 'PPL + Cardio (6 days)',
      key: 'Competition-level shred protocol. Refeed prevents metabolism slowdown.',
      protein: '2.5g/kg',
      carbs: 'Low except refeed day',
      fats: 'Very low',
    },
  },
  endomorph: {
    cut: {
      cals: '-500 deficit, low carb',
      split: 'Full body x3 + HIIT x2',
      key: 'Insulin sensitivity is key. Low-carb works best. Prioritise vegetables and protein.',
      protein: '2.4g/kg',
      carbs: 'Low — vegetables, small portions',
      fats: 'Moderate (healthy)',
    },
    bulk: {
      cals: '+150 very lean surplus',
      split: 'Upper/Lower x2 (4 days)',
      key: 'Lean bulk ONLY. You gain fat easily. Track every calorie. Keep carbs around workouts only.',
      protein: '2.2g/kg',
      carbs: 'Only pre/post workout',
      fats: 'Moderate',
    },
    shred: {
      cals: '-600 aggressive deficit + cardio',
      split: 'Full body x4 + LISS cardio daily',
      key: 'Aggressive approach needed. Fasted morning cardio + evening weights. Strict diet.',
      protein: '2.6g/kg',
      carbs: 'Very low — keto approach',
      fats: 'Moderate (fuel)',
    },
  },
};
