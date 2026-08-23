import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>That page drifted off-board.</h1>
      <p>The route does not exist, but your tasks are still safe.</p>
      <Link className="button button--primary button--md" to="/">
        Return to the board
      </Link>
    </div>
  )
}
