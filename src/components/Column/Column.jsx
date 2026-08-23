import TaskCard from '../TaskCard/TaskCard.jsx'

export default function Column({ column, tasks }) {
  return (
    <section className="board-column" style={{ '--column-accent': column.accent }}>
      <header>
        <div><span className="column-dot" /><h2>{column.label}</h2></div>
        <span className="count" aria-label={`${tasks.length} tasks`}>{tasks.length}</span>
      </header>
      <div className="task-list">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && <div className="column-empty">No tasks here</div>}
      </div>
    </section>
  )
}
