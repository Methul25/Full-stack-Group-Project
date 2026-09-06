export default function SyncStatus({ online, syncing, pendingCount, syncError, lastSyncedAt, onRetry }) {
  const label = !online ? 'Offline' : syncing ? 'Syncing' : pendingCount ? `${pendingCount} pending` : 'Synced'
  return (
    <div className={`sync-status sync-status--${!online ? 'offline' : syncError ? 'error' : 'online'}`} role="status">
      <span className="sync-dot" aria-hidden="true" />
      <div><strong>{label}</strong>{lastSyncedAt && !syncing && <small>Last sync {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}</div>
      {syncError && online && <button onClick={onRetry}>Retry</button>}
    </div>
  )
}
