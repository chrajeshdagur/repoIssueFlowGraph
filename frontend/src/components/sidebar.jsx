"use client"

import { useState } from "react"

export default function Sidebar({ filters, setFilters, onIssueLoad, isLoading, error }) {
  const [issueInput, setIssueInput] = useState("vercel/next.js#102")
  const [githubToken, setGithubToken] = useState("")
  const [showTokenInput, setShowTokenInput] = useState(false)

  const handleLoadIssue = () => {
    onIssueLoad(issueInput, githubToken)
  }

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }))
  }

  return (
    <aside style={styles.sidebar}>
      {/* Issue Path Input Section */}
      <div style={styles.section}>
        <h2 style={styles.title}>Issue Path</h2>
        <input
          type="text"
          placeholder="owner/repo#123"
          value={issueInput}
          onChange={(e) => setIssueInput(e.target.value)}
          style={styles.searchInput}
        />

        <button
          onClick={handleLoadIssue}
          disabled={isLoading}
          style={{
            ...styles.loadButton,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Loading..." : "Load Issue"}
        </button>

        <button onClick={() => setShowTokenInput(!showTokenInput)} style={styles.tokenToggle}>
          {showTokenInput ? "Hide Token" : "Add Token"}
        </button>

        {showTokenInput && (
          <input
            type="password"
            placeholder="GitHub Personal Access Token (optional)"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            style={styles.tokenInput}
          />
        )}

        {error && <div style={styles.errorMessage}>{error}</div>}
      </div>

      {/* Filters Section */}
      <div style={styles.section}>
        <h2 style={styles.title}>Filters</h2>

        <div style={styles.filterGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.issues}
              onChange={() => handleFilterChange("issues")}
              style={styles.checkbox}
            />
            Issues
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.prs}
              onChange={() => handleFilterChange("prs")}
              style={styles.checkbox}
            />
            Pull Requests
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.discussions}
              onChange={() => handleFilterChange("discussions")}
              style={styles.checkbox}
            />
            Discussions
          </label>
        </div>
      </div>

      {/* Legend Section */}
      <div style={styles.section}>
        <h2 style={styles.title}>Legend</h2>
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
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: "350px",
    backgroundColor: "#1a2332",
    borderRight: "1px solid #2a3f5f",
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  section: {
    paddingBottom: "20px",
    borderBottom: "1px solid #2a3f5f",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#ffffff",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "13px",
    marginBottom: "8px",
    boxSizing: "border-box",
  },
  loadButton: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "background-color 0.2s",
  },
  tokenToggle: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#2a3f5f",
    color: "#e0e0e0",
    border: "1px solid #3a4f6f",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    marginBottom: "8px",
  },
  tokenInput: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "12px",
    boxSizing: "border-box",
    marginBottom: "8px",
  },
  errorMessage: {
    color: "#fca5a5",
    fontSize: "12px",
    padding: "8px",
    backgroundColor: "#7f1d1d",
    borderRadius: "4px",
    marginTop: "8px",
  },
  filterGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#e0e0e0",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#3b82f6",
  },
  legendGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#e0e0e0",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
}
