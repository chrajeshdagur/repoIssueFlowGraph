"use client"

import { useState } from "react"
import Header from "./components/header"
import Sidebar from "./components/sidebar"
import GraphVisualization from "./components/graph-visualization"
import IssueDetail from "./components/issue-detail"
import Footer from "./components/footer"
import "./App.css"

export default function App() {
  const [selectedNode, setSelectedNode] = useState({
    id: "#102",
    title: "Improve Authentication API",
    type: "issue",
    summary:
      "This issue focuses on efactoring and securing the authentication API to enhance performance and security.",
    dependencies: [
      { id: "#205", type: "pr", label: "PR #205" },
      { id: "#103", type: "discussion", label: "Discussion #103" },
    ],
    suggestedFix: "Modify src/api/auth.js",
    reviewer: "@rajesh-dagur",
  })

  const [filters, setFilters] = useState({
    issues: true,
    prs: true,
    discussions: true,
    timeRange: "All",
  })

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData)
  }

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar filters={filters} setFilters={setFilters} />
        <div className="center-section">
          <GraphVisualization onNodeClick={handleNodeClick} selectedNodeId={selectedNode.id} />
        </div>
        <IssueDetail issue={selectedNode} />
      </div>
      <Footer />
    </div>
  )
}
