// Pure finance formulas. Rates are passed as percentages (8.5 means 8.5%).

/**
 * EMI (equated monthly instalment):
 *   EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where r = monthly rate and n = number of months.
 */
export function calculateEMI(principal, annualRate, months) {
  const r = annualRate / 12 / 100
  const emi = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1)
  const totalPayment = emi * months
  return { emi, totalPayment, totalInterest: totalPayment - principal }
}

/** Year-by-year breakdown of how each EMI is split into principal and interest. */
export function amortizationByYear(principal, annualRate, months) {
  const r = annualRate / 12 / 100
  const { emi } = calculateEMI(principal, annualRate, months)
  const rows = []
  let balance = principal

  for (let month = 1; month <= months; month++) {
    const interest = balance * r
    const principalPaid = Math.min(emi - interest, balance)
    balance = Math.max(balance - principalPaid, 0)

    const yearIndex = Math.ceil(month / 12) - 1
    if (!rows[yearIndex]) rows[yearIndex] = { year: yearIndex + 1, principal: 0, interest: 0, balance: 0 }
    rows[yearIndex].principal += principalPaid
    rows[yearIndex].interest += interest
    rows[yearIndex].balance = balance
  }
  return rows
}

/**
 * Loan payment for any payment frequency (monthly, quarterly, yearly…).
 * Same annuity formula as EMI with r = annualRate / paymentsPerYear.
 */
export function calculateLoanPayment(principal, annualRate, years, paymentsPerYear) {
  const n = Math.round(years * paymentsPerYear)
  const r = annualRate / paymentsPerYear / 100
  const payment = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1)
  const totalRepayment = payment * n
  return { payment, numberOfPayments: n, totalRepayment, totalInterest: totalRepayment - principal }
}

/**
 * SIP future value (investment made at the start of each month):
 *   FV = P × ((1 + i)^n − 1) / i × (1 + i)
 */
export function calculateSIP(monthlyInvestment, annualRate, years) {
  const n = Math.round(years * 12)
  const i = annualRate / 12 / 100
  const finalAmount = i === 0 ? monthlyInvestment * n : monthlyInvestment * (((1 + i) ** n - 1) / i) * (1 + i)
  const totalInvestment = monthlyInvestment * n
  return { totalInvestment, estimatedReturns: finalAmount - totalInvestment, finalAmount }
}

/**
 * Compound interest:  A = P × (1 + r/n)^(n×t)
 * Effective annual rate: (1 + r/n)^n − 1
 */
export function calculateCompoundInterest(principal, annualRate, years, timesPerYear) {
  const r = annualRate / 100
  const finalAmount = principal * (1 + r / timesPerYear) ** (timesPerYear * years)
  const effectiveRate = ((1 + r / timesPerYear) ** timesPerYear - 1) * 100
  return { compoundInterest: finalAmount - principal, finalAmount, effectiveRate }
}

/** Simple interest:  SI = P × R × T / 100 */
export function calculateSimpleInterest(principal, annualRate, years) {
  const simpleInterest = (principal * annualRate * years) / 100
  return { simpleInterest, totalAmount: principal + simpleInterest }
}

/**
 * GST in two directions:
 *   'add'    – amount is before tax  → add GST on top
 *   'remove' – amount already includes GST → extract it
 */
export function calculateGST(amount, gstRate, mode = 'add') {
  if (mode === 'remove') {
    const netAmount = (amount * 100) / (100 + gstRate)
    return { netAmount, gstAmount: amount - netAmount, grossAmount: amount }
  }
  const gstAmount = (amount * gstRate) / 100
  return { netAmount: amount, gstAmount, grossAmount: amount + gstAmount }
}

/** Discount, with an optional second discount applied on the already-reduced price. */
export function calculateDiscount(originalPrice, discountPercent, extraPercent = 0) {
  const afterFirst = originalPrice * (1 - discountPercent / 100)
  const finalPrice = afterFirst * (1 - extraPercent / 100)
  const discountAmount = originalPrice - finalPrice
  const effectivePercent = originalPrice === 0 ? 0 : (discountAmount / originalPrice) * 100
  return { discountAmount, finalPrice, effectivePercent }
}

export function calculateTip(bill, tipPercent, people) {
  const totalTip = (bill * tipPercent) / 100
  const totalBill = bill + totalTip
  return {
    totalTip,
    totalBill,
    tipPerPerson: totalTip / people,
    amountPerPerson: totalBill / people,
  }
}

export function calculateFuelCost(distance, mileage, fuelPrice, roundTrip = false, people = 1) {
  const totalDistance = roundTrip ? distance * 2 : distance
  const fuelRequired = totalDistance / mileage
  const totalCost = fuelRequired * fuelPrice
  return {
    totalDistance,
    fuelRequired,
    totalCost,
    costPerKm: totalCost / totalDistance,
    costPerPerson: totalCost / people,
  }
}
