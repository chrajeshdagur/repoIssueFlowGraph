/**
 * advanced-repograph.jsx
 *
 * Clean, modern React + D3 component implementing the enhanced RepoGraph UI:
 * - Sidebar tabs: Filters / Display / Analytics
 * - Timeline multi-depth graph (issues + PR swimlane)
 * - Filters, depth slider, critical path, clusters, analytics (gravity wells)
 *
 * Usage:
 *   import AdvancedRepoGraph from './advanced-repograph.jsx';
 *   <AdvancedRepoGraph />
 *
 * Dependencies: react, d3
 *
 * Note: This component expects CSS similar to repograph_enhanced_v1.html.
 * You can reuse that CSS or adapt your own styles.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

/* --------------------------
   Sample data (from HTML)
   -------------------------- */
const SAMPLE_DATA = {
  nodes: [
    { node_type: "issue", node_id: 12, title: "[EPIC] Implement login system", created_at: "2025-09-01T10:00:00Z", state: "open", comment_count: 24, labels: ["feature","epic"], last_activity: "2025-09-07T10:00:00Z" },
    { node_type: "issue", node_id: 23, title: "Add JWT authentication", created_at: "2025-09-02T11:30:00Z", state: "open", comment_count: 6, labels: ["backend","auth"], last_activity: "2025-09-07T09:00:00Z" },
    { node_type: "issue", node_id: 78, title: "Handle session edge cases", created_at: "2025-09-03T08:15:00Z", state: "open", comment_count: 12, labels: ["bug","auth"], last_activity: "2025-09-05T14:00:00Z" },
    { node_type: "issue", node_id: 66, title: "Fix stale cookie vulnerability", created_at: "2025-09-04T09:00:00Z", state: "closed", comment_count: 8, labels: ["security","bug"], last_activity: "2025-09-06T12:00:00Z" },
    { node_type: "issue", node_id: 13, title: "Add password reset flow", created_at: "2025-09-05T12:30:00Z", state: "open", comment_count: 3, labels: ["feature","ux"], last_activity: "2025-09-07T11:00:00Z" },
    { node_type: "issue", node_id: 34, title: "Design login form components", created_at: "2025-09-02T14:00:00Z", state: "closed", comment_count: 15, labels: ["design","ui"], last_activity: "2025-09-06T08:00:00Z" },
    { node_type: "issue", node_id: 45, title: "Implement forgot password UI", created_at: "2025-09-06T09:30:00Z", state: "open", comment_count: 7, labels: ["ui","frontend"], last_activity: "2025-09-07T15:00:00Z" },
    { node_type: "issue", node_id: 56, title: "Create user sessions table", created_at: "2025-09-01T14:00:00Z", state: "closed", comment_count: 4, labels: ["database","backend"], last_activity: "2025-09-06T10:00:00Z" },

    { node_type: "pr", node_id: 89, title: "feat: Login feature implementation", created_at: "2025-09-02T09:00:00Z", state: "merged", comment_count: 5, labels: ["reviewed","feature"], last_activity: "2025-09-07T10:00:00Z" },
    { node_type: "pr", node_id: 67, title: "security: Fix cookie handling", created_at: "2025-09-04T15:00:00Z", state: "open", comment_count: 10, labels: ["urgent","security"], last_activity: "2025-09-07T16:00:00Z" },
    { node_type: "pr", node_id: 101, title: "feat: Password reset implementation", created_at: "2025-09-06T10:00:00Z", state: "open", comment_count: 8, labels: ["feature"], last_activity: "2025-09-07T14:00:00Z" },
    { node_type: "pr", node_id: 112, title: "ui: Login form styling", created_at: "2025-09-03T11:00:00Z", state: "merged", comment_count: 3, labels: ["ui"], last_activity: "2025-09-06T15:00:00Z" },
    { node_type: "pr", node_id: 125, title: "refactor: Auth module restructuring", created_at: "2025-09-07T10:00:00Z", state: "open", comment_count: 18, labels: ["refactor","cleanup"], last_activity: "2025-09-07T17:00:00Z" },
    { node_type: "pr", node_id: 138, title: "db: User sessions schema", created_at: "2025-09-01T15:30:00Z", state: "merged", comment_count: 2, labels: ["database"], last_activity: "2025-09-06T11:00:00Z" },
    { node_type: "pr", node_id: 151, title: "test: Auth integration tests", created_at: "2025-09-05T16:00:00Z", state: "open", comment_count: 12, labels: ["testing","ci"], last_activity: "2025-09-07T18:00:00Z" },
  ],
  refs: [
    { src_type: "issue", src: 12, tgt_type: "issue", tgt: 23, origin: "comment", ref_type: "depends_on", depth: 1 },
    { src_type: "issue", src: 12, tgt_type: "issue", tgt: 34, origin: "comment", ref_type: "blocked_by", depth: 1 },
    { src_type: "issue", src: 12, tgt_type: "issue", tgt: 56, origin: "comment", ref_type: "blocked_by", depth: 1 },
    { src_type: "issue", src: 23, tgt_type: "issue", tgt: 78, origin: "comment", ref_type: "mentions", depth: 2 },
    { src_type: "issue", src: 23, tgt_type: "issue", tgt: 13, origin: "comment", ref_type: "related_to", depth: 2 },
    { src_type: "issue", src: 78, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "mentions", depth: 3 },
    { src_type: "issue", src: 13, tgt_type: "issue", tgt: 45, origin: "comment", ref_type: "blocked_by", depth: 2 },

    { src_type: "pr", src: 138, tgt_type: "issue", tgt: 56, origin: "timeline", ref_type: "closes", depth: 1 },
    { src_type: "pr", src: 89, tgt_type: "issue", tgt: 12, origin: "timeline", ref_type: "closes", depth: 1 },
    { src_type: "pr", src: 112, tgt_type: "issue", tgt: 34, origin: "timeline", ref_type: "closes", depth: 1 },
    { src_type: "pr", src: 67, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "fixes", depth: 1 },
    { src_type: "pr", src: 67, tgt_type: "issue", tgt: 78, origin: "comment", ref_type: "related", depth: 1 },
    { src_type: "pr", src: 101, tgt_type: "issue", tgt: 13, origin: "timeline", ref_type: "closes", depth: 1 },
    { src_type: "pr", src: 101, tgt_type: "issue", tgt: 45, origin: "timeline", ref_type: "closes", depth: 1 },
    { src_type: "pr", src: 125, tgt_type: "issue", tgt: 23, origin: "comment", ref_type: "impacts", depth: 1 },
    { src_type: "pr", src: 125, tgt_type: "pr", tgt: 89, origin: "comment", ref_type: "references", depth: 1 },
    { src_type: "pr", src: 125, tgt_type: "pr", tgt: 67, origin: "comment", ref_type: "references", depth: 1 },
    { src_type: "pr", src: 151, tgt_type: "issue", tgt: 12, origin: "comment", ref_type: "tests", depth: 1 },
    { src_type: "pr", src: 151, tgt_type: "issue", tgt: 23, origin: "comment", ref_type: "tests", depth: 1 },
    { src_type: "pr", src: 151, tgt_type: "issue", tgt: 78, origin: "comment", ref_type: "tests", depth: 1 },
    { src_type: "pr", src: 151, tgt_type: "pr", tgt: 89, origin: "comment", ref_type: "validates", depth: 1 },
  ]
};

/* --------------------------
   Utility helpers
   -------------------------- */

function getColorByLabel(label) {
  const map = {
    bug: "#da3633", feature: "#3fb950", enhancement: "#1f6feb", docs: "#8957e5",
    design: "#79c0ff", backend: "#f0883e", frontend: "#a371f7", ui: "#58a6ff",
    database: "#238636", security: "#f85149", testing: "#d29922", refactor: "#8b949e",
    auth: "#6f42c1", epic: "#3fb950"
  };
  return map[label] || "#6e7681";
}

function formatDate(date, format) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  switch(format) {
    case "MM-DD-YY": return `${pad(d.getMonth()+1)}-${pad(d.getDate())}-${String(d.getFullYear()).slice(-2)}`;
    case "MM-DD": return `${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    case "DD-MMM": return `${pad(d.getDate())}-${months[d.getMonth()]}`;
    case "YYYY-MM-DD": return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    default: return `${pad(d.getMonth()+1)}-${pad(d.getDate())}-${String(d.getFullYear()).slice(-2)}`;
  }
}

function activityHeatColor(lastActivity) {
  const now = new Date();
  const days = (now - new Date(lastActivity)) / (1000*60*60*24);
  if (days < 1) return "#ff6b6b";
  if (days < 3) return "#ffd93d";
  if (days < 7) return "#a8e6cf";
  return "#dcedc8";
}

/* --------------------------
   Main component
   -------------------------- */

export default function AdvancedRepoGraph({ initialData = SAMPLE_DATA }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [data, setData] = useState(initialData);
  const [layout, setLayout] = useState("timeline"); // timeline | hierarchical | cluster
  const [activeTab, setActiveTab] = useState("filters"); // filters | display | analytics
  const [filters, setFilters] = useState({
    filterIssues: true,
    filterPRs: true,
    toggleTimeline: true,
    toggleComments: true,
    toggleBlocking: true,
    toggleCritical: true,
    toggleDepthBands: true,
    toggleMetrics: true,
    toggleHeatmap: true,
    depth: 3,
    colorScheme: "default",
    dateFormat: "MM-DD-YY"
  });
  const [stats, setStats] = useState({
    totalIssues: 0, totalPRs: 0, totalLinks: 0, avgDegree: 0, maxBacklinks: 0, density: "0%", criticalCount: 0
  });

  // normalize nodes map
  const nodeMap = useMemo(() => {
    const m = new Map();
    (data.nodes || []).forEach(n => {
      m.set(`${n.node_type}|${n.node_id}`, { ...n, created_dt: new Date(n.created_at), last_dt: new Date(n.last_activity || n.created_at), inDegree:0, outDegree:0 });
    });
    return m;
  }, [data]);

  // normalized links array with node refs
  const links = useMemo(() => {
    const arr = (data.refs || []).map(r => {
      const sKey = `${r.src_type}|${r.src}`, tKey = `${r.tgt_type}|${r.tgt}`;
      const s = nodeMap.get(sKey), t = nodeMap.get(tKey);
      return s && t ? ({ source: s, target: t, origin: r.origin, ref_type: r.ref_type, depth: r.depth }) : null;
    }).filter(Boolean);
    // compute degrees
    arr.forEach(l => {
      l.source.outDegree = (l.source.outDegree || 0) + 1;
      l.target.inDegree = (l.target.inDegree || 0) + 1;
    });
    return arr;
  }, [data, nodeMap]);

  // compute simple clusters (group by primary label or by connectivity)
  const clusters = useMemo(() => {
    const byLabel = new Map();
    nodeMap.forEach((n, k) => {
      const label = (n.labels && n.labels[0]) || "ungrouped";
      if (!byLabel.has(label)) byLabel.set(label, []);
      byLabel.get(label).push(k);
    });
    return Array.from(byLabel.entries()).map(([label, keys]) => ({ label, keys }));
  }, [nodeMap]);

  // compute depth for issues (BFS starting from issues with no incoming issue->issue)
  const depthMap = useMemo(() => {
    const depths = new Map();
    const incoming = new Map();
    nodeMap.forEach((n, key) => { if (n.node_type === "issue") incoming.set(key, []); });

    links.forEach(l => {
      if (l.source.node_type === "issue" && l.target.node_type === "issue") {
        const tKey = `${l.target.node_type}|${l.target.node_id}`;
        incoming.get(tKey)?.push(`${l.source.node_type}|${l.source.node_id}`);
      }
    });

    const roots = [];
    incoming.forEach((arr, key) => { if (!arr || arr.length === 0) roots.push(key); });

    const q = [];
    roots.forEach(k => { depths.set(k, 0); q.push(k); });

    while (q.length) {
      const k = q.shift();
      const curDepth = depths.get(k);
      // outgoing edges from this issue
      links.forEach(l => {
        const sKey = `${l.source.node_type}|${l.source.node_id}`;
        const tKey = `${l.target.node_type}|${l.target.node_id}`;
        if (sKey === k && l.target.node_type === "issue") {
          if (!depths.has(tKey)) {
            depths.set(tKey, Math.min((curDepth || 0) + 1, 5));
            q.push(tKey);
          }
        }
      });
    }
    return depths;
  }, [links, nodeMap]);

  // critical path: longest issue->issue simple path (DFS)
  const criticalPath = useMemo(() => {
    const issueAdj = new Map();
    nodeMap.forEach((n, k) => { if (n.node_type === "issue") issueAdj.set(k, []); });
    links.forEach(l => {
      if (l.source.node_type === "issue" && l.target.node_type === "issue") {
        const sKey = `${l.source.node_type}|${l.source.node_id}`;
        const tKey = `${l.target.node_type}|${l.target.node_id}`;
        issueAdj.get(sKey)?.push(tKey);
      }
    });
    let longest = [];
    function dfs(node, visited, path) {
      visited.add(node); path.push(node);
      if (path.length > longest.length) longest = path.slice();
      const nbrs = issueAdj.get(node) || [];
      nbrs.forEach(nb => { if (!visited.has(nb)) dfs(nb, visited, path); });
      visited.delete(node); path.pop();
    }
    Array.from(issueAdj.keys()).forEach(k => dfs(k, new Set(), []));
    return longest;
  }, [links, nodeMap]);

  // compute stats
  useEffect(() => {
    const nodes = Array.from(nodeMap.values());
    const issues = nodes.filter(n => n.node_type === "issue").length;
    const prs = nodes.filter(n => n.node_type === "pr").length;
    const totalLinks = links.length;
    const totalDegree = nodes.reduce((s, n) => s + (n.inDegree || 0) + (n.outDegree || 0), 0);
    const avgDegree = nodes.length ? (totalDegree / nodes.length).toFixed(2) : 0;
    const maxBacklinks = nodes.reduce((m, n) => Math.max(m, n.inDegree || 0), 0);
    const density = nodes.length > 1 ? (((totalLinks * 2) / (nodes.length * (nodes.length - 1))) * 100).toFixed(1) + "%" : "0%";
    setStats({ totalIssues: issues, totalPRs: prs, totalLinks, avgDegree, maxBacklinks, density, criticalCount: criticalPath.length });
  }, [nodeMap, links, criticalPath]);

  /* --------------------------
     D3 drawing: main render
     -------------------------- */
  useEffect(() => {
    // cleanup and initialize svg
    const container = containerRef.current;
    if (!container) return;
    d3.select(container).selectAll("svg").remove();

    const containerRect = container.getBoundingClientRect();
    const width = Math.max(900, containerRect.width);
    const height = Math.max(640, containerRect.height);

    const margin = { top: 40, right: 20, bottom: 80, left: 80 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svgRef.current = svg.node();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // build arrays for nodes with current filters
    const nodesArr = Array.from(nodeMap.values()).map(n => ({ ...n }));
    // apply depth info to issue nodes
    nodesArr.forEach(n => {
      if (n.node_type === "issue") {
        const key = `${n.node_type}|${n.node_id}`;
        n.depth = depthMap.get(key) ?? 0;
      } else {
        n.depth = -1;
      }
    });

    // time scale domain
    const minDate = d3.min(nodesArr, d => d.created_dt) || new Date();
    const maxDate = d3.max(nodesArr, d => d.created_dt) || new Date();
    const timePad = d3.timeDay.offset(minDate, -1) ;
    const timeMaxPad = d3.timeDay.offset(maxDate, 1);
    const xScale = d3.scaleTime().domain([timePad, timeMaxPad]).range([0, Math.max(innerW, 1200)]);

    // layout mapping
    function applyLayout(layoutMode) {
      if (layoutMode === "timeline") {
        nodesArr.forEach(n => {
          n.x = xScale(n.created_dt);
          n.y = n.node_type === "pr" ? 60 : (140 + (n.depth || 0) * 160);
        });
      } else if (layoutMode === "hierarchical") {
        const byDepth = d3.group(nodesArr, n => n.node_type === "pr" ? 0 : (n.depth || 0));
        let y = 60;
        for (const [lvl, list] of Array.from(byDepth.entries()).sort((a,b) => a[0]-b[0])) {
          const step = innerW / (list.length + 1);
          list.forEach((n, i) => { n.x = (i + 1) * step; n.y = y; });
          y += 160;
        }
      } else { // cluster
        const grouped = d3.group(nodesArr, n => (n.labels && n.labels[0]) || "ungrouped");
        let cx = 0, cy = 60;
        const colW = innerW / 2;
        grouped.forEach((arr, label, idx) => {
          const step = Math.max(80, colW / (arr.length + 1));
          arr.forEach((n, i) => { n.x = cx + (i + 1) * step; n.y = cy + (Math.random()*60 - 30); });
          cx += colW;
          if (cx > innerW) { cx = 0; cy += 220; }
        });
      }
    }

    applyLayout(layout);

    // depth bands
    if (filters.toggleDepthBands) {
      for (let d = 0; d <= 3; d++) {
        g.append("rect")
          .attr("x", 0)
          .attr("y", 140 + d * 160 - 20)
          .attr("width", Math.max(innerW, 1200))
          .attr("height", 160)
          .attr("fill", d % 2 === 0 ? "#0d1117" : "#161b22")
          .attr("opacity", 0.32)
          .attr("pointer-events", "none");
        g.append("text")
          .attr("x", -50).attr("y", 140 + d * 160 + 6)
          .attr("font-size", 12)
          .attr("fill", "#58a6ff")
          .attr("text-anchor", "end")
          .text(`Depth ${d}`);
      }
    }

    // x grid and ticks (daily)
    const dayCount = Math.ceil((xScale.domain()[1] - xScale.domain()[0]) / (1000*60*60*24));
    for (let i = 0; i <= dayCount; i++) {
      const tick = d3.timeDay.offset(xScale.domain()[0], i);
      const x = xScale(tick);
      g.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", innerH).attr("stroke", "#30363d").attr("stroke-width", 0.5).attr("opacity", 0.22);
      g.append("text").attr("x", x).attr("y", innerH + 22).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", "#8b949e").text(formatDate(tick, filters.dateFormat));
    }

    // link drawing layer
    const linkLayer = g.append("g").attr("class", "links");
    const nodeLayer = g.append("g").attr("class", "nodes");

    // compute visible nodes + links (based on filters)
    const visibleNodes = nodesArr.filter(n => {
      if (!filters.filterIssues && n.node_type === "issue") return false;
      if (!filters.filterPRs && n.node_type === "pr") return false;
      return n.node_type === "pr" || n.depth <= filters.depth;
    });

    const visibleSet = new Set(visibleNodes.map(n => `${n.node_type}|${n.node_id}`));

    const visibleLinks = links.filter(l => {
      const sKey = `${l.source.node_type}|${l.source.node_id}`;
      const tKey = `${l.target.node_type}|${l.target.node_id}`;
      if (!visibleSet.has(sKey) || !visibleSet.has(tKey)) return false;
      if (l.origin === "timeline" && !filters.toggleTimeline) return false;
      if (l.origin === "comment" && !filters.toggleComments) return false;
      if (l.ref_type === "blocked_by" && !filters.toggleBlocking) return false;
      return true;
    });

    // draw links
    visibleLinks.forEach(l => {
      const s = visibleNodes.find(n => n.node_type === l.source.node_type && n.node_id === l.source.node_id);
      const t = visibleNodes.find(n => n.node_type === l.target.node_type && n.node_id === l.target.node_id);
      if (!s || !t) return;
      const ctrlY = Math.max(s.y, t.y) + 100;
      const d = `M${s.x},${s.y} Q${(s.x + t.x)/2},${ctrlY} ${t.x},${t.y}`;
      const isTimeline = l.origin === "timeline";
      const isBlocking = l.ref_type === "blocked_by";
      linkLayer.append("path").attr("d", d).attr("fill", "none")
        .attr("stroke", isTimeline ? "#30363d" : isBlocking ? "#f85149" : "#d29922")
        .attr("stroke-width", isBlocking ? 2.6 : (l.source.node_type === "pr" && links.filter(rr => rr.source.node_type === "pr" && rr.source.node_id === l.source.node_id && rr.target.node_type === "issue").length > 1 ? 3.2 : 1.6))
        .attr("stroke-dasharray", isTimeline ? "0" : (isBlocking ? "8 4" : "6 4"))
        .attr("opacity", 0.75)
        .on("mouseenter", function(ev) {
          const tt = d3.select(container).select(".tooltip");
          tt.style("display", "block").html(`<div class="tooltip-title">${l.ref_type}</div>
            <div class="tooltip-row"><span>Origin:</span><strong>${l.origin}</strong></div>
            <div class="tooltip-row"><span>From:</span><strong>${l.source.node_type} #${l.source.node_id}</strong></div>
            <div class="tooltip-row"><span>To:</span><strong>${l.target.node_type} #${l.target.node_id}</strong></div>`);
        })
        .on("mousemove", function(ev) {
          const tt = d3.select(container).select(".tooltip");
          tt.style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY + 12) + "px");
        })
        .on("mouseleave", () => d3.select(container).select(".tooltip").style("display", "none"));
    });

    // Node scaling by degree
    const maxDeg = d3.max(visibleNodes, n => (n.inDegree || 0) + (n.outDegree || 0)) || 1;
    const sizeScale = d3.scaleSqrt().domain([0, maxDeg]).range([8, 24]);

    // nodes
    const nodeG = nodeLayer.selectAll("g.node").data(visibleNodes, d => `${d.node_type}|${d.node_id}`).enter().append("g").attr("class","node").attr("transform", d => `translate(${d.x},${d.y})`).style("cursor", "pointer");

    // halo
    nodeG.append("circle").filter(d => (d.inDegree + d.outDegree) >= 3).attr("r", d => sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 14).attr("fill", "#ffe6b3").attr("opacity", 0.22);

    // shape
    nodeG.each(function(d) {
      if (d.node_type === "issue") {
        d3.select(this).append("circle").attr("r", sizeScale((d.inDegree || 0) + (d.outDegree || 0))).attr("fill", () => {
          if (filters.colorScheme === "category" && d.labels && d.labels.length) return getColorByLabel(d.labels[0]);
          if (filters.colorScheme === "activity" && filters.toggleHeatmap) return activityHeatColor(d.last_dt);
          return "#0969da";
        }).attr("stroke", d.state === "merged" ? "#8957e5" : d.state === "closed" ? "#6e7681" : "#0550ae").attr("stroke-width", 2);
      } else {
        // PR rectangular
        const s = sizeScale((d.inDegree || 0)+(d.outDegree || 0));
        d3.select(this).append("rect").attr("x", -s*0.9).attr("y", -s*0.9).attr("width", s*1.8).attr("height", s*1.8).attr("rx", 4)
          .attr("fill", () => {
            if (filters.colorScheme === "category" && d.labels && d.labels.length) return getColorByLabel(d.labels[0]);
            if (filters.colorScheme === "activity" && filters.toggleHeatmap) return activityHeatColor(d.last_dt);
            return "#3fb950";
          })
          .attr("stroke", d.state === "merged" ? "#8957e5" : "#238636").attr("stroke-width", 2);
      }
    });

    // state dot
    nodeG.append("circle").attr("r", 5).attr("cx", d => (sizeScale((d.inDegree||0)+(d.outDegree||0)) + 8)).attr("cy", d => -(sizeScale((d.inDegree||0)+(d.outDegree||0)) + 8)).attr("fill", d => ({open:"#3fb950", closed:"#6e7681", merged:"#8957e5"}[d.state] || "#6e7681")).attr("stroke", "#0d1117").attr("stroke-width", 1.2);

    // degree ring
    nodeG.append("circle").attr("r", d => sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 4).attr("fill","none").attr("stroke", d => (d.inDegree > 5 ? "#f85149" : d.inDegree > 2 ? "#ffd93d" : "#30363d")).attr("stroke-width", 1).attr("opacity", 0.6);

    // labels & badges
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree||0)+(d.outDegree||0)) + 10)).attr("y", 4).attr("font-size", 10).attr("fill", "#e6edf3").text(d => `${d.node_type === "pr" ? 'PR' : 'Issue'} #${d.node_id}`);
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree||0)+(d.outDegree||0)) + 10)).attr("y", 18).attr("font-size", 10).attr("fill", "#8b949e").text(d => `↕${(d.inDegree||0)+(d.outDegree||0)}  💬${d.comment_count || 0}`);

    // hover tooltip
    nodeG.on("mouseenter", function(ev, d) {
      const tt = d3.select(container).select(".tooltip");
      tt.style("display", "block").html(`<div class="tooltip-title">${d.node_type.toUpperCase()} ${d.node_id}</div>
        <div class="tooltip-row">${d.title}</div>
        <div class="tooltip-row"><span>state:</span><strong>${d.state}</strong><span style="margin-left:12px">comments:</span><strong>${d.comment_count}</strong></div>`);
    }).on("mousemove", function(ev) {
      d3.select(container).select(".tooltip").style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY + 12) + "px");
    }).on("mouseleave", function() {
      d3.select(container).select(".tooltip").style("display", "none");
    }).on("click", function(ev, d) {
      // focus / highlight neighbors
      // simple highlight: reduce opacity for others
      nodeLayer.selectAll("g.node").attr("opacity", nd => (nd.node_id === d.node_id && nd.node_type === d.node_type) ? 1 : 0.12);
      linkLayer.selectAll("path").attr("opacity", 0.12);
      // bring up neighbors
      visibleLinks.forEach(l => {
        if ((l.source.node_type === d.node_type && l.source.node_id === d.node_id) || (l.target.node_type === d.node_type && l.target.node_id === d.node_id)) {
          // we can highlight these by adding temp stroke, but simple approach: raise opacity
          // This requires selecting the path(s) - omitted small selection complexity
        }
      });
    });

    // Zoom behavior
    const zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    // create a small legend/tooltip container in outer container
    d3.select(container).select(".tooltip").style("display", "none");

    // expose a couple helpers to parent DOM (for reset zoom)
    svg.node().resetZoom = () => {
      svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
    };

    // clean up on unmount
    return () => { d3.select(container).selectAll("svg").remove(); };

  }, [nodeMap, links, filters, layout]);

  /* --------------------------
     Handlers for controls
     -------------------------- */
  function handleToggle(k) { setFilters(prev => ({ ...prev, [k]: !prev[k] })); }
  function handleSet(k, v) { setFilters(prev => ({ ...prev, [k]: v })); }
  function handleLayoutChange(ev) { setLayout(ev.target.value); }
  function resetView() {
    // reset filters & layout
    setFilters({
      filterIssues: true, filterPRs: true, toggleTimeline: true, toggleComments: true, toggleBlocking: true,
      toggleCritical: true, toggleDepthBands: true, toggleMetrics: true, toggleHeatmap: true, depth: 3,
      colorScheme: "default", dateFormat: "MM-DD-YY"
    });
    setLayout("timeline");
    // reset zoom if svgRef present
    const svgNode = svgRef.current;
    if (svgNode && svgNode.resetZoom) svgNode.resetZoom();
  }

  // expose a "load sample" convenience
  function loadSample() { setData(SAMPLE_DATA); }

  /* --------------------------
     Render UI
     -------------------------- */
  return (
    <div className="container" style={{ padding: 12 }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 20 }}>📊 RepoGraph</h1>
        <p style={{ color: "#8b949e", marginTop: 6 }}>Advanced Repository Dependency Visualizer</p>
      </header>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <input className="input-field" placeholder="owner/repo or issue/PR URL" style={{ minWidth: 300 }} />
        <button className="btn" onClick={() => { /* hook to loader if desired */ }}>Load Graph</button>
        <button className="btn secondary small" onClick={loadSample}>📌 Load Sample</button>
      </div>

      <div className="main-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div className="canvas-wrapper" style={{ background: "#161b22", borderRadius: 6 }}>
          <div className="canvas-toolbar" style={{ display: "flex", alignItems: "center", padding: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn small" onClick={() => {
                // zoom in
                const svgNode = svgRef.current;
                if (!svgNode) return;
                d3.select(svgNode).transition().call(d3.zoom().scaleBy, 1.2);
              }}>🔍+</button>
              <button className="btn small" onClick={() => {
                const svgNode = svgRef.current;
                if (!svgNode) return;
                d3.select(svgNode).transition().call(d3.zoom().scaleBy, 0.8);
              }}>🔍−</button>
              <button className="btn small secondary" onClick={() => {
                const svgNode = svgRef.current;
                if (svgNode && svgNode.resetZoom) svgNode.resetZoom();
              }}>⤴ Reset</button>
            </div>

            <select value={layout} onChange={handleLayoutChange} style={{ marginLeft: "auto" }}>
              <option value="timeline">📅 Timeline</option>
              <option value="hierarchical">🏗️ Hierarchical</option>
              <option value="cluster">🎯 Cluster</option>
            </select>
          </div>

          <div id="chartContainer" ref={containerRef} style={{ height: 880, position: "relative" }}>
            {/* tooltip div */}
            <div className="tooltip" style={{ position: "absolute", display: "none", pointerEvents: "none", zIndex: 1000 }}></div>
          </div>
        </div>

        <aside className="controls-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div className="tabs" style={{ display: "flex", gap: 4 }}>
            <button className={"tab-btn " + (activeTab === "filters" ? "active" : "")} onClick={() => setActiveTab("filters")}>Filters</button>
            <button className={"tab-btn " + (activeTab === "display" ? "active" : "")} onClick={() => setActiveTab("display")}>Display</button>
            <button className={"tab-btn " + (activeTab === "analytics" ? "active" : "")} onClick={() => setActiveTab("analytics")}>Analytics</button>
          </div>

          {/* Filters tab */}
          <div id="tab-filters" className={"tab-content " + (activeTab === "filters" ? "active" : "")} style={{ display: activeTab === "filters" ? "block" : "none" }}>
            <div className="control-group">
              <div className="control-label">Node Types</div>
              <label className="checkbox-item"><input type="checkbox" checked={filters.filterIssues} onChange={() => handleToggle("filterIssues")} /> Issues</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.filterPRs} onChange={() => handleToggle("filterPRs")} /> Pull Requests</label>
            </div>

            <div className="control-group" style={{ marginTop: 10 }}>
              <div className="control-label">Link Types</div>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleTimeline} onChange={() => handleToggle("toggleTimeline")} /> Timeline links</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleComments} onChange={() => handleToggle("toggleComments")} /> Comment mentions</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleBlocking} onChange={() => handleToggle("toggleBlocking")} /> Blocking deps</label>
            </div>
          </div>

          {/* Display tab */}
          <div id="tab-display" className={"tab-content " + (activeTab === "display" ? "active" : "")} style={{ display: activeTab === "display" ? "block" : "none" }}>
            <div className="control-group">
              <div className="control-label">Visibility</div>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleCritical} onChange={() => handleToggle("toggleCritical")} /> Critical path</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleDepthBands} onChange={() => handleToggle("toggleDepthBands")} /> Depth bands</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleMetrics} onChange={() => handleToggle("toggleMetrics")} /> Node metrics</label>
              <label className="checkbox-item"><input type="checkbox" checked={filters.toggleHeatmap} onChange={() => handleToggle("toggleHeatmap")} /> Activity heat</label>
            </div>

            <div className="control-group" style={{ marginTop: 10 }}>
              <div className="control-label">Depth Filter</div>
              <input type="range" min="0" max="3" value={filters.depth} onChange={(e) => handleSet("depth", Number(e.target.value))} />
              <div style={{ textAlign: "right", fontSize: 12, color: "#8b949e" }}>Depth: <strong>{filters.depth}</strong></div>
            </div>

            <div className="control-group" style={{ marginTop: 10 }}>
              <div className="control-label">Color Scheme</div>
              <select value={filters.colorScheme} onChange={(e) => handleSet("colorScheme", e.target.value)}>
                <option value="default">Default (GitHub)</option>
                <option value="category">By Category</option>
                <option value="activity">By Activity</option>
              </select>
            </div>

            <div className="control-group" style={{ marginTop: 10 }}>
              <div className="control-label">Date Format</div>
              <select value={filters.dateFormat} onChange={(e) => handleSet("dateFormat", e.target.value)}>
                <option value="MM-DD-YY">MM-DD-YY</option>
                <option value="MM-DD">MM-DD</option>
                <option value="DD-MMM">DD-MMM</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {/* Analytics tab */}
          <div id="tab-analytics" className={"tab-content " + (activeTab === "analytics" ? "active" : "")} style={{ display: activeTab === "analytics" ? "block" : "none" }}>
            <div className="stats-info">
              <div className="stat-item"><span>Total Issues:</span><strong>{stats.totalIssues}</strong></div>
              <div className="stat-item"><span>Total PRs:</span><strong>{stats.totalPRs}</strong></div>
              <div className="stat-item"><span>Total Links:</span><strong>{stats.totalLinks}</strong></div>
              <div className="stat-item"><span>Critical Path:</span><strong>{stats.criticalCount}</strong></div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #30363d" }}>
                <div className="stat-item"><span>Avg Degree:</span><strong>{stats.avgDegree}</strong></div>
                <div className="stat-item"><span>Max Backlinks:</span><strong>{stats.maxBacklinks}</strong></div>
                <div className="stat-item"><span>Density:</span><strong>{stats.density}</strong></div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, color: "#c9d1d9", marginBottom: 8 }}>⚡ Gravity Wells</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from(nodeMap.values()).filter(n => (n.inDegree || 0) > 0).sort((a,b) => (b.inDegree||0) - (a.inDegree||0)).slice(0,5).map(n =>
                  <div key={`${n.node_type}|${n.node_id}`} className="gravity-well-item">
                    <strong>{n.node_type === "pr" ? "PR" : "#"}{n.node_id}</strong> — {n.title.substring(0,40)}... 🔗 {(n.inDegree || 0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <div style={{ fontWeight: 600, color: "#c9d1d9", marginBottom: 8 }}>Legend</div>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 16, height: 16, background: "#3fb950", border: "2px solid #238636" }}></div><span>PR (Open)</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 16, height: 16, background: "#3fb950", border: "2px solid #8957e5" }}></div><span>PR (Merged)</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 16, height: 16, background: "#0969da", border: "2px solid #0550ae" }}></div><span>Issue (Open)</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12 }}>Links: ━ Timeline • ╌ Mention • ≡ Blocking</div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="btn" onClick={resetView}>Reset View</button>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
