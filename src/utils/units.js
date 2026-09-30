/**
 * Unit conversion via a base unit per category.
 * Linear units store `factor` = how many base units one unit equals,
 * so convert = value × fromFactor / toFactor.
 * Temperature is not linear, so it uses toBase/fromBase functions (base = °C).
 */
export const UNIT_CATEGORIES = {
  length: {
    label: 'Length',
    units: {
      mm: { label: 'Millimetre (mm)', factor: 0.001 },
      cm: { label: 'Centimetre (cm)', factor: 0.01 },
      m: { label: 'Metre (m)', factor: 1 },
      km: { label: 'Kilometre (km)', factor: 1000 },
      in: { label: 'Inch (in)', factor: 0.0254 },
      ft: { label: 'Foot (ft)', factor: 0.3048 },
      yd: { label: 'Yard (yd)', factor: 0.9144 },
      mi: { label: 'Mile (mi)', factor: 1609.344 },
      nmi: { label: 'Nautical mile (nmi)', factor: 1852 },
    },
    defaults: ['km', 'mi'],
  },
  weight: {
    label: 'Weight',
    units: {
      mg: { label: 'Milligram (mg)', factor: 0.000001 },
      g: { label: 'Gram (g)', factor: 0.001 },
      kg: { label: 'Kilogram (kg)', factor: 1 },
      t: { label: 'Tonne (t)', factor: 1000 },
      oz: { label: 'Ounce (oz)', factor: 0.028349523125 },
      lb: { label: 'Pound (lb)', factor: 0.45359237 },
      st: { label: 'Stone (st)', factor: 6.35029318 },
    },
    defaults: ['kg', 'lb'],
  },
  temperature: {
    label: 'Temperature',
    units: {
      c: { label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v, absoluteZero: -273.15 },
      f: { label: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32, absoluteZero: -459.67 },
      k: { label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15, absoluteZero: 0 },
    },
    defaults: ['c', 'f'],
  },
  area: {
    label: 'Area',
    units: {
      mm2: { label: 'Square millimetre (mm²)', factor: 0.000001 },
      cm2: { label: 'Square centimetre (cm²)', factor: 0.0001 },
      m2: { label: 'Square metre (m²)', factor: 1 },
      ha: { label: 'Hectare (ha)', factor: 10000 },
      km2: { label: 'Square kilometre (km²)', factor: 1000000 },
      in2: { label: 'Square inch (in²)', factor: 0.00064516 },
      ft2: { label: 'Square foot (ft²)', factor: 0.09290304 },
      yd2: { label: 'Square yard (yd²)', factor: 0.83612736 },
      acre: { label: 'Acre', factor: 4046.8564224 },
      mi2: { label: 'Square mile (mi²)', factor: 2589988.110336 },
    },
    defaults: ['m2', 'ft2'],
  },
  volume: {
    label: 'Volume',
    units: {
      ml: { label: 'Millilitre (ml)', factor: 0.001 },
      l: { label: 'Litre (l)', factor: 1 },
      m3: { label: 'Cubic metre (m³)', factor: 1000 },
      tsp: { label: 'Teaspoon (US)', factor: 0.00492892159375 },
      tbsp: { label: 'Tablespoon (US)', factor: 0.0147867647813 },
      cup: { label: 'Cup (US)', factor: 0.2365882365 },
      floz: { label: 'Fluid ounce (US)', factor: 0.0295735295625 },
      pt: { label: 'Pint (US)', factor: 0.473176473 },
      gal: { label: 'Gallon (US)', factor: 3.785411784 },
      galuk: { label: 'Gallon (UK)', factor: 4.54609 },
    },
    defaults: ['l', 'gal'],
  },
  time: {
    label: 'Time',
    units: {
      ms: { label: 'Millisecond (ms)', factor: 0.001 },
      s: { label: 'Second (s)', factor: 1 },
      min: { label: 'Minute (min)', factor: 60 },
      h: { label: 'Hour (h)', factor: 3600 },
      d: { label: 'Day', factor: 86400 },
      wk: { label: 'Week', factor: 604800 },
      mo: { label: 'Month (avg. 30.44 days)', factor: 2629800 },
      yr: { label: 'Year (365.25 days)', factor: 31557600 },
    },
    defaults: ['h', 'min'],
  },
  speed: {
    label: 'Speed',
    units: {
      ms: { label: 'Metre/second (m/s)', factor: 1 },
      kmh: { label: 'Kilometre/hour (km/h)', factor: 1 / 3.6 },
      mph: { label: 'Mile/hour (mph)', factor: 0.44704 },
      kn: { label: 'Knot (kn)', factor: 0.514444444 },
      fts: { label: 'Foot/second (ft/s)', factor: 0.3048 },
    },
    defaults: ['kmh', 'mph'],
  },
  data: {
    label: 'Data storage',
    units: {
      bit: { label: 'Bit', factor: 1 / 8 },
      b: { label: 'Byte (B)', factor: 1 },
      kb: { label: 'Kilobyte (KB)', factor: 1024 },
      mb: { label: 'Megabyte (MB)', factor: 1024 ** 2 },
      gb: { label: 'Gigabyte (GB)', factor: 1024 ** 3 },
      tb: { label: 'Terabyte (TB)', factor: 1024 ** 4 },
      pb: { label: 'Petabyte (PB)', factor: 1024 ** 5 },
    },
    defaults: ['gb', 'mb'],
    note: '1 KB = 1024 bytes (binary units, as used by most operating systems).',
  },
}

export function convertUnit(value, categoryKey, fromKey, toKey) {
  const { units } = UNIT_CATEGORIES[categoryKey]
  const from = units[fromKey]
  const to = units[toKey]
  if (from.toBase) return to.fromBase(from.toBase(value))
  return (value * from.factor) / to.factor
}

/** Returns an error message if the value is physically impossible, else null. */
export function checkUnitValue(value, categoryKey, fromKey) {
  const unit = UNIT_CATEGORIES[categoryKey].units[fromKey]
  if (categoryKey === 'temperature') {
    return value < unit.absoluteZero ? `Temperature cannot be below absolute zero (${unit.absoluteZero} ${unit.label.match(/\((.*)\)/)[1]})` : null
  }
  return value < 0 ? `${UNIT_CATEGORIES[categoryKey].label} cannot be negative` : null
}
