// Pure calculation functions — ported 1:1 from the original prototype's
// client-side math so existing users see identical numbers.

export function calculateBmi({ heightCm, weightKg }) {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  const rounded = Math.round(bmi * 10) / 10;

  let category, color, percent;
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#4d9fff';
    percent = Math.min((bmi / 18.5) * 25, 25);
  } else if (bmi < 25) {
    category = 'Normal Weight';
    color = '#39e07a';
    percent = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#febc2e';
    percent = 50 + ((bmi - 25) / 5) * 25;
  } else {
    category = 'Obese';
    color = '#ff3d5a';
    percent = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
  }

  return { bmi: rounded, category, color, percent: Math.min(percent, 100) };
}

export function calculateFatLoss({ age, weightKg, heightCm, gender, activity }) {
  const bmr = gender === 'm' ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5 : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const tdee = Math.round(bmr * activity);
  const targetCalories = tdee - 500;

  return {
    tdee,
    targetCalories,
    deficit: 500,
    expectedWeeklyLossKg: 0.5,
  };
}

export function calculateMacros({ weightKg, bodyFatPercent, goal, activity }) {
  const lbm = weightKg * (1 - bodyFatPercent / 100);
  const base = Math.round(lbm * 22 * activity);
  const calories = goal === 'cut' ? base - 400 : goal === 'bulk' ? base + 300 : base;

  const proteinG = Math.round(lbm * (goal === 'cut' ? 2.4 : goal === 'bulk' ? 2.0 : 1.8));
  const fatG = Math.round(lbm * (goal === 'cut' ? 0.7 : goal === 'bulk' ? 1.0 : 0.9));
  const carbG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  const totalCals = proteinG * 4 + carbG * 4 + fatG * 9;
  const pct = (kcal) => (totalCals > 0 ? Math.round((kcal / totalCals) * 100) : 0);

  return {
    calories,
    leanBodyMassKg: Math.round(lbm * 10) / 10,
    macros: {
      protein: { grams: proteinG, percent: pct(proteinG * 4) },
      carbs: { grams: carbG, percent: pct(carbG * 4) },
      fats: { grams: fatG, percent: pct(fatG * 9) },
    },
  };
}

export function calculateMuscleGainProjection({ age, trainingYears, weightKg, gender }) {
  const base = gender === 'm' ? [9, 4.5, 2.7, 1.4] : [4.5, 2.3, 1.4, 0.7];
  const yearIndex = Math.min(Math.trunc(trainingYears), 3);
  const ageAdjustment = age - 20 > 0 ? (age - 20) * 0.01 : 0;
  const rawGain = base[yearIndex] * (1 - ageAdjustment);
  const gainKgPerYear = Math.max(0.5, Math.round(rawGain * 10) / 10);

  return {
    gainKgPerYear,
    trainingYears,
    currentWeightKg: weightKg,
  };
}
