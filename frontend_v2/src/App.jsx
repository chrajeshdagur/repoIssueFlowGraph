"use client"
import Navbar from "./components/navbar"
import Header from "./components/header"
import AdvancedRepoGraph from "./components/advanced-repograph"
import AISummary from "./components/ai-summary"
import Footer from "./components/footer"
import "./App.css"

export default function App() {
  // All state management is now handled within AdvancedRepoGraph for better component encapsulation
  // console.log("[v0] App component rendering")
  return (
    <div className="app-container">
      <Navbar />
      <AdvancedRepoGraph />
      <AISummary />
      <Footer />
    </div>
  )
}

/*
const {
  fetchIssues,
  fetchPullRequests,
  fetchDiscussions,
  fetchIssueWithComments,
  buildTreeFromData,
  buildTreeFromBacklinks,
  parseRepositoryUrl,
} = window.githubApi
*/