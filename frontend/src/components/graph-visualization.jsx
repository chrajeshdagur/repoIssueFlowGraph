"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export default function GraphVisualization({ onNodeClick, selectedNodeId }) {
  const svgRef = useRef()

  const data = {
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

  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`)

    const tree = d3.tree().size([width - 100, height - 100])
    const root = d3.hierarchy(data)
    const treeData = tree(root)

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
          summary: `Details about ${d.data.name}...`,
          dependencies: d.data.children || [],
          suggestedFix: "Modify src/api/auth.js",
          reviewer: "@rajesh-dagur",
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
  }, [onNodeClick, selectedNodeId])

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0f1419",
        borderRadius: "8px",
      }}
    />
  )
}
