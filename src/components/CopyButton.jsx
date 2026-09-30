import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

export default function CopyButton({ text, label = 'Copy result' }) {
  const { status, copy } = useCopyToClipboard()
  const buttonText = status === 'copied' ? '✓ Copied' : status === 'error' ? 'Copy failed' : `⧉ ${label}`

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(text)} disabled={!text} aria-live="polite">
      {buttonText}
    </button>
  )
}
