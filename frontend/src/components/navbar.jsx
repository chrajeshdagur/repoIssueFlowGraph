import "../styles/navbar.css"

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-left">
            <div className="project-info">
              <span className="project-icon">🕸️</span>
              <div>
                <h1>IssueFlow</h1>
                <p>Issue workflow visualizer</p>
              </div>
            </div>
            <div className="nav-links">
              <a href="#" className="nav-link active">
                Home
              </a>
              <a href="#about" className="nav-link">
                About
              </a>
              <a href="#docs" className="nav-link">
                Docs
              </a>
              <a href="https://github.com" className="nav-link">
                Dashboard
              </a>
            </div>
          </div>
          <div className="nav-right">
            <div className="stat-badge">
              <span>⭐</span>
              <strong>1.2K</strong>
            </div>
            <div className="stat-badge">
              <span>🍴</span>
              <strong>284</strong>
            </div>
            <a href="https://github.com" className="btn-github">
              <span>🔗</span> GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
