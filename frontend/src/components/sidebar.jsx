export default function Sidebar({ filters, setFilters }) {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.title}>Filters</h2>

      <div style={styles.searchContainer}>
        <input type="text" placeholder="Search Repository..." style={styles.searchInput} />
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked style={styles.checkbox} />
          Issues
        </label>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked style={styles.checkbox} />
          Pull Requests
        </label>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked style={styles.checkbox} />
          Discussions
        </label>
      </div>

      <div style={styles.timeRangeGroup}>
        <h3 style={styles.groupTitle}>Time Range</h3>
        <select style={styles.select}>
          <option>All</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <div style={styles.legendGroup}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: "#20c997" }} />
          Open Issues
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: "#3b82f6" }} />
          Merged PRs
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: "#a78bfa" }} />
          Discussions
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: "#9ca3af" }} />
          Closed Nodes
        </div>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: "350px",
    backgroundColor: "#1a2332",
    borderRight: "1px solid #2a3f5f",
    padding: "30px 20px",
    overflowY: "auto",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#ffffff",
  },
  searchContainer: {
    marginBottom: "30px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 15px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "14px",
  },
  filterGroup: {
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#3b82f6",
  },
  timeRangeGroup: {
    marginBottom: "30px",
  },
  groupTitle: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#e0e0e0",
  },
  select: {
    width: "100%",
    padding: "10px 15px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    cursor: "pointer",
  },
  legendGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
}
