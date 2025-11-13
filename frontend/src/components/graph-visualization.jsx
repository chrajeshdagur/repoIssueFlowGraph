"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export default function GraphVisualization({ onNodeClick, selectedNodeId, treeData, isLoading, filters }) {
  const svgRef = useRef()
  const zoomRef = useRef(null)

  const data = treeData || {
    name: "Issue #102",
    id: "#102",
    type: "issue",
    children: [
      {
        name: "PR #205",
        id: "#205",
        type: "pr",
        children: [
          {
            name: "Code Review",
            id: "review-1",
            type: "discussion",
          },
        ],
      },
      {
        name: "Discussion #03",
        id: "#03",
        type: "discussion",
      },
    ],
  }

  const getNodeColor = (type) => {
    const colors = {
      issue: "#20c997",
      pr: "#3b82f6",
      discussion: "#a78bfa",
      default: "#9ca3af",
    }
    return colors[type] || colors.default
  }

  const filterNodes = (node) => {
    if (node.type === "issue" && !filters.issues) return false
    if (node.type === "pr" && !filters.prs) return false
    if (node.type === "discussion" && !filters.discussions) return false
    return true
  }

  const getFilteredTree = (node) => {
    if (!filterNodes(node)) return null

    const filteredChildren = (node.children || [])
      .map((child) => getFilteredTree(child))
      .filter((child) => child !== null)

    return {
      ...node,
      children: filteredChildren,
    }
  }

  const filteredData = getFilteredTree(data)

  useEffect(() => {
    if (!svgRef.current || !filteredData) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("class", "main-group")

    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform)
    })

    zoomRef.current = zoom
    svg.call(zoom)

    // Create tree layout
    const tree = d3.tree().size([width - 200, height - 200])
    const root = d3.hierarchy(filteredData)
    const treeData = tree(root)

    const nodes_array = treeData.descendants()
    const xs = nodes_array.map((d) => d.x)
    const ys = nodes_array.map((d) => d.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const treeWidth = maxX - minX
    const treeHeight = maxY - minY

    // Center the tree in the middle of the SVG
    const offsetX = width / 2 - (minX + treeWidth / 2)
    const offsetY = height / 2 - (minY + treeHeight / 2)
    const initialTransform = d3.zoomIdentity.translate(offsetX, offsetY)

    svg.call(zoom.transform, initialTransform)

    const links = g
      .selectAll("line")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "#2a3f5f")
      .attr("stroke-width", 2)

    const nodes = g
      .selectAll("circle")
      .data(treeData.descendants())
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 30)
      .attr("fill", (d) => getNodeColor(d.data.type))
      .attr("stroke", (d) => (d.data.id === selectedNodeId ? "#ffffff" : "none"))
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onNodeClick({
          id: d.data.id,
          title: d.data.name,
          type: d.data.type,
          summary: d.data.summary || `Details about ${d.data.name}...`,
          dependencies: d.data.children || [],
          url: d.data.url || "#",
        })
      })
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("opacity", 0.8)
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).attr("opacity", 1)
      })

    const labels = g
      .selectAll("text")
      .data(treeData.descendants())
      .enter()
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d) => d.data.name)
  }, [onNodeClick, selectedNodeId, filteredData, filters])

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().duration(100).call(zoomRef.current.scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().duration(100).call(zoomRef.current.scaleBy, 0.7)
  }

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const nodes_array = d3.selectAll("circle").data()
    const xs = nodes_array.map((d) => d.x)
    const ys = nodes_array.map((d) => d.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const treeWidth = maxX - minX
    const treeHeight = maxY - minY

    const offsetX = width / 2 - (minX + treeWidth / 2)
    const offsetY = height / 2 - (minY + treeHeight / 2)
    const initialTransform = d3.zoomIdentity.translate(offsetX, offsetY)

    d3.select(svgRef.current).transition().duration(100).call(zoomRef.current.transform, initialTransform)
  }

  if (isLoading) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#0f1419",
            borderRadius: "8px",
          }}
        />
        <div style={{ position: "absolute", color: "#e0e0e0", fontSize: "16px" }}>Loading issue data...</div>
      </div>
    )
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0f1419",
          borderRadius: "8px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          gap: "8px",
          flexDirection: "column",
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            padding: "8px 12px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
        >
          + Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            padding: "8px 12px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
        >
          - Zoom Out
        </button>
        <button
          onClick={handleResetZoom}
          style={{
            padding: "8px 12px",
            backgroundColor: "#6b7280",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#4b5563")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#6b7280")}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
