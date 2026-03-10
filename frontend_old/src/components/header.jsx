import RepoIssueFlowIcon from "./icon"

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.branding}>
          <RepoIssueFlowIcon />
          <h1 style={styles.title}>RepoIssueFlow-Graph</h1>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={styles.link}>
            Dashboard
          </a>
          <a href="#" style={styles.link}>
            About
          </a>
          <a href="#" style={styles.link}>
            <span style={styles.githubIcon}>🔗</span> GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}

const styles = {
  header: {
    backgroundColor: "#1a2332",
    borderBottom: "1px solid #2a3f5f",
    padding: "20px 40px",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  branding: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#ffffff",
  },
  nav: {
    display: "flex",
    gap: "40px",
    alignItems: "center",
  },
  link: {
    color: "#e0e0e0",
    textDecoration: "none",
    fontSize: "16px",
    cursor: "pointer",
    transition: "color 0.3s",
  },
  githubIcon: {
    marginRight: "8px",
  },
}
