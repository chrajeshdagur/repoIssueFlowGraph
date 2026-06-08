import { useState, useEffect, useRef } from "react"
import "../styles/header.css"

export default function Header() {

  const [repoInput, setRepoInput] = useState("📌 Sample Data Loaded")

  const handleLoadRepo = async () => {
    if (!repoInput.trim()) {
      setError("Enter repo or URL")
      return
    }
    setLoading(true)
    setError("")

    try {
      const urlMatch = repoInput.match(/github\.com\/([^/]+)\/([^/]+)/)
      const [owner, repo] = urlMatch ? [urlMatch[1], urlMatch[2].split("/")[0]] : repoInput.split("/")

      if (!owner || !repo) throw new Error("Invalid format")

      let page = 1
      const issues = []
      let count = 0
      const MAX = 25

      while (count < MAX) {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=20&page=${page}`,
        )
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        if (!data.length) break

        data.forEach((item) => {
          if (count >= MAX) return
          issues.push({
            node_type: item.pull_request ? "pr" : "issue",
            node_id: item.number,
            title: item.title,
            created_at: item.created_at,
            state: item.state,
            comment_count: item.comments,
            labels: item.labels.map((l) => l.name),
            last_activity: item.updated_at,
          })
          count++
        })
        page++
      }

      if (!issues.length) throw new Error("No issues found")

      const refs = []
      const refRegex = /#(\d+)/g
      issues.forEach((issue) => {
        let match
        const searchText = issue.title + " " + (issue.body || "")
        while ((match = refRegex.exec(searchText)) !== null) {
          const refNum = Number.parseInt(match[1])
          if (refNum !== issue.node_id) {
            refs.push({
              src_type: issue.node_type,
              src: issue.node_id,
              tgt_type: "issue",
              tgt: refNum,
              origin: "comment",
              ref_type: "mentions",
              depth: 1,
            })
          }
        }
      })

      const newData = { nodes: issues, refs }
      setGraphData(newData)
      renderGraph(newData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSample = () => {
    setGraphData(SAMPLE_DATA)
    setRepoInput("📌 Sample: Auth System")
    setError("")
    renderGraph(SAMPLE_DATA)
  }  

  return (
    <div className="repograph-container">
      <div className="repograph-input-section">
        <div className="input-row">
          <input type="text" className="input-field" placeholder="Enter owner/repo OR GitHub Issue/PR URL" /> 
          <input type="text" className="input-field" placeholder="Enter owner/repo OR GitHub Issue/PR URL" value={repoInput} onChange={(e) => setRepoInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleLoadRepo()} /> 
          <button className="btn" > Load Graph </button> 
          <button className="btn secondary small" > 📌 Load Sample </button>
        </div>
        <div className="input-info">
          💡 Enter: <code>owner/repo</code> (e.g., <code>torvalds/linux</code>) or a direct issue/PR URL like <code>https://github.com/owner/repo/issues/123</code>, Public repos only (no auth needed).
        </div>
      </div>
      </div>
  )
}

