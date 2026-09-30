// Grade scales and GPA / CGPA formulas.
// GPA  = Σ(credits × grade points) / Σ credits
// CGPA = Σ(semester credits × SGPA) / Σ semester credits

export const GRADE_SCALES = {
  ten: {
    label: '10-point (India)',
    max: 10,
    grades: [
      { grade: 'O', points: 10 },
      { grade: 'A+', points: 9 },
      { grade: 'A', points: 8 },
      { grade: 'B+', points: 7 },
      { grade: 'B', points: 6 },
      { grade: 'C', points: 5 },
      { grade: 'P', points: 4 },
      { grade: 'F', points: 0 },
    ],
  },
  four: {
    label: '4-point (US)',
    max: 4,
    grades: [
      { grade: 'A', points: 4 },
      { grade: 'A-', points: 3.7 },
      { grade: 'B+', points: 3.3 },
      { grade: 'B', points: 3 },
      { grade: 'B-', points: 2.7 },
      { grade: 'C+', points: 2.3 },
      { grade: 'C', points: 2 },
      { grade: 'C-', points: 1.7 },
      { grade: 'D', points: 1 },
      { grade: 'F', points: 0 },
    ],
  },
}

export function gradePoints(scaleKey, grade) {
  return GRADE_SCALES[scaleKey].grades.find((g) => g.grade === grade)?.points ?? 0
}

/** items: [{ credits, points }] → weighted average */
export function weightedAverage(items) {
  const totalCredits = items.reduce((sum, item) => sum + item.credits, 0)
  const totalPoints = items.reduce((sum, item) => sum + item.credits * item.points, 0)
  return { average: totalCredits === 0 ? 0 : totalPoints / totalCredits, totalCredits, totalPoints }
}
