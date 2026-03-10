"use client"

import { useState } from "react"

export default function RepositorySelector({ onRepositoryChange, isLoading }) {
  const [repoInput, setRepoInput] = useState("vercel/next.js")
  const [token, setToken] = useState("")
  const [showTokenInput, setShowTokenInput] = useState(false)

  const handleSearch = () => {
    if (repoInput.trim()) {
      onRepositoryChange(repoInput.trim(), token || null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter repo (owner/repo or GitHub URL)"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
          disabled={isLoading}
        />
        <button onClick={handleSearch} style={styles.searchButton} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load Repository"}
        </button>
      </div>

      <button onClick={() => setShowTokenInput(!showTokenInput)} style={styles.tokenToggle}>
        {showTokenInput ? "Hide" : "Add"} GitHub Token
      </button>

      {showTokenInput && (
        <input
          type="password"
          placeholder="GitHub Personal Access Token (optional)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={styles.tokenInput}
        />
      )}

      <p style={styles.hint}>
        💡 Use a GitHub token for higher rate limits and access to private repos. Create one at{" "}
        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
          github.com/settings/tokens
        </a>
      </p>
    </div>
  )
}

const styles = {
  container: {
    padding: "15px 20px",
    backgroundColor: "#1a2332",
    borderBottom: "1px solid #2a3f5f",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "14px",
  },
  searchButton: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  tokenToggle: {
    padding: "8px 12px",
    backgroundColor: "#2a3f5f",
    color: "#e0e0e0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  tokenInput: {
    padding: "10px 15px",
    backgroundColor: "#0f1419",
    border: "1px solid #2a3f5f",
    borderRadius: "6px",
    color: "#e0e0e0",
    fontSize: "12px",
  },
  hint: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
}
