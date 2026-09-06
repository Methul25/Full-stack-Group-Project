export default function ConflictResolver({ conflicts, onResolve, disabled }) {
  if (!conflicts.length) return null
  return (
    <section className="conflict-panel" role="alert">
      <div><p className="eyebrow">Edit conflict detected</p><h2>Your work is safe</h2><p>Another person changed this task first. Choose the server copy or apply your version on top.</p></div>
      {conflicts.map((conflict) => (
        <article key={conflict.taskId}>
          <strong>{conflict.current?.title ?? conflict.base?.title}</strong>
          <span>Conflicting fields: {conflict.conflictingFields.join(', ') || 'unknown'}</span>
          <div><button disabled={disabled} onClick={() => onResolve(conflict.taskId, 'server')}>Use server version</button><button disabled={disabled} onClick={() => onResolve(conflict.taskId, 'mine')}>Keep my edit</button></div>
        </article>
      ))}
    </section>
  )
}
