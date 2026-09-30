// BMI = weight (kg) / height (m)²

export const BMI_CATEGORIES = [
  { label: 'Underweight', max: 18.5, tone: 'info', advice: 'Below the healthy range. Consider talking to a doctor or nutritionist.' },
  { label: 'Normal', max: 25, tone: 'good', advice: 'You are in the healthy weight range. Keep it up!' },
  { label: 'Overweight', max: 30, tone: 'warn', advice: 'Slightly above the healthy range. Regular activity and a balanced diet help.' },
  { label: 'Obesity', max: Infinity, tone: 'bad', advice: 'Well above the healthy range. A doctor can help plan safe next steps.' },
]

export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function getBMICategory(bmi) {
  return BMI_CATEGORIES.find((category) => bmi < category.max)
}

/** Weight range (kg) that gives a normal BMI (18.5 – 24.9) for this height. */
export function healthyWeightRange(heightCm) {
  const heightM = heightCm / 100
  return { min: 18.5 * heightM * heightM, max: 24.9 * heightM * heightM }
}

export const feetInchesToCm = (feet, inches) => (feet * 12 + inches) * 2.54
export const poundsToKg = (lb) => lb * 0.45359237
