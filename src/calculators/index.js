// Registry of every calculator. The sidebar, dashboard, search and routing
// are all driven by this one list — to add a calculator, add one entry here.
import AgeCalculator from './AgeCalculator'
import AgeDifferenceCalculator from './AgeDifferenceCalculator'
import BasicCalculator from './BasicCalculator'
import BMICalculator from './BMICalculator'
import CompoundInterestCalculator from './CompoundInterestCalculator'
import CurrencyConverter from './CurrencyConverter'
import DateCalculator from './DateCalculator'
import DiscountCalculator from './DiscountCalculator'
import EMICalculator from './EMICalculator'
import FuelCostCalculator from './FuelCostCalculator'
import GPACalculator from './GPACalculator'
import GSTCalculator from './GSTCalculator'
import LoanCalculator from './LoanCalculator'
import PercentageCalculator from './PercentageCalculator'
import ScientificCalculator from './ScientificCalculator'
import SimpleInterestCalculator from './SimpleInterestCalculator'
import SIPCalculator from './SIPCalculator'
import TimeCalculator from './TimeCalculator'
import TipCalculator from './TipCalculator'
import UnitConverter from './UnitConverter'

export const CATEGORIES = ['Math', 'Finance', 'Health', 'Date & Time', 'Converters', 'Everyday']

export const CALCULATORS = [
  { id: 'basic', name: 'Basic Calculator', icon: '🧮', category: 'Math', component: BasicCalculator, description: 'Add, subtract, multiply, divide, percentages, with history.', keywords: 'arithmetic simple plus minus' },
  { id: 'scientific', name: 'Scientific Calculator', icon: '🔬', category: 'Math', component: ScientificCalculator, description: 'Trig, logs, powers, roots, factorials, π and e in DEG/RAD.', keywords: 'sin cos tan log ln sqrt power factorial' },
  { id: 'percentage', name: 'Percentage Calculator', icon: '％', category: 'Math', component: PercentageCalculator, description: '% of a number, increase, decrease, original value, difference.', keywords: 'percent increase decrease' },
  { id: 'gpa', name: 'GPA / CGPA Calculator', icon: '🎓', category: 'Math', component: GPACalculator, description: 'Credit-weighted GPA from subjects or CGPA from semesters.', keywords: 'grade cgpa sgpa college marks' },

  { id: 'emi', name: 'EMI Calculator', icon: '🏦', category: 'Finance', component: EMICalculator, description: 'Monthly EMI, total interest and a year-wise breakdown.', keywords: 'loan home car instalment' },
  { id: 'loan', name: 'Loan Calculator', icon: '💳', category: 'Finance', component: LoanCalculator, description: 'Payment per period for monthly, quarterly or yearly loans.', keywords: 'repayment principal interest' },
  { id: 'sip', name: 'SIP Calculator', icon: '📈', category: 'Finance', component: SIPCalculator, description: 'Future value of a monthly mutual fund investment.', keywords: 'mutual fund investment returns' },
  { id: 'compound-interest', name: 'Compound Interest', icon: '💹', category: 'Finance', component: CompoundInterestCalculator, description: 'Growth with yearly, quarterly, monthly or daily compounding.', keywords: 'ci fd deposit' },
  { id: 'simple-interest', name: 'Simple Interest', icon: '💰', category: 'Finance', component: SimpleInterestCalculator, description: 'SI = P × R × T / 100 and the total amount.', keywords: 'si interest' },
  { id: 'gst', name: 'GST Calculator', icon: '🧾', category: 'Finance', component: GSTCalculator, description: 'Add or remove GST with a CGST/SGST split.', keywords: 'tax gst cgst sgst invoice' },

  { id: 'bmi', name: 'BMI Calculator', icon: '⚖️', category: 'Health', component: BMICalculator, description: 'Body Mass Index and category in metric or imperial units.', keywords: 'body mass weight height health' },

  { id: 'age', name: 'Age Calculator', icon: '🎂', category: 'Date & Time', component: AgeCalculator, description: 'Exact age in years, months and days, plus next birthday.', keywords: 'birthday dob born' },
  { id: 'age-difference', name: 'Age Difference', icon: '👥', category: 'Date & Time', component: AgeDifferenceCalculator, description: 'How far apart two birthdays are.', keywords: 'compare older younger' },
  { id: 'date', name: 'Date Calculator', icon: '📅', category: 'Date & Time', component: DateCalculator, description: 'Add/subtract days or count days between two dates.', keywords: 'days between add subtract calendar' },
  { id: 'time', name: 'Time Calculator', icon: '⏱️', category: 'Date & Time', component: TimeCalculator, description: 'Add/subtract durations, convert units, time difference.', keywords: 'hours minutes seconds duration clock' },

  { id: 'currency', name: 'Currency Converter', icon: '💱', category: 'Converters', component: CurrencyConverter, description: 'Live exchange rates for 150+ currencies.', keywords: 'exchange rate forex usd inr dollar rupee' },
  { id: 'unit', name: 'Unit Converter', icon: '📏', category: 'Converters', component: UnitConverter, description: 'Length, weight, temperature, area, volume, time, speed, data.', keywords: 'length weight temperature area volume speed data metric imperial' },

  { id: 'discount', name: 'Discount Calculator', icon: '🏷️', category: 'Everyday', component: DiscountCalculator, description: 'Sale price and savings, including stacked discounts.', keywords: 'sale offer price off' },
  { id: 'tip', name: 'Tip Calculator', icon: '🍽️', category: 'Everyday', component: TipCalculator, description: 'Tip amount and bill split per person.', keywords: 'restaurant bill split' },
  { id: 'fuel', name: 'Fuel Cost Calculator', icon: '⛽', category: 'Everyday', component: FuelCostCalculator, description: 'Fuel needed and total trip cost.', keywords: 'petrol diesel trip mileage travel' },
]

/** Case-insensitive search over name, category, description and keywords. */
export function searchCalculators(query) {
  const q = query.trim().toLowerCase()
  if (!q) return CALCULATORS
  return CALCULATORS.filter((calc) => `${calc.name} ${calc.category} ${calc.description} ${calc.keywords}`.toLowerCase().includes(q))
}
