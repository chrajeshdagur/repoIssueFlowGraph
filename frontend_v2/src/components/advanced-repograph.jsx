"use client"

import { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { SAMPLE_DATA } from "../utils/sample-data"
import {
  getColorByLabel,
  getActivityHeat,
  calculateStats,
  buildNodeMap,
  processLinks,
  calculateDegrees,
  calculateDepth,
  calculateCriticalPath,
} from "../utils/graph-utils"
import "../styles/advanced-repograph.css"

const AdvancedRepoGraph = () => {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [graphData, setGraphData] = useState(SAMPLE_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [repoInput, setRepoInput] = useState("📌 Sample Data Loaded")
  const [filters, setFilters] = useState({ issues: true, prs: true })
  const [layoutMode, setLayoutMode] = useState("timeline")
  const [colorScheme, setColorScheme] = useState("type")
  const [dateFormat, setDateFormat] = useState("MM-DD-YY")
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true)
  const [stats, setStats] = useState({})
  const [gravityWells, setGravityWells] = useState([])
  const [criticalPathLength, setCriticalPathLength] = useState(0)

  const zoomBehaviorRef = useRef(null)
  const gRef = useRef(null)
  const svgGroupRef = useRef(null)

  useEffect(() => {
    renderGraph(graphData)
  }, [])

  const renderGraph = (data) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const cWidth = container.parentElement.clientWidth
    const cHeight = container.parentElement.clientHeight - 50
    const margin = { top: 40, right: 20, bottom: 20, left: 60 }
    const width = cWidth - margin.left - margin.right
    const height = cHeight - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current).attr("width", cWidth).attr("height", cHeight)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    gRef.current = g
    svgGroupRef.current = svg

    const nodeMap = buildNodeMap(data.nodes)
    const nodes = Array.from(nodeMap.values())

    const links = processLinks(data, nodeMap)
    calculateDegrees(nodes, links)
    calculateDepth(nodes, links)
    const critPath = calculateCriticalPath(nodes, links)
    setCriticalPathLength(critPath)

    // Filter nodes and links
    const filteredNodes = nodes.filter((n) => {
      if (n.node_type === "issue" && !filters.issues) return false
      if (n.node_type === "pr" && !filters.prs) return false
      return true
    })

    const filteredLinks = links.filter((l) => filteredNodes.includes(l.source) && filteredNodes.includes(l.target))

    const stats = calculateStats(filteredNodes, filteredLinks)
    setStats(stats)

    const gravityWells = filteredNodes
      .filter((n) => n.inDegree > 0)
      .sort((a, b) => b.inDegree - a.inDegree)
      .slice(0, 5)
    setGravityWells(gravityWells)

    // Positioning based on layout
    const timeScale = d3
      .scaleTime()
      .domain([
        d3.timeDay.offset(
          d3.min(filteredNodes, (d) => d.created_dt),
          -0.5,
        ),
        d3.timeDay.offset(
          d3.max(filteredNodes, (d) => d.created_dt),
          0.5,
        ),
      ])
      .range([0, Math.max(width, 1200)])

    if (layoutMode === "timeline") {
      filteredNodes.forEach((n) => {
        n.x = timeScale(n.created_dt)
        n.y = n.node_type === "pr" ? 60 : 140 + (n.depth || 0) * 160
      })
    } else if (layoutMode === "hierarchical") {
      const levelMap = new Map()
      filteredNodes.forEach((n) => {
        const level = n.node_type === "pr" ? 0 : n.depth || 0
        if (!levelMap.has(level)) levelMap.set(level, [])
        levelMap.get(level).push(n)
      })

      let yPos = 60
      levelMap.forEach((lvlNodes) => {
        const xStep = width / (lvlNodes.length + 1)
        lvlNodes.forEach((n, i) => {
          n.x = (i + 1) * xStep
          n.y = yPos
        })
        yPos += 180
      })
    } else if (layoutMode === "cluster") {
      const clusters = new Map()
      filteredNodes.forEach((n) => {
        const clusterKey = n.labels?.[0] || "default"
        if (!clusters.has(clusterKey)) clusters.set(clusterKey, [])
        clusters.get(clusterKey).push(n)
      })

      let clusterY = 60
      let clusterX = 0
      clusters.forEach((clusterNodes) => {
        const xStep = width / (clusterNodes.length + 1)
        clusterNodes.forEach((n, i) => {
          n.x = clusterX + (i + 1) * xStep
          n.y = clusterY + Math.random() * 100 - 50
        })
        clusterX += width / 2
        if (clusterX > width) {
          clusterX = 0
          clusterY += 220
        }
      })
    }

    // Render links
    const linkSelection = g
      .selectAll(".link")
      .data(filteredLinks)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)

    // Render nodes
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(filteredNodes, (d) => d.inDegree + d.outDegree) || 1])
      .range([8, 24])

    const nodeGs = g
      .selectAll(".node")
      .data(filteredNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)

    nodeGs
      .append((d) => {
        if (d.node_type === "pr") {
          return document.createElementNS("http://www.w3.org/2000/svg", "rect")
        } else {
          return document.createElementNS("http://www.w3.org/2000/svg", "circle")
        }
      })
      .attr("r", (d) => (d.node_type === "issue" ? sizeScale(d.inDegree + d.outDegree) : null))
      .attr("width", (d) => (d.node_type === "pr" ? sizeScale(d.inDegree + d.outDegree) * 1.8 : null))
      .attr("height", (d) => (d.node_type === "pr" ? sizeScale(d.inDegree + d.outDegree) * 1.8 : null))
      .attr("x", (d) => (d.node_type === "pr" ? -sizeScale(d.inDegree + d.outDegree) * 0.9 : null))
      .attr("y", (d) => (d.node_type === "pr" ? -sizeScale(d.inDegree + d.outDegree) * 0.9 : null))
      .attr("rx", 4)
      .attr("fill", (d) => {
        if (colorScheme === "category" && d.labels?.[0]) return getColorByLabel(d.labels[0])
        if (colorScheme === "activity" && showHeatmap) return getActivityHeat(d.last_dt)
        return d.node_type === "pr" ? "#3fb950" : "#0969da"
      })
      .attr("stroke", (d) =>
        d.state === "merged"
          ? "#8957e5"
          : d.state === "closed"
            ? "#6e7681"
            : d.node_type === "pr"
              ? "#238636"
              : "#0550ae",
      )
      .attr("stroke-width", 2)

    // State indicator
    nodeGs
      .append("circle")
      .attr("r", 5.5)
      .attr("cx", (d) => sizeScale(d.inDegree + d.outDegree) + 8)
      .attr("cy", (d) => -sizeScale(d.inDegree + d.outDegree) - 8)
      .attr("fill", (d) => ({ open: "#3fb950", closed: "#6e7681", merged: "#8957e5" })[d.state] || "#6e7681")
      .attr("stroke", "#0d1117")
      .attr("stroke-width", 2)

    // Degree ring
    nodeGs
      .append("circle")
      .attr("r", (d) => sizeScale(d.inDegree + d.outDegree) + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => (d.inDegree > 5 ? "#f85149" : d.inDegree > 2 ? "#ffd93d" : "#30363d"))
      .attr("stroke-width", 1)
      .attr("opacity", 0.6)

    // Node labels
    nodeGs
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", 13)
      .attr("font-weight", 600)
      .text((d) => `${d.node_type === "pr" ? "PR" : "#"}${d.node_id}`)

    // Metrics badges
    if (showMetrics) {
      nodeGs
        .append("text")
        .attr("x", (d) => sizeScale(d.inDegree + d.outDegree) + 16)
        .attr("y", -12)
        .attr("fill", "#8b949e")
        .attr("font-size", 10)
        .text((d) => `💬${d.comment_count} 🔗${d.inDegree + d.outDegree}`)
    }

    // Hover tooltip
    const tooltip = d3.select("body").select("#tooltip")
    nodeGs.on("mouseover", (ev, d) => {
      const stateEmoji = { open: "🟢", closed: "⚫", merged: "🔵" }[d.state] || "•"
      tooltip.style("display", "block").html(
        `<div class="tooltip-title">${d.node_type === "pr" ? "📋 PR" : "📌 Issue"} #${d.node_id}</div>
          <div style="margin: 8px 0; font-weight: 500; color: #e6edf3; font-size: 12px; line-height: 1.4;">${d.title}</div>
          <div style="border-top: 1px solid #30363d; padding-top: 8px; font-size: 11px;">
            <div class="tooltip-row"><span>State:</span> <strong>${stateEmoji} ${d.state}</strong></div>
            <div class="tooltip-row"><span>Comments:</span> <strong>${d.comment_count}</strong></div>
            <div class="tooltip-row"><span>In-Degree:</span> <strong>${d.inDegree}</strong></div>
            <div class="tooltip-row"><span>Out-Degree:</span> <strong>${d.outDegree}</strong></div>
            <div class="tooltip-row"><span>Depth:</span> <strong>${d.depth >= 0 ? d.depth : "PR"}</strong></div>
            ${d.labels?.length ? `<div style="margin-top: 6px;"><strong>Labels:</strong><br>${d.labels.map((l) => `<span style="background: #30363d; padding: 2px 6px; border-radius: 3px; display: inline-block; margin: 2px 2px 0 0; font-size: 10px;">${l}</span>`).join("")}</div>` : ""}
          </div>`,
      )
    })

    nodeGs.on("mousemove", (ev) => {
      tooltip.style("left", ev.pageX + 12 + "px").style("top", ev.pageY + 12 + "px")
    })

    nodeGs.on("mouseout", () => {
      tooltip.style("display", "none")
    })

    // Zoom behavior
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    zoomBehaviorRef.current = zoomBehavior
    svg.call(zoomBehavior)
  }

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

  const handleZoom = (scale) => {
    if (svgGroupRef.current && zoomBehaviorRef.current) {
      d3.select(svgGroupRef.current).transition().duration(100).call(zoomBehaviorRef.current.scaleBy, scale)
    }
  }

  const handleResetZoom = () => {
    if (svgGroupRef.current && zoomBehaviorRef.current) {
      d3.select(svgGroupRef.current)
        .transition()
        .duration(100)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(60, 40))
    }
  }

  const handleFilterChange = (type) => {
    const newFilters = { ...filters, [type]: !filters[type] }
    setFilters(newFilters)
    renderGraph(graphData)
  }

  const handleLayoutChange = (e) => {
    setLayoutMode(e.target.value)
    renderGraph(graphData)
  }

  const handleColorSchemeChange = (e) => {
    setColorScheme(e.target.value)
    renderGraph(graphData)
  }

  const handleMetricsToggle = () => {
    setShowMetrics(!showMetrics)
    renderGraph(graphData)
  }

  const handleHeatmapToggle = () => {
    setShowHeatmap(!showHeatmap)
    renderGraph(graphData)
  }

  return (
    <div className="repograph-container">
      <div className="repograph-input-section">
        <div className="input-row">
          <input
            type="text"
            className="input-field"
            placeholder="owner/repo (e.g., facebook/react) OR GitHub Issue/PR URL"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLoadRepo()}
          />
          <button className="btn" onClick={handleLoadRepo}>
            Load Graph
          </button>
          <button className="btn secondary small" onClick={handleLoadSample}>
            📌 Load Sample
          </button>
        </div>
        <div className="input-info">
          💡 Enter: <code>owner/repo</code> (e.g., <code>torvalds/linux</code>) or a direct issue/PR URL like <code>https://github.com/owner/repo/issues/123</code>, Public repos only (no auth needed).
        </div>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      <div className="main-layout">
        <div className="canvas-wrapper">
          <div className="canvas-toolbar">
            <div className="zoom-controls">
              <button className="btn small" onClick={() => handleZoom(1.3)}>🔍+ </button>
              <button className="btn small" onClick={() => handleZoom(0.77)}>🔍- </button>
              <button className="btn small secondary" onClick={handleResetZoom}>⟲ Reset</button>
            </div>
            <select value={layoutMode} onChange={handleLayoutChange} className="select-control">
              <option value="timeline">Timeline</option>
              <option value="hierarchical">Hierarchical</option>
              <option value="cluster">Cluster</option>
            </select>
            <select value={colorScheme} onChange={handleColorSchemeChange} className="select-control">
              <option value="type">By Type</option>
              <option value="category">By Category</option>
              <option value="activity">By Activity</option>
            </select>
          </div>
          <div id="chartContainer" ref={containerRef} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading repository data...</p>
              </div>
            ) : (
              <svg ref={svgRef}></svg>
            )}
          </div>
        </div>

        <div className="controls-panel">
          <div className="control-group">
            <label className="control-label">Filters</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" checked={filters.issues} onChange={() => handleFilterChange("issues")} />
                Issues
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={filters.prs} onChange={() => handleFilterChange("prs")} />
                Pull Requests
              </label>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Display Options</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" checked={showMetrics} onChange={handleMetricsToggle} />
                Show Metrics
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={showHeatmap} onChange={handleHeatmapToggle} />
                Activity Heatmap
              </label>
            </div>
          </div>

          <div className="stats-info">
            <div className="stat-item">
              <span>Issues:</span>
              <strong>{stats.issues || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Pull Requests:</span>
              <strong>{stats.prs || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Total Links:</span>
              <strong>{stats.links || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Avg Degree:</span>
              <strong>{stats.avgDegree || "0"}</strong>
            </div>
            <div className="stat-item">
              <span>Critical Path:</span>
              <strong>{criticalPathLength}</strong>
            </div>
            <div className="stat-item">
              <span>Density:</span>
              <strong>{stats.density || "0"}%</strong>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Top Gravity Wells</label>
            <div id="gravityWells" className="gravity-wells">
              {gravityWells.map((well) => (
                <div key={`${well.node_type}|${well.node_id}`} className="gravity-well-item">
                  <strong>
                    {well.node_type === "pr" ? "PR" : "#"}
                    {well.node_id}
                  </strong>
                  <br />
                  {well.title.substring(0, 35)}...
                  <br />🔗 {well.inDegree} backlinks
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="tooltip" className="tooltip"></div>
    </div>
  )
}

export default AdvancedRepoGraph
