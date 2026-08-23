import Button from '../Button/Button.jsx'

export default function StatusView({ type, title, message, actionLabel, onAction }) {
  return (
    <section className={`status-view status-view--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="status-icon" aria-hidden="true">{type === 'error' ? '!' : type === 'empty' ? '○' : '↻'}</span>
      <h2>{title}</h2>
      <p>{message}</p>
      {onAction && <Button variant={type === 'error' ? 'dark' : 'primary'} onClick={onAction}>{actionLabel}</Button>}
    </section>
  )
}
