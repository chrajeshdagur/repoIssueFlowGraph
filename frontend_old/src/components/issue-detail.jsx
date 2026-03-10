export default function IssueDetail({ issue }) {
  if (!issue) {
    return (
      <aside style={styles.detailPanel}>
        <div style={styles.emptyState}>Select an issue to view details</div>
      </aside>
    )
  }

  return (
    <aside style={styles.detailPanel}>
      <div style={styles.issueNumber}>{issue.id}</div>
      <h2 style={styles.issueTitle}>{issue.title}</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Summary</h3>
        <p style={styles.summaryText}>{issue.summary}</p>
      </div>

      {issue.state && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Status</h3>
          <p style={styles.status}>{issue.state.charAt(0).toUpperCase() + issue.state.slice(1)}</p>
        </div>
      )}

      {issue.dependencies && issue.dependencies.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Backlinked Issues ({issue.dependencies.length})</h3>
          <div style={styles.dependenciesList}>
            {issue.dependencies.map((dep, idx) => (
              <div key={idx} style={styles.dependency}>
                <div
                  style={{
                    ...styles.depDot,
                    backgroundColor: dep.type === "pr" ? "#3b82f6" : dep.type === "discussion" ? "#a78bfa" : "#20c997",
                  }}
                />
                <span>{dep.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {issue.commentCount !== undefined && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Comments</h3>
          <p style={styles.commentCount}>{issue.commentCount} comments found</p>
        </div>
      )}

      {issue.url && (
        <a href={issue.url} target="_blank" rel="noopener noreferrer" style={styles.viewOnGitHub}>
          View on GitHub
        </a>
      )}
    </aside>
  )
}

const styles = {
  detailPanel: {
    width: "350px",
    backgroundColor: "#1a2332",
    borderLeft: "1px solid #2a3f5f",
    padding: "30px 20px",
    overflowY: "auto",
  },
  emptyState: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    padding: "40px 20px",
  },
  issueNumber: {
    color: "#999",
    fontSize: "14px",
    marginBottom: "10px",
  },
  issueTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "30px",
    lineHeight: "1.4",
  },
  section: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "12px",
  },
  summaryText: {
    fontSize: "14px",
    color: "#c0c0c0",
    lineHeight: "1.6",
  },
  status: {
    fontSize: "14px",
    color: "#20c997",
    fontWeight: "500",
  },
  commentCount: {
    fontSize: "14px",
    color: "#c0c0c0",
  },
  dependenciesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  dependency: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    padding: "8px",
    backgroundColor: "#0f1419",
    borderRadius: "4px",
    color: "#e0e0e0",
  },
  depDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  viewOnGitHub: {
    display: "block",
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
}
