import { prettyExpression } from '../utils/format'
import CopyButton from './CopyButton'

/** Calculator screen: expression on top, live preview / error underneath. */
export default function Display({ expression, preview, error, justEvaluated, badge }) {
  const shown = expression ? prettyExpression(expression) : '0'
  return (
    <div className={`display ${error ? 'has-error' : ''}`}>
      <div className="display-top">
        {badge ? <span className="badge badge-neutral">{badge}</span> : <span />}
        <CopyButton text={justEvaluated ? expression : preview} label="Copy" />
      </div>
      <output className={`display-expr ${justEvaluated ? 'is-result' : ''}`} aria-live="polite">
        {shown}
      </output>
      <div className="display-sub" role={error ? 'alert' : undefined}>
        {error || (preview ? `= ${preview}` : ' ')}
      </div>
    </div>
  )
}
