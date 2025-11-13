export default function IssueDetail({ issue }) {
  return (
    <aside style={styles.detailPanel}>
      <div style={styles.issueNumber}>Issue {issue.id}</div>
      <h2 style={styles.issueTitle}>{issue.title}</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Summary</h3>
        <p style={styles.summaryText}>{issue.summary}</p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Dependencies</h3>
        {issue.dependencies.map((dep) => (
          <div key={dep.id} style={styles.dependency}>
            <div
              style={{
                ...styles.depDot,
                backgroundColor: dep.type === "pr" ? "#3b82f6" : "#a78bfa",
              }}
            />
            <span>{dep.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Suggested Fix</h3>
        <code style={styles.code}>{issue.suggestedFix}</code>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Reviewer</h3>
        <p style={styles.reviewer}>{issue.reviewer}</p>
      </div>

      <button style={styles.analyzeBtn}>Analyze Repository</button>
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
  dependency: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  depDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  code: {
    display: "block",
    backgroundColor: "#0f1419",
    padding: "12px",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "13px",
    fontFamily: "Courier New, monospace",
    overflow: "auto",
  },
  reviewer: {
    fontSize: "14px",
    color: "#c0c0c0",
  },
  analyzeBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
}
