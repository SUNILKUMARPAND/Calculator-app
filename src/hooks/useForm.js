import { useState } from 'react'

/**
 * Tiny form helper used by all form-based calculators.
 * Inputs stay strings (what the user typed); they are parsed only when validating.
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    // Clear the field's error as soon as the user edits it
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValue(name, type === 'checkbox' ? checked : value)
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, setErrors, setValue, handleChange, reset }
}
