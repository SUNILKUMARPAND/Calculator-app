# All-in-One Calculator

Twenty calculators in one React app: basic and scientific maths, finance (EMI, loan, SIP, compound and simple interest, GST), health (BMI), date and time, a currency converter with live rates, and a unit converter. It uses only React. There is no UI library and no router, and the maths never calls `eval()`.

## Install and run

You need Node.js 18 or later.

```bash
cd calculator-app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run lint       # oxlint
```

The runtime dependencies are `react` and `react-dom`. The dev tools are Vite, `@vitejs/plugin-react` and oxlint.

## Project structure

```
calculator-app/
├── index.html                 # applies the saved theme before React loads (no flash)
├── public/favicon.svg
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # owns theme, route, search query and the mobile menu
    ├── index.css              # all styles: theme tokens, layout, components, responsive
    │
    ├── calculators/           # one component per calculator + the registry
    │   ├── index.js           # CALCULATORS list (id, name, icon, category, component) + search
    │   ├── BasicCalculator.jsx        ├── ScientificCalculator.jsx
    │   ├── PercentageCalculator.jsx   ├── GPACalculator.jsx
    │   ├── EMICalculator.jsx          ├── LoanCalculator.jsx
    │   ├── SIPCalculator.jsx          ├── CompoundInterestCalculator.jsx
    │   ├── SimpleInterestCalculator.jsx ├── GSTCalculator.jsx
    │   ├── BMICalculator.jsx          ├── AgeCalculator.jsx
    │   ├── AgeDifferenceCalculator.jsx ├── DateCalculator.jsx
    │   ├── TimeCalculator.jsx         ├── CurrencyConverter.jsx
    │   ├── UnitConverter.jsx          ├── DiscountCalculator.jsx
    │   ├── TipCalculator.jsx          └── FuelCostCalculator.jsx
    │
    ├── components/            # reusable UI
    │   ├── Layout.jsx  Header.jsx  Sidebar.jsx  Dashboard.jsx  SearchBox.jsx
    │   ├── CalculatorCard.jsx     # frame around each calculator
    │   ├── InputField.jsx  SelectField.jsx  Tabs.jsx  FormActions.jsx
    │   ├── ResultCard.jsx  EmptyResult.jsx  CopyButton.jsx  ErrorMessage.jsx
    │   ├── HistoryList.jsx  SplitBar.jsx
    │   └── Keypad.jsx  Display.jsx      # used by Basic + Scientific
    │
    ├── hooks/
    │   ├── useForm.js             # values / errors / handleChange / reset
    │   ├── useExpression.js       # keypad-calculator state and input rules
    │   ├── useKeyboard.js         # physical keyboard support for the keypads
    │   ├── useHistory.js          # per-calculator history in localStorage
    │   ├── useLocalStorage.js     # useState that persists
    │   ├── useTheme.js            # dark/light mode
    │   ├── useHashRoute.js        # selected calculator lives in the URL (#/emi)
    │   ├── useCurrencyRates.js    # fetch + cache + loading/error states
    │   └── useCopyToClipboard.js
    │
    └── utils/                 # pure functions, no React, easy to unit-test
        ├── expression.js          # tokenizer + recursive-descent parser (replaces eval)
        ├── finance.js             # EMI, amortisation, loan, SIP, CI, SI, GST, discount, tip, fuel
        ├── percentage.js          # percentage modes as data (inputs + solve function)
        ├── health.js              # BMI + categories
        ├── date.js                # calendar-accurate Y/M/D differences, add months safely
        ├── time.js                # durations
        ├── units.js               # unit tables for 8 categories
        ├── currency.js            # exchange-rate API calls
        ├── gpa.js                 # grade scales, weighted average
        ├── validation.js          # parseNumber / validateNumber / validateFields
        └── format.js              # Indian number and currency formatting (en-IN, ₹)
```

## How the important parts work

### 1. The registry drives the whole UI

`src/calculators/index.js` exports one array. Each entry has an `id`, `name`, `icon`, `category`, `description`, search `keywords` and its `component`. The sidebar, the dashboard tiles, search and routing all read from this array. To add a calculator, you add one entry to it.

`App.jsx` finds the active entry from the URL hash and renders it:

```jsx
<CalculatorCard key={active.id} calculator={active}>
  <ActiveCalculator />
</CalculatorCard>
```

The `key` makes React mount a fresh component each time you switch calculators, so no state carries over from one calculator to the next.

### 2. Routing without a router

`useHashRoute` reads `window.location.hash` (for example `#/emi`) and listens for `hashchange`. Because of that, the browser Back button works, every calculator has a URL you can bookmark, and the app doesn't need `react-router`.

### 3. The expression parser (no `eval`)

`utils/expression.js` works in two steps:

1. **Tokenize.** `"2×sin(30)+5%"` becomes the tokens `2`, `*`, `sin`, `(`, `30`, `)`, `+`, `5`, `%`.
2. **Parse with recursive descent.** Each precedence level has its own function:

   ```
   expression → term (+|− term)*
   term       → unary (×|÷ unary | implicit ×)*
   unary      → −unary | power
   power      → postfix (^ unary)?        (right-associative: 2^3^2 = 512)
   postfix    → primary (! | %)*
   primary    → number | π | e | Ans | fn( expression ) | ( expression )
   ```

The parser also handles:

- **Implicit multiplication:** `2π` and `3(4+1)`.
- **Calculator-style percent:** `200 + 10%` = 220, and `200 × 10%` = 20.
- **Degree and radian modes** for the trig functions.
- **Friendly errors**, thrown as `CalcError`: division by zero, `tan(90°)`, the log of a negative number, factorial of a non-integer, a missing bracket, an incomplete expression.

`useExpression` adds the rules for keypad input. It allows one decimal point per number. Pressing a second operator replaces the first (except that `×−` is kept, so you can type negative numbers). Brackets close automatically when you press `=`. After a result, typing a digit starts a new calculation and typing an operator continues from the result.

### 4. Form calculators all follow one pattern

```jsx
const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)

const handleSubmit = (e) => {
  e.preventDefault()
  const { errors: fieldErrors, data, isValid } = validateFields(values, {
    amount: { label: 'Loan amount', gt: 0 },
    rate:   { label: 'Interest rate', min: 0, max: 50 },
  })
  setErrors(fieldErrors)
  if (!isValid) return
  setResult(calculateEMI(data.amount, data.rate, months))   // pure util
}
```

- Inputs are kept as strings (`type="text" inputMode="decimal"`). Phones still show a number keypad, and our validator produces the messages instead of the browser. Examples: *"Loan amount is required"*, *"Interest rate must be at most 50"*, *"Number of people must be a whole number"*.
- All the maths lives in `utils/`. The components only collect input and show results.
- `ResultCard` takes `rows=[{label, value, highlight}]`. It shows the highlighted row large, lists the others, and has a **Copy result** button that copies every row as text.

### 5. Currency API

`utils/currency.js` calls **open.er-api.com** (free, no API key, about 160 currencies). If that fails, it falls back to **frankfurter.dev** (European Central Bank data). It fetches USD-based rates once and works out any currency pair as `rates[to] / rates[from]`.

`useCurrencyRates` handles:

- **Loading:** a spinner, and "Refreshing…" on the refresh button.
- **Errors:** a message with a *Try again* button. If older cached rates exist, it keeps showing them with a warning.
- **Caching:** rates are saved in `localStorage` for one hour.
- **Cancellation:** `AbortController` stops the request if you leave the page mid-fetch.

### 6. Dates without off-by-one bugs

`<input type="date">` gives `"2024-05-01"`. `new Date("2024-05-01")` would read that as UTC midnight, which can land on the previous day in some time zones. `parseDateInput` builds the date in local time instead.

`diffYMD` counts whole months first, then the leftover days. For example, 31 Jan → 1 Mar comes out as "1 month, 1 day" and never as a negative number of days. Adding months clamps to the end of the month, so 31 Jan + 1 month = 28/29 Feb.

### 7. Theme and responsive layout

- **Colours:** every colour is a CSS variable. `[data-theme="dark"]` swaps the whole set. The choice is saved in `localStorage`, and a small inline script in `index.html` applies it before React loads so the page never flashes the wrong theme.
- **Desktop:** fixed sidebar.
- **960px and below:** the sidebar becomes a slide-in drawer with a backdrop. Esc, choosing a calculator, or tapping the backdrop closes it.
- **Forms:** `repeat(auto-fit, minmax(...))` grids stack the form and the result on narrow screens without extra media queries.

## Suggestions for more features

1. **Charts:** a year-by-year growth line for SIP and compound interest, and a principal-vs-interest stacked bar per year for EMI.
2. **Prepayments in the EMI calculator:** see how a one-time or yearly prepayment cuts the tenure.
3. **Loan comparison:** compare two or three loans side by side.
4. **More calculators:** FD/RD, PPF, income tax (old vs new regime), retirement corpus, inflation, calorie/BMR, pregnancy due date, a matrix calculator and a base converter (binary/hex).
5. **Shareable links:** put the inputs in the URL (`#/emi?amount=500000&rate=8.5`).
6. **Currency history:** a 30-day rate chart using frankfurter's time-series endpoint.
7. **Favourites and recently used** calculators pinned at the top of the sidebar.
8. **PWA:** a service worker and manifest so the app installs and works offline (with cached currency rates).
9. **Tests:** Vitest for `utils/` (they are pure functions) and React Testing Library for the forms.
10. **Internationalisation:** choose locale and currency (₹/$/€) in settings instead of the fixed `en-IN` default.
11. **Lazy loading:** `React.lazy` for each calculator to shrink the first download.
