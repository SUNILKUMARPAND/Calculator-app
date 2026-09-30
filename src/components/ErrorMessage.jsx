export default function ErrorMessage({ children }) {
  if (!children) return null
  return (
    <p className="error-message" role="alert">
      <span aria-hidden="true">⚠ </span>
      {children}
    </p>
  )
}
