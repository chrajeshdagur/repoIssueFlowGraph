// advanced-repograph.jsx
//
// Single-file React 18 + D3 v7 component implementing:
// - Vertical timeline (Y-axis) with full timestamp granularity (date HH:MM:SS)
// - Horizontal dependency depth (X-axis) where depth increases to the right
// - No background shaded bands; nodes colored via gradient by depth
// - Minimal top toolbar + slide-down drawer for controls
// - Right sidebar with only Analytics and Summary
// - Zoom/pan/reset, layout modes (timeline/hierarchical/cluster), critical path detection
// - Sample data included
//
// Usage:
//   import AdvancedRepoGraph from './advanced-repograph.jsx';
//   <AdvancedRepoGraph />
//
// Dependencies: react, d3
// Ensure d3 is installed: npm install d3
//

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

/* ===========================
   Inject minimal GitHub-dark CSS
   =========================== */
const INJECT_CSS = () => {
  if (document.getElementById("repograph-styles")) return;
  const style = document.createElement("style");
  style.id = "repograph-styles";
  style.innerHTML = `
  /* GitHub-dark-inspired theme */
  .repograph-root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #c9d1d9; }
  .repograph-header { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#0d1117; border-bottom:1px solid #21262d;}
  .repograph-title { font-size:18px; color:#e6edf3; margin:0; }
  .repograph-sub { color:#8b949e; margin:0; font-size:12px; }
  .repograph-main { display:flex; gap:12px; padding:12px; background:#010409; min-height:600px; }
  .repograph-canvas { flex:1; background: linear-gradient(180deg, #02040a 0%, #071014 100%); border-radius:8px; position:relative; overflow:hidden; box-shadow: 0 6px 18px rgba(2,6,23,0.6); border:1px solid #21262d;}
  .repograph-toolbar { display:flex; align-items:center; gap:8px; padding:10px; background:transparent; color:#c9d1d9; }
  .repograph-btn { background:#0b1220; border:1px solid #21262d; color:#c9d1d9; padding:6px 8px; border-radius:6px; cursor:pointer; }
  .repograph-btn.small { padding:4px 6px; font-size:13px; }
  .repograph-btn.primary { background:#1f6feb; border-color:#2f6fe8; }
  .repograph-drawer { background:#02050a; border-top:1px solid #21262d; padding:12px; display:flex; gap:12px; align-items:center; color:#9aa4b2; }
  .repograph-drawer .control { display:flex; flex-direction:column; gap:6px; }
  .repograph-side { width:340px; background:#06090c; border-radius:8px; padding:12px; border:1px solid #21262d; color:#c9d1d9; }
  .repograph-tab-btn { display:inline-block; padding:8px 10px; border-radius:6px; background:#07101a; border:1px solid #1f2a33; cursor:pointer; color:#9fb3c9; margin-right:6px;}
  .repograph-tab-btn.active { background:#0f1720; color:#e6edf3; border-color:#2f6fe8; }
  .repograph-analytics .stat { display:flex; justify-content:space-between; padding:8px 6px; border-bottom:1px dashed #17202a; color:#9fb3c9; }
  .repograph-summary { margin-top:10px; font-size:13px; color:#9fb3c9; }
  .repograph-tooltip { position:absolute; pointer-events:none; background:#010409; border:1px solid #2b2f34; padding:8px; border-radius:6px; color:#e6edf3; font-size:12px; box-shadow: 0 6px 18px rgba(2,6,23,0.6); z-index:9999; }
  .repograph-legend { font-size:12px; color:#9fb3c9; margin-top:8px;}
  .repograph-footer { padding:12px; color:#8b949e; font-size:12px; text-align:center;}
  input[type="range"] { accent-color:#2f6fe8; }
  .repograph-small { font-size:12px; color:#9fb3c9; }
  `;
  document.head.appendChild(style);
};

/* ===========================
   Sample data (slightly extended)
   Nodes: { node_type: "issue" | "pr", node_id: number, title, created_at, last_activity, state, labels, comment_count }
   Refs: { src_type, src, tgt_type, tgt, origin: "timeline"|"comment", ref_type, depth }
   =========================== */

const SAMPLE_DATA = {
  nodes: [
    { node_type: "issue", node_id: 12, title: "Implement login", created_at: "2025-09-01T10:00:23Z", last_activity: "2025-09-07T10:00:00Z", state: "open", labels: ["feature","epic"], comment_count: 24 },
    { node_type: "issue", node_id: 23, title: "Login sub-task", created_at: "2025-09-02T11:30:12Z", last_activity: "2025-09-07T09:00:00Z", state: "open", labels: ["backend"], comment_count: 6 },
    { node_type: "issue", node_id: 78, title: "Auth edge-case", created_at: "2025-09-03T08:15:55Z", last_activity: "2025-09-05T14:00:00Z", state: "open", labels: ["bug"], comment_count: 12 },
    { node_type: "issue", node_id: 66, title: "Fix stale cookie", created_at: "2025-09-04T09:00:13Z", last_activity: "2025-09-06T12:00:00Z", state: "closed", labels: ["bug","security"], comment_count: 8 },
    { node_type: "issue", node_id: 13, title: "Add password reset", created_at: "2025-09-05T12:30:45Z", last_activity: "2025-09-07T12:30:00Z", state: "open", labels: ["feature","ux"], comment_count: 3 },

    { node_type: "pr", node_id: 89, title: "Login feature PR", created_at: "2025-09-02T09:00:05Z", last_activity: "2025-09-07T10:30:00Z", state: "merged", labels: ["feature"], comment_count: 5 },
    { node_type: "pr", node_id: 67, title: "Cookie fix PR", created_at: "2025-09-04T15:00:00Z", last_activity: "2025-09-07T16:00:12Z", state: "open", labels: ["urgent"], comment_count: 10 },
    { node_type: "pr", node_id: 56, title: "Combined fixes PR", created_at: "2025-09-07T10:00:00Z", last_activity: "2025-09-07T17:15:00Z", state: "open", labels: ["chore"], comment_count: 18 },
    { node_type: "pr", node_id: 99, title: "Refactor auth PR", created_at: "2025-09-05T14:30:20Z", last_activity: "2025-09-07T18:45:00Z", state: "open", labels: ["refactor"], comment_count: 7 }
  ],
  refs: [
    { src_type: "issue", src: 12, tgt_type: "issue", tgt: 23, origin: "comment", ref_type: "depends_on", depth: 1 },
    { src_type: "issue", src: 12, tgt_type: "pr", tgt: 89, origin: "timeline", ref_type: "linked_pr", depth: 1 },
    { src_type: "issue", src: 23, tgt_type: "issue", tgt: 78, origin: "comment", ref_type: "mentions", depth: 2 },
    { src_type: "issue", src: 78, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "mentions", depth: 3 },
    { src_type: "pr", src: 67, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "fixes", depth: 1 },
    { src_type: "pr", src: 56, tgt_type: "issue", tgt: 12, origin: "comment", ref_type: "depends_on", depth: 1 },
    { src_type: "pr", src: 99, tgt_type: "pr", tgt: 56, origin: "comment", ref_type: "references", depth: 1 }
  ]
};

/* ===========================
   Utility functions
   =========================== */

function parseISOorDate(str) {
  if (!str) return null;
  return new Date(str);
}

function keyOf(n) {
  return `${n.node_type}|${n.node_id}`;
}

function getColorByLabel(label) {
  // small palette map
  const map = {
    bug: "#ff6b6b",
    feature: "#2ea043",
    refactor: "#7a5cff",
    security: "#ff8f4a",
    urgent: "#ffb020",
    default: "#58a6ff"
  };
  return map[label] || map.default;
}

function depthToGradient(depth, maxDepth) {
  // map depth into HSL gradient (blue to purple)
  const t = Math.min(depth / Math.max(1, maxDepth), 1);
  // from light blue to deep purple
  const h = 220 + (280 - 220) * t; // 220 -> 280
  const s = 70;
  const l = 55 - 18 * t;
  return `hsl(${h} ${s}% ${l}%)`;
}

function computeDepths(nodesMap, refs, maxDepth = 6) {
  // BFS from root issues (no incoming issue->issue links)
  const incoming = new Map();
  const keys = Array.from(nodesMap.keys()).filter(k => nodesMap.get(k).node_type === "issue" || nodesMap.get(k).node_type === "issue");
  keys.forEach(k => incoming.set(k, []));
  refs.forEach(r => {
    if (r.src_type === "issue" && r.tgt_type === "issue") {
      const tKey = `${r.tgt_type}|${r.tgt}`;
      incoming.get(tKey)?.push(`${r.src_type}|${r.src}`);
    }
  });
  const roots = [];
  incoming.forEach((v,k) => { if (!v || v.length === 0) roots.push(k); });
  const depths = new Map();
  const q = [];
  roots.forEach(r => { depths.set(r, 0); q.push(r); });
  while (q.length) {
    const cur = q.shift(); const curDepth = depths.get(cur);
    refs.forEach(r => {
      const sKey = `${r.src_type}|${r.src}`, tKey = `${r.tgt_type}|${r.tgt}`;
      if (sKey === cur && r.tgt_type === "issue") {
        if (!depths.has(tKey)) {
          depths.set(tKey, Math.min(curDepth + 1, maxDepth));
          q.push(tKey);
        }
      }
    });
  }
  return depths;
}

function computeCriticalPath(nodesMap, refs) {
  // longest simple path among issues (DFS) - small graph ok
  const issueAdj = new Map();
  nodesMap.forEach((v,k) => { if (v.node_type === "issue") issueAdj.set(k, []); });
  refs.forEach(r => {
    if (r.src_type === "issue" && r.tgt_type === "issue") {
      const s = `${r.src_type}|${r.src}`, t = `${r.tgt_type}|${r.tgt}`;
      issueAdj.get(s)?.push(t);
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
}

function computeStats(nodesMap, refs) {
  const nodes = Array.from(nodesMap.values());
  const totalIssues = nodes.filter(n => n.node_type === "issue").length;
  const totalPRs = nodes.filter(n => n.node_type === "pr").length;
  const totalLinks = refs.length;
  const degrees = nodes.map(n => (n.inDegree || 0) + (n.outDegree || 0));
  const avgDegree = degrees.length ? (degrees.reduce((a,b)=>a+b,0) / degrees.length).toFixed(2) : 0;
  const maxBacklinks = nodes.reduce((m,n) => Math.max(m, n.inDegree || 0), 0);
  const density = nodes.length > 1 ? (((totalLinks * 2) / (nodes.length * (nodes.length - 1))) * 100).toFixed(1) + "%" : "0%";
  return { totalIssues, totalPRs, totalLinks, avgDegree, maxBacklinks, density };
}

/* ===========================
   Component
   =========================== */

export default function AdvancedRepoGraph({ initialData = SAMPLE_DATA }) {
  INJECT_CSS();

  // refs
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgRef = useRef(null);

  // state
  const [data, setData] = useState(initialData);
  const [layoutMode, setLayoutMode] = useState("timeline"); // timeline | hierarchical | cluster
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    showTimeline: true,
    showComments: true,
    showBlocking: true,
    showCritical: true,
    showDepthGradient: true,
    filterIssues: true,
    filterPRs: true,
    depth: 3,
    colorScheme: "default",
    dateFormat: "YYYY-MM-DD",
  });

  // normalized maps
  const nodesMap = useMemo(() => {
    const m = new Map();
    data.nodes.forEach(n => {
      const key = `${n.node_type}|${n.node_id}`;
      m.set(key, { ...n, created_dt: parseISOorDate(n.created_at), last_dt: parseISOorDate(n.last_activity), inDegree: 0, outDegree: 0 });
    });
    return m;
  }, [data]);

  const links = useMemo(() => {
    const arr = data.refs.map(r => {
      const sKey = `${r.src_type}|${r.src}`, tKey = `${r.tgt_type}|${r.tgt}`;
      const s = nodesMap.get(sKey), t = nodesMap.get(tKey);
      if (!s || !t) return null;
      return { source: s, target: t, origin: r.origin, ref_type: r.ref_type, depth: r.depth };
    }).filter(Boolean);
    // compute degrees
    arr.forEach(l => {
      l.source.outDegree = (l.source.outDegree || 0) + 1;
      l.target.inDegree = (l.target.inDegree || 0) + 1;
    });
    return arr;
  }, [data, nodesMap]);

  const maxDepth = useMemo(() => {
    return data.refs.reduce((m, r) => Math.max(m, r.depth || 0), 0) + 1;
  }, [data]);

  const depthMap = useMemo(() => computeDepths(nodesMap, data.refs, Math.max(6, maxDepth)), [nodesMap, data.refs, maxDepth]);
  const criticalPath = useMemo(() => computeCriticalPath(nodesMap, data.refs), [nodesMap, data.refs]);
  const stats = useMemo(() => computeStats(nodesMap, data.refs), [nodesMap, data.refs]);

  /* --------------
     D3 render
     -------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // clear previous
    d3.select(container).selectAll("svg").remove();

    // dims
    const containerRect = container.getBoundingClientRect();
    const width = Math.max(900, containerRect.width);
    const height = Math.max(600, containerRect.height);

    const margin = { top: 84, right: 20, bottom: 60, left: 120 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // create svg
    const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent")
      .style("overflow", "visible");

    svgRef.current = svg.node();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // prepare nodes array and apply depth to issues
    const nodesArr = Array.from(nodesMap.values()).map(n => ({ ...n }));
    nodesArr.forEach(n => {
      if (n.node_type === "issue") {
        const k = `${n.node_type}|${n.node_id}`;
        n.depth = depthMap.get(k) ?? 0;
      } else n.depth = -1;
    });

    // time scale (vertical - Y axis, top earliest -> bottom latest)
    const minDate = d3.min(nodesArr, d => d.created_dt) || new Date();
    const maxDate = d3.max(nodesArr, d => d.created_dt) || new Date();
    // create detailed scale with seconds
    const yScale = d3.scaleTime().domain([minDate, maxDate]).range([0, innerH]);

    // X scale for depth: depth 0 -> left, depth increases to right
    const xScale = d3.scaleLinear().domain([0, Math.max(1, Math.max(...nodesArr.map(n => (n.depth > -1 ? n.depth : 0)))) + 1]).range([0, innerW]);

    // If layoutMode is cluster/hierarchical, we apply a layout rebalancing below
    function applyLayout(mode) {
      if (mode === "timeline") {
        nodesArr.forEach(n => {
          n.x = n.node_type === "issue" ? xScale(n.depth) : xScale(Math.max(0, Math.min((n.depth >= 0 ? n.depth : 0), filters.depth)));
          n.y = yScale(n.created_dt);
        });
      } else if (mode === "hierarchical") {
        // respaced by depth bands horizontally but with even distribution vertically per depth
        const byDepth = d3.group(nodesArr.filter(n => n.node_type === "issue"), d => d.depth);
        const depthKeys = Array.from(byDepth.keys()).sort((a,b)=>a-b);
        const stepY = innerH / (depthKeys.length + 1);
        depthKeys.forEach((dkey, idx) => {
          const list = byDepth.get(dkey);
          const stepX = innerW / (list.length + 1);
          list.forEach((n, i) => { n.x = (i + 1) * stepX; n.y = (idx + 1) * stepY; });
        });
        // position PRs above top area spaced by created_dt order
        const prs = nodesArr.filter(n => n.node_type === "pr").sort((a,b)=>a.created_dt - b.created_dt);
        prs.forEach((p, i) => { p.x = (i + 1) * (innerW / (prs.length + 1)); p.y = -40; });
      } else {
        // cluster layout: group by primary label
        const grouped = d3.group(nodesArr, n => (n.labels && n.labels[0]) || "ungrouped");
        let col = 0;
        const colW = innerW / Math.max(1, grouped.size);
        Array.from(grouped.values()).forEach((list, idx) => {
          const stepY = innerH / (list.length + 1);
          list.forEach((n, i) => { n.x = idx * colW + (colW / 2); n.y = (i + 1) * stepY; });
        });
      }
    }

    applyLayout(layoutMode);

    // draw Y axis (time) at left
    const axisG = g.append("g").attr("class", "y-axis");
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S"));
    axisG.call(yAxis).selectAll("text").style("fill", "#9fb3c9").style("font-size", 11);
    axisG.selectAll("path,line").style("stroke", "#21262d").style("opacity", 0.8);

    // draw X axis (depth) at top: custom numeric axis
    const axisX = g.append("g").attr("class", "x-axis").attr("transform", `translate(0, -32)`);
    const depthTicks = xScale.ticks(Math.max(3, Math.ceil(xScale.domain()[1])));
    axisX.selectAll("line").data(depthTicks).enter().append("line")
      .attr("x1", d => xScale(d)).attr("y1", 12).attr("x2", d => xScale(d)).attr("y2", -8).attr("stroke", "#21262d").attr("opacity", 0.7);
    axisX.selectAll("text").data(depthTicks).enter().append("text")
      .attr("x", d => xScale(d)).attr("y", -18).attr("fill", "#9fb3c9").attr("text-anchor", "middle").text(d => `Depth ${d}`);

    // draw links
    const linkLayer = g.append("g").attr("class", "links");
    const visibleLinks = links.filter(l => {
      if (!filters.showTimeline && l.origin === "timeline") return false;
      if (!filters.showComments && l.origin === "comment") return false;
      if (!filters.showBlocking && l.ref_type === "blocked_by") return false;
      const sKey = keyOf(l.source), tKey = keyOf(l.target);
      if ((l.source.node_type === "issue" && depthMap.get(`${l.source.node_type}|${l.source.node_id}`) > filters.depth) ||
          (l.target.node_type === "issue" && depthMap.get(`${l.target.node_type}|${l.target.node_id}`) > filters.depth)) return false;
      return true;
    });

    visibleLinks.forEach(l => {
      const s = nodesArr.find(n => n.node_type === l.source.node_type && n.node_id === l.source.node_id);
      const t = nodesArr.find(n => n.node_type === l.target.node_type && n.node_id === l.target.node_id);
      if (!s || !t) return;
      // curve control point
      const cx = (s.x + t.x) / 2;
      const cy = (s.y + t.y) / 2;
      const ctrlX = cx;
      const ctrlY = Math.min(s.y, t.y) - Math.max(40, Math.abs(t.x - s.x) * 0.2) - 40;
      const path = `M ${s.x},${s.y} Q ${ctrlX},${ctrlY} ${t.x},${t.y}`;
      const isTimeline = l.origin === "timeline";
      const isBlocking = l.ref_type === "blocked_by";
      linkLayer.append("path")
        .attr("d", path)
        .attr("stroke", isBlocking ? "#ff6b6b" : isTimeline ? "#9fb3c9" : "#d29922")
        .attr("stroke-width", isBlocking ? 2.8 : (l.source.node_type === "pr" && links.filter(rr => rr.source.node_type === "pr" && rr.source.node_id === l.source.node_id && rr.target.node_type === "issue").length > 1 ? 3.2 : 1.6))
        .attr("fill", "none")
        .attr("opacity", 0.9)
        .attr("stroke-dasharray", isTimeline ? "0" : (isBlocking ? "8 4" : "6 4"))
        .on("mouseenter", (ev) => {
          const tooltip = tooltipRef.current;
          if (!tooltip) return;
          tooltip.style.display = "block";
          tooltip.innerHTML = `<div style="font-weight:600">${l.ref_type}</div><div style="font-size:12px">origin: ${l.origin}</div>`;
        })
        .on("mousemove", (ev) => {
          const tooltip = tooltipRef.current;
          if (!tooltip) return;
          tooltip.style.left = ev.pageX + 12 + "px";
          tooltip.style.top = ev.pageY + 12 + "px";
        })
        .on("mouseleave", () => {
          const tooltip = tooltipRef.current;
          if (!tooltip) return;
          tooltip.style.display = "none";
        });
    });

    // node layer
    const nodeLayer = g.append("g").attr("class", "nodes");

    // node sizing by degree
    const degMax = d3.max(nodesArr, d => (d.inDegree || 0) + (d.outDegree || 0)) || 1;
    const sizeScale = d3.scaleSqrt().domain([0, degMax]).range([6, 20]);

    // draw nodes
    const nodeG = nodeLayer.selectAll("g.node").data(nodesArr).enter().append("g").attr("class", "node").attr("transform", d => `translate(${d.x},${d.y})`).style("cursor", "pointer");

    // halos for high degree
    nodeG.append("circle").filter(d => ((d.inDegree || 0) + (d.outDegree || 0)) >= 3)
      .attr("r", d => sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 10)
      .attr("fill", "#ffe6b3").attr("opacity", 0.22).lower();

    // shapes
    nodeG.each(function(d) {
      const group = d3.select(this);
      const size = sizeScale((d.inDegree || 0) + (d.outDegree || 0));
      const fillColor = filters.colorScheme === "category" && d.labels && d.labels.length ? getColorByLabel(d.labels[0]) : (filters.colorScheme === "activity" ? depthToGradient(d.depth >= 0 ? d.depth : 0, Math.max(1, maxDepth)) : "#58a6ff");
      if (d.node_type === "issue") {
        group.append("circle").attr("r", size).attr("fill", filters.showDepthGradient ? depthToGradient(d.depth >= 0 ? d.depth : 0, Math.max(1, maxDepth)) : fillColor).attr("stroke", "#0b1220").attr("stroke-width", 1.6);
      } else {
        group.append("rect").attr("x", -size).attr("y", -size*0.7).attr("width", size*2).attr("height", size*1.4).attr("rx", 4).attr("fill", fillColor).attr("stroke", "#0b1220").attr("stroke-width", 1.6);
      }
      // state dot
      group.append("circle").attr("r", 4).attr("cx", size + 6).attr("cy", -size - 6).attr("fill", d.state === "open" ? "#2ea043" : d.state === "merged" ? "#7a5cff" : "#6e7681").attr("stroke", "#0b1220").attr("stroke-width", 1.2);
    });

    // labels
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 12)).attr("y", 4).attr("fill", "#c9d1d9").attr("font-size", 11).text(d => `${d.node_type === "pr" ? "PR" : "Issue"} #${d.node_id}`);
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 12)).attr("y", 18).attr("fill", "#9fb3c9").attr("font-size", 10).text(d => `↕${(d.inDegree || 0) + (d.outDegree || 0)}  💬${d.comment_count || 0}`);

    // interactions
    nodeG.on("mouseenter", (ev,d) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      tooltip.style.display = "block";
      tooltip.innerHTML = `<div style="font-weight:700">${d.node_type.toUpperCase()} ${d.node_id}</div><div style="font-size:12px">${d.title}</div><div style="font-size:12px;color:#9fb3c9">state: ${d.state} • comments: ${d.comment_count}</div>`;
    }).on("mousemove", (ev) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      tooltip.style.left = ev.pageX + 12 + "px";
      tooltip.style.top = ev.pageY + 12 + "px";
    }).on("mouseleave", () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      tooltip.style.display = "none";
    }).on("click", (ev,d) => {
      setSelectedNode(d);
    });

    // critical path highlight if requested
    if (filters.showCritical && criticalPath && criticalPath.length > 1) {
      const coords = criticalPath.map(k => {
        const n = nodesArr.find(nn => keyOf(nn) === k);
        return n ? [n.x, n.y] : null;
      }).filter(Boolean);
      if (coords.length > 1) {
        g.append("path").attr("d", d3.line().curve(d3.curveMonotoneX)(coords)).attr("fill", "none").attr("stroke", "#d07a00").attr("stroke-width", 3).attr("opacity", 0.65);
      }
    }

    // zoom & pan
    const zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    // store scale reset
    svg.node().resetZoom = () => {
      svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
    };

    // cleanup
    return () => d3.select(container).selectAll("svg").remove();

  }, [nodesMap, links, filters, layoutMode, depthMap, criticalPath, maxDepth]);

  /* -------------------------
     Toolbar handlers + drawer content
     ------------------------- */

  function toggleDrawer() { setDrawerOpen(open => !open); }
  function resetView() { setFilters({
    showTimeline: true, showComments: true, showBlocking: true, showCritical: true,
    showDepthGradient: true, filterIssues: true, filterPRs: true, depth: 3, colorScheme: "default", dateFormat: "YYYY-MM-DD"
  }); setLayoutMode("timeline"); if (svgRef.current && svgRef.current.resetZoom) svgRef.current.resetZoom(); setSelectedNode(null); }
  function zoomIn() { if (!svgRef.current) return; d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 1.2); }
  function zoomOut() { if (!svgRef.current) return; d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 0.8); }

  // small helper for toggles
  function setFilter(key, value) { setFilters(prev => ({ ...prev, [key]: value })); }

  /* -------------------------
     Sidebar: Analytics & Summary
     ------------------------- */
  function Sidebar() {
    return (
      <div className="repograph-side">
        <div style={{ display: "flex", gap: 8 }}>
          <div className={"repograph-tab-btn active"}>Analytics</div>
          <div className={"repograph-tab-btn"}>Summary</div>
        </div>

        <div className="repograph-analytics" style={{ marginTop: 12 }}>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Total Issues</div><div style={{ fontWeight:700 }}>{stats.totalIssues}</div>
          </div>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Total PRs</div><div style={{ fontWeight:700 }}>{stats.totalPRs}</div>
          </div>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Total Links</div><div style={{ fontWeight:700 }}>{stats.totalLinks}</div>
          </div>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Avg Degree</div><div style={{ fontWeight:700 }}>{stats.avgDegree}</div>
          </div>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Max Backlinks</div><div style={{ fontWeight:700 }}>{stats.maxBacklinks}</div>
          </div>
          <div className="stat" style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <div className="repograph-small">Density</div><div style={{ fontWeight:700 }}>{stats.density}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight:600, color:"#c9d1d9" }}>Top Gravity Wells</div>
            <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
              {Array.from(nodesMap.values()).sort((a,b) => (b.inDegree||0) - (a.inDegree||0)).slice(0,5).map(n => (
                <div key={keyOf(n)} style={{ display:"flex", justifyContent:"space-between", color:"#9fb3c9" }}>
                  <div>{n.node_type === "pr" ? "PR" : "Issue"} #{n.node_id} — {n.title.slice(0,36)}</div>
                  <div style={{ fontWeight:700 }}>{n.inDegree || 0}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight:600, color:"#c9d1d9" }}>Critical Path</div>
            <div style={{ color:"#9fb3c9", marginTop:6 }}>{criticalPath.length ? criticalPath.map(k => keyOf(nodesMap.get(k))).join(" → ") : "None"}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight:600, color:"#c9d1d9" }}>Summary</div>
          <div className="repograph-summary">
            {selectedNode ? (
              <>
                <div style={{ fontWeight:700 }}>{selectedNode.node_type.toUpperCase()} #{selectedNode.node_id}: {selectedNode.title}</div>
                <div style={{ color:"#9fb3c9", marginTop:6 }}>State: <strong>{selectedNode.state}</strong> • Comments: <strong>{selectedNode.comment_count}</strong></div>
                <div style={{ marginTop:8, color:"#9fb3c9" }}>
                  <div>In-degree: {(selectedNode.inDegree || 0)}</div>
                  <div>Out-degree: {(selectedNode.outDegree || 0)}</div>
                  <div>Labels: {(selectedNode.labels || []).join(", ")}</div>
                </div>
                <div style={{ marginTop:8, color:"#9fb3c9" }}>Backlinks & dependents are shown visually on the graph.</div>
              </>
            ) : (
              <div style={{ color:"#9fb3c9" }}>Click any node to view a short summary here.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------
     Render main component
     ------------------------- */
  return (
    <div className="repograph-root repograph-container" style={{ minWidth: 980 }}>
      <div className="repograph-header">
        <div style={{ flex:1 }}>
          <h2 className="repograph-title">RepoGraph — Timeline Depth View</h2>
          <div className="repograph-sub">Vertical timeline (Y) • Horizontal depth (X) • GitHub-dark style</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="repograph-btn small" onClick={() => setLayoutMode("timeline")}>Timeline</button>
          <button className="repograph-btn small" onClick={() => setLayoutMode("hierarchical")}>Hierarchy</button>
          <button className="repograph-btn small" onClick={() => setLayoutMode("cluster")}>Cluster</button>
          <button className="repograph-btn small" onClick={() => zoomIn()}>🔍+</button>
          <button className="repograph-btn small" onClick={() => zoomOut()}>🔍−</button>
          <button className="repograph-btn small" onClick={() => resetView()}>⤴ Reset</button>
          <button className="repograph-btn primary small" onClick={() => setDrawerOpen(open => !open)} aria-expanded={drawerOpen}>⚙︎</button>
        </div>
      </div>

      <div style={{ display: drawerOpen ? "block" : "none" }} className="repograph-drawer" role="region" aria-hidden={!drawerOpen}>
        {/* Slide-down drawer controls */}
        <div className="control">
          <div className="repograph-small" style={{ color:"#9fb3c9" }}>Nodes</div>
          <label className="repograph-small"><input type="checkbox" checked={filters.filterIssues} onChange={e => setFilter("filterIssues", e.target.checked)} /> Issues</label>
          <label className="repograph-small"><input type="checkbox" checked={filters.filterPRs} onChange={e => setFilter("filterPRs", e.target.checked)} /> PRs</label>
        </div>

        <div className="control">
          <div className="repograph-small" style={{ color:"#9fb3c9" }}>Links</div>
          <label className="repograph-small"><input type="checkbox" checked={filters.showTimeline} onChange={e => setFilter("showTimeline", e.target.checked)} /> Timeline links</label>
          <label className="repograph-small"><input type="checkbox" checked={filters.showComments} onChange={e => setFilter("showComments", e.target.checked)} /> Comment mentions</label>
          <label className="repograph-small"><input type="checkbox" checked={filters.showBlocking} onChange={e => setFilter("showBlocking", e.target.checked)} /> Blocking links</label>
        </div>

        <div className="control">
          <div className="repograph-small" style={{ color:"#9fb3c9" }}>Display</div>
          <label className="repograph-small"><input type="checkbox" checked={filters.showCritical} onChange={e => setFilter("showCritical", e.target.checked)} /> Show critical path</label>
          <label className="repograph-small"><input type="checkbox" checked={filters.showDepthGradient} onChange={e => setFilter("showDepthGradient", e.target.checked)} /> Depth gradient</label>
        </div>

        <div className="control" style={{ minWidth: 220 }}>
          <div className="repograph-small" style={{ color:"#9fb3c9" }}>Depth filter</div>
          <input type="range" min="0" max="6" value={filters.depth} onChange={e => setFilter("depth", Number(e.target.value))} />
          <div className="repograph-small">Depth: <strong>{filters.depth}</strong></div>
        </div>

        <div className="control">
          <div className="repograph-small" style={{ color:"#9fb3c9" }}>Color mode</div>
          <select value={filters.colorScheme} onChange={e => setFilter("colorScheme", e.target.value)}>
            <option value="default">Default</option>
            <option value="category">By Category</option>
            <option value="activity">By Activity</option>
          </select>
        </div>
      </div>

      <div className="repograph-main">
        <div className="repograph-canvas" style={{ display:"flex", flexDirection:"column" }}>
          <div className="repograph-toolbar" style={{ justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:8 }}>
              <div className="repograph-small">Layout:</div>
              <div className="repograph-small">{layoutMode}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div className="repograph-small">Nodes: {nodesMap.size}</div>
              <div className="repograph-small">Links: {links.length}</div>
              <div className="repograph-small">Density: {stats.density}</div>
            </div>
          </div>

          <div ref={containerRef} style={{ flex:1, position:"relative", padding:12 }} />
          <div ref={tooltipRef} className="repograph-tooltip" style={{ display:"none", left:0, top:0 }} />
        </div>

        <Sidebar />
      </div>

      <div className="repograph-footer">RepoGraph • Timeline-depth view — GitHub-dark</div>
    </div>
  );
}
