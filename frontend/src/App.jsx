"use client"
import Navbar from "./components/navbar"
import Header from "./components/header"
import AdvancedRepoGraph from "./components/advanced-repograph"
import AdvancedRepoGraph2 from "./components/advanced-repograph2"
import AdvancedRepoGraph3 from "./components/advanced-repograph3"
import AdvancedRepoGraph4 from "./components/advanced-repograph4"
import AISummary from "./components/ai-summary"
import Footer from "./components/footer"
import "./App.css"

export default function App() {
  // All state management is now handled within AdvancedRepoGraph for better component encapsulation
  // console.log("[v0] App component rendering")
  return (
    <div className="app-container">
      <Navbar />
      <Header />
      <AdvancedRepoGraph />
      <AdvancedRepoGraph2 />
      <AdvancedRepoGraph3 />
      <AdvancedRepoGraph4 />
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