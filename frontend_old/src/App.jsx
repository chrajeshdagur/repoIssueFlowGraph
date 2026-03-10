"use client"

import { useState } from "react"
import Header from "./components/header"
import Sidebar from "./components/sidebar"
import GraphVisualization from "./components/graph-visualization"
import IssueDetail from "./components/issue-detail"
import Footer from "./components/footer"
import {
  fetchIssues,
  fetchPullRequests,
  fetchDiscussions,
  fetchIssueWithComments,
  buildTreeFromData,
  buildTreeFromBacklinks,
  parseRepositoryUrl,
} from "./utils/github-api"
import "./App.css"

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [issuesList, setIssuesList] = useState([])
  const [selectedIssueId, setSelectedIssueId] = useState(null)

  const [filters, setFilters] = useState({
    issues: true,
    prs: true,
    discussions: true,
    timeRange: "All",
  })

  const [treeData, setTreeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentRepo, setCurrentRepo] = useState("vercel/next.js")
  const [allPRs, setAllPRs] = useState([])
  const [allDiscussions, setAllDiscussions] = useState([])

  const handleRepositoryChange = async (repoInput, token) => {
    const parsed = parseRepositoryUrl(repoInput)
    if (!parsed) {
      setError("Invalid repository format. Use owner/repo or GitHub URL")
      return
    }

    const { owner, repo } = parsed
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Fetching data for", owner + "/" + repo)
      const [issues, prs, discussions] = await Promise.all([
        fetchIssues(owner, repo, token),
        fetchPullRequests(owner, repo, token),
        fetchDiscussions(owner, repo, token),
      ])

      console.log("[v0] Issues:", issues.length, "PRs:", prs.length, "Discussions:", discussions.length)

      setIssuesList(issues)
      setAllPRs(prs)
      setAllDiscussions(discussions)
      setCurrentRepo(`${owner}/${repo}`)

      // Set first issue as default selected and generate tree
      if (issues.length > 0) {
        const firstIssue = issues[0]
        setSelectedIssueId(firstIssue.id)

        const tree = buildTreeFromData([firstIssue], prs, discussions)
        setTreeData(tree)

        setSelectedNode({
          id: firstIssue.id,
          title: firstIssue.name,
          type: "issue",
          summary: firstIssue.body,
          dependencies: prs.slice(0, 3),
          suggestedFix: "View on GitHub",
          reviewer: firstIssue.url,
        })
      }
    } catch (err) {
      console.error("[v0] Error loading repository:", err)
      setError(`Failed to load repository: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIssueLoad = async (issuePathInput, token) => {
    try {
      setIsLoading(true)
      setError(null)

      // Parse issue path format: owner/repo#123
      const parts = issuePathInput.split("#")
      if (parts.length !== 2) {
        throw new Error("Invalid format. Use: owner/repo#123")
      }

      const repoPath = parts[0]
      const issueNumber = Number.parseInt(parts[1])

      const parsed = parseRepositoryUrl(repoPath)
      if (!parsed) {
        throw new Error("Invalid repository path")
      }

      const { owner, repo } = parsed

      console.log("[v0] Fetching issue #" + issueNumber + " from " + owner + "/" + repo)

      // Fetch the main issue with its comments
      const { issue, backlinks, comments } = await fetchIssueWithComments(owner, repo, issueNumber, token)

      console.log("[v0] Found " + backlinks.length + " backlinks in issue comments")

      // Build tree from backlinks
      const tree = await buildTreeFromBacklinks(issue, backlinks, token, owner, repo)

      setTreeData(tree)

      // Set selected node to main issue
      setSelectedNode({
        id: issue.id,
        title: issue.name,
        type: issue.type,
        summary: issue.body,
        dependencies: tree.children || [],
        state: issue.state,
        url: issue.url,
        commentCount: comments.length,
      })
    } catch (err) {
      console.error("[v0] Error loading issue:", err)
      setError(err.message)
      setTreeData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIssueSelect = (issue) => {
    setSelectedIssueId(issue.id)

    // Generate tree with selected issue as root
    const tree = buildTreeFromData([issue], allPRs, allDiscussions)
    setTreeData(tree)

    setSelectedNode({
      id: issue.id,
      title: issue.name,
      type: "issue",
      summary: issue.body,
      dependencies: allPRs.slice(0, 3),
      suggestedFix: "View on GitHub",
      reviewer: issue.url,
    })
  }

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData)
  }

  return (
    <div className="app-container">
      <Header />
      {error && (
        <div style={{ padding: "10px 20px", backgroundColor: "#7f1d1d", color: "#fca5a5", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}
      <div className="main-layout">
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          onRepositoryChange={handleRepositoryChange}
          onIssueLoad={handleIssueLoad}
          issues={issuesList}
          selectedIssueId={selectedIssueId}
          onIssueSelect={handleIssueSelect}
          isLoading={isLoading}
          error={error}
        />
        <div className="center-section">
          <GraphVisualization
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id}
            treeData={treeData}
            isLoading={isLoading}
            filters={filters}
          />
        </div>
        <IssueDetail issue={selectedNode} />
      </div>
      <Footer />
    </div>
  )
}
