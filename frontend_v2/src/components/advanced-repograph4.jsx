/**
 * advanced-repograph3.jsx
 *
 * Single-file React 18 + D3 v7 component (refined).
 *
 * Changes from previous:
 *  - Toolbar fixed above canvas with all filters (no gear)
 *  - Analytics UI restored / improved
 *  - Summary tab replaced with interactive LLM-style chat (mock)
 *  - Analytics and Summary reflect selected node
 *  - Timestamp-collision avoidance (deterministic jitter)
 *  - Legend bottom-right describing visuals
 *
 * Usage:
 *   import AdvancedRepoGraph3 from './advanced-repograph3.jsx';
 *   <AdvancedRepoGraph3 />
 *
 * Dependencies: react, d3
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

/* -------------------------
   Minimal GitHub-dark CSS injection
   ------------------------- */
const injectStyles = () => {
  if (document.getElementById("adv-repograph3-styles")) return;
  const s = document.createElement("style");
  s.id = "adv-repograph3-styles";
  s.innerHTML = `
    /* (trimmed) GitHub-dark theme snippets for component */
    .adv-root { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#c9d1d9; background:transparent; }
    .adv-header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#0d1117; border-bottom:1px solid #21262d; border-radius:8px 8px 0 0; }
    .adv-title { font-size:18px; margin:0; color:#e6edf3; }
    .adv-sub { font-size:12px; color:#8b949e; margin:0; }
    .adv-toolbar { display:flex; gap:8px; align-items:center; }
    .adv-btn { padding:6px 8px; border-radius:6px; border:1px solid #21262d; background:#07101a; color:#c9d1d9; cursor:pointer; }
    .adv-btn.primary { background:#1f6feb; border-color:#2f6fe8; color:white; }
    .adv-main { display:flex; gap:12px; padding:12px; }
    .adv-canvas { flex:1; background:linear-gradient(180deg,#02040a,#071014); border-radius:8px; padding:8px; position:relative; min-height:720px; border:1px solid #21262d; }
    .adv-sidebar { width:320px; background:#06090c; border-radius:8px; padding:12px; color:#c9d1d9; border:1px solid #21262d; }
    .adv-drawer { display:flex; gap:12px; margin-top:8px; align-items:center; background:#02050a; padding:10px; border-radius:6px; border:1px solid #21262d; }
    .adv-drawer .col { display:flex; flex-direction:column; gap:6px; color:#9fb3c9; font-size:13px; }
    .adv-tooltip { position:absolute; pointer-events:none; background:#010409; border:1px solid #2b2f34; padding:8px; border-radius:6px; color:#e6edf3; font-size:12px; box-shadow:0 6px 18px rgba(2,6,23,0.6); z-index:9999; }
    .adv-legend { position:absolute; right:12px; bottom:12px; background:#02050a; border:1px solid #21262d; padding:8px; border-radius:6px; color:#9fb3c9; font-size:12px; width:260px;}
    .adv-legend .row{ display:flex; gap:8px; align-items:center; margin-bottom:6px;}
    .adv-legend .sw { width:16px; height:10px; border-radius:2px; }
    .adv-analytics .stat { display:flex; justify-content:space-between; padding:8px 6px; border-bottom:1px dashed #17202a; color:#9fb3c9; }
    .adv-chat { background:#02050a; border:1px solid #1f2a33; padding:8px; border-radius:6px; height:220px; overflow:auto; }
    .adv-chat .user { color:#58a6ff; font-weight:600; }
    .adv-chat .ai { color:#7a5cff; }
    .adv-chat-input { display:flex; gap:8px; margin-top:8px; }
    .adv-chat-input input { flex:1; padding:8px; border-radius:6px; border:1px solid #21262d; background:#07101a; color:#c9d1d9;}
    .adv-small { font-size:12px; color:#9fb3c9; }
  `;
  document.head.appendChild(s);
};

/* -------------------------
   Sample data (same structure)
   ------------------------- */
const SAMPLE = {
  nodes: [
    { node_type: "issue", node_id: 12, title: "Implement login", created_at: "2025-09-01T10:00:23Z", last_activity: "2025-09-07T10:00:00Z", state: "open", labels: ["feature"], comment_count: 24 },
    { node_type: "issue", node_id: 23, title: "Login sub-task", created_at: "2025-09-02T11:30:12Z", last_activity: "2025-09-07T09:00:00Z", state: "open", labels: ["backend"], comment_count: 6 },
    { node_type: "issue", node_id: 78, title: "Auth edge-case", created_at: "2025-09-03T08:15:55Z", last_activity: "2025-09-05T14:00:00Z", state: "open", labels: ["bug"], comment_count: 12 },
    { node_type: "issue", node_id: 66, title: "Fix stale cookie", created_at: "2025-09-04T09:00:13Z", last_activity: "2025-09-06T12:00:00Z", state: "closed", labels: ["security"], comment_count: 8 },
    { node_type: "pr", node_id: 89, title: "Login feature PR", created_at: "2025-09-02T09:00:05Z", last_activity: "2025-09-07T10:30:00Z", state: "merged", labels: ["feature"], comment_count: 5 },
    { node_type: "pr", node_id: 67, title: "Cookie fix PR", created_at: "2025-09-04T15:00:00Z", last_activity: "2025-09-07T16:00:12Z", state: "open", labels: ["urgent"], comment_count: 10 },
    { node_type: "pr", node_id: 56, title: "Combined fixes PR", created_at: "2025-09-07T10:00:00Z", last_activity: "2025-09-07T17:15:00Z", state: "open", labels: ["chore"], comment_count: 18 }
  ],
  refs: [
    { src_type: "issue", src: 12, tgt_type: "issue", tgt: 23, origin: "comment", ref_type: "depends_on", depth: 1 },
    { src_type: "issue", src: 12, tgt_type: "pr", tgt: 89, origin: "timeline", ref_type: "linked_pr", depth: 1 },
    { src_type: "issue", src: 23, tgt_type: "issue", tgt: 78, origin: "comment", ref_type: "mentions", depth: 2 },
    { src_type: "issue", src: 78, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "mentions", depth: 3 },
    { src_type: "pr", src: 67, tgt_type: "issue", tgt: 66, origin: "comment", ref_type: "fixes", depth: 1 }
  ]
};

/* -------------------------
   Helpers (depths, critical path, jitter)
   ------------------------- */

const keyOf = n => `${n.node_type}|${n.node_id}`;

function parseDate(s) {
  if (!s) return new Date();
  return new Date(s);
}

function computeDepths(nodesMap, refs, maxDepth = 6) {
  // BFS depth for issues (issue->issue edges)
  const incoming = new Map();
  nodesMap.forEach((v,k) => { if (v.node_type === "issue") incoming.set(k, []); });
  refs.forEach(r => {
    if (r.src_type === "issue" && r.tgt_type === "issue") {
      const t = `${r.tgt_type}|${r.tgt}`;
      if (incoming.has(t)) incoming.get(t).push(`${r.src_type}|${r.src}`);
    }
  });
  const roots = [];
  incoming.forEach((arr, k) => { if (!arr || arr.length === 0) roots.push(k); });
  const depths = new Map();
  const q = [];
  roots.forEach(r => { depths.set(r,0); q.push(r); });
  while (q.length) {
    const cur = q.shift(); const d = depths.get(cur);
    refs.forEach(r => {
      const s = `${r.src_type}|${r.src}`, t = `${r.tgt_type}|${r.tgt}`;
      if (s === cur && r.tgt_type === "issue") {
        if (!depths.has(t)) { depths.set(t, Math.min(d+1, maxDepth)); q.push(t); }
      }
    });
  }
  return depths;
}

function computeCriticalPath(nodesMap, refs) {
  // DFS longest path among issues
  const adj = new Map();
  nodesMap.forEach((v,k) => { if (v.node_type === "issue") adj.set(k, []); });
  refs.forEach(r => {
    if (r.src_type === "issue" && r.tgt_type === "issue") {
      const s = `${r.src_type}|${r.src}`, t = `${r.tgt_type}|${r.tgt}`;
      if (adj.has(s)) adj.get(s).push(t);
    }
  });
  let longest = [];
  function dfs(node, visited, path) {
    visited.add(node); path.push(node);
    if (path.length > longest.length) longest = path.slice();
    (adj.get(node) || []).forEach(nb => { if (!visited.has(nb)) dfs(nb, visited, path); });
    visited.delete(node); path.pop();
  }
  Array.from(adj.keys()).forEach(k => dfs(k, new Set(), []));
  return longest;
}

/* jitter to separate nodes with near-identical timestamps.
   deterministic: use node id and timestamp to compute small offset */
function deterministicJitter(baseY, nodeId, index) {
  // index is tie-breaker
  const seed = (nodeId % 10) + index;
  const jitter = ((seed * 9301 + 49297) % 233280) / 233280; // pseudo-random [0,1)
  const offset = (jitter - 0.5) * 24; // ±12 px
  return baseY + offset;
}

/* -------------------------
   Component
   ------------------------- */

export default function AdvancedRepoGraph3({ initialData = SAMPLE }) {
  injectStyles();

  // refs
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgRef = useRef(null);

  // state
  const [data, setData] = useState(initialData);
  const [layout, setLayout] = useState("timeline");
  const [filters, setFilters] = useState({
    showTimeline: true, showComments: true, showBlocking: true, showCritical: true,
    filterIssues: true, filterPRs: true, depth: 3, colorMode: "default", dateFormat: "YYYY-MM-DD HH:mm:ss"
  });
  const [selected, setSelected] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: "system", text: "LLM mock connected. Ask about the selected Issue/PR." }
  ]);

  // prepare maps
  const nodesMap = useMemo(() => {
    const m = new Map();
    (data.nodes || []).forEach(n => {
      m.set(keyOf(n), { ...n, created_dt: parseDate(n.created_at), last_dt: parseDate(n.last_activity), inDegree: 0, outDegree: 0 });
    });
    return m;
  }, [data]);

  const links = useMemo(() => {
    const arr = (data.refs || []).map(r => {
      const sKey = `${r.src_type}|${r.src}`, tKey = `${r.tgt_type}|${r.tgt}`;
      const s = nodesMap.get(sKey), t = nodesMap.get(tKey);
      if (!s || !t) return null;
      return { source: s, target: t, origin: r.origin, ref_type: r.ref_type, depth: r.depth };
    }).filter(Boolean);
    arr.forEach(l => {
      l.source.outDegree = (l.source.outDegree || 0) + 1;
      l.target.inDegree = (l.target.inDegree || 0) + 1;
    });
    return arr;
  }, [data, nodesMap]);

  const depthMap = useMemo(() => computeDepths(nodesMap, data.refs || [], 6), [nodesMap, data.refs]);
  const criticalPath = useMemo(() => computeCriticalPath(nodesMap, data.refs || []), [nodesMap, data.refs]);

  // stats for analytics
  const stats = useMemo(() => {
    const nodes = Array.from(nodesMap.values());
    const totalIssues = nodes.filter(n => n.node_type === "issue").length;
    const totalPRs = nodes.filter(n => n.node_type === "pr").length;
    const totalLinks = links.length;
    const avgDegree = (nodes.reduce((s,n)=>s+((n.inDegree||0)+(n.outDegree||0)),0) / Math.max(1,nodes.length)).toFixed(2);
    const maxBacklinks = nodes.reduce((m,n)=>Math.max(m, n.inDegree||0),0);
    const density = nodes.length > 1 ? (((totalLinks * 2) / (nodes.length * (nodes.length - 1))) * 100).toFixed(1) + "%" : "0%";
    return { totalIssues, totalPRs, totalLinks, avgDegree, maxBacklinks, density };
  }, [nodesMap, links]);

  /* D3 render */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    d3.select(container).selectAll("svg").remove();

    // dims
    const width = container.clientWidth || 1100;
    const height = container.clientHeight || 720;
    const margin = { top: 120, right: 20, bottom: 60, left: 140 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container).append("svg").attr("width", width).attr("height", height).style("background", "transparent");
    svgRef.current = svg.node();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // nodes array
    const nodesArr = Array.from(nodesMap.values()).map(n => ({ ...n }));

    // assign depths for issues
    nodesArr.forEach(n => {
      if (n.node_type === "issue") {
        const k = keyOf(n);
        n.depth = depthMap.get(k) ?? 0;
      } else n.depth = -1;
    });

    // y time scale (top earliest)
    const minDate = d3.min(nodesArr, d => d.created_dt) || new Date();
    const maxDate = d3.max(nodesArr, d => d.created_dt) || new Date();
    const yScale = d3.scaleTime().domain([minDate, maxDate]).range([0, innerH]);

    // x scale depth -> left to right
    const maxDepth = Math.max(1, ...nodesArr.map(n => (n.depth >= 0 ? n.depth : 0)));
    const xScale = d3.scaleLinear().domain([0, Math.max(filters.depth, maxDepth) + 1]).range([0, innerW]);

    // avoid overlapping: group nodes by timestamp second and jitter slightly horizontally (or vertically) deterministically
    // We'll group by time-key = ISO string truncated to seconds
    const timeBuckets = new Map();
    nodesArr.forEach(n => {
      const tkey = new Date(n.created_dt).toISOString().slice(0,19); // up to seconds
      if (!timeBuckets.has(tkey)) timeBuckets.set(tkey, []);
      timeBuckets.get(tkey).push(n);
    });
    // assign base positions then jitter
    nodesArr.forEach(n => {
      // default x by depth
      const baseX = xScale(n.depth >= 0 ? n.depth : 0);
      const baseY = yScale(n.created_dt);
      const bucket = timeBuckets.get(new Date(n.created_dt).toISOString().slice(0,19)) || [];
      const idx = bucket.findIndex(ii => ii.node_id === n.node_id && ii.node_type === n.node_type);
      // jitter horizontally slightly so same timestamps separate visually
      const jitteredX = baseX + (idx - (bucket.length - 1)/2) * Math.max(18, 28 / Math.max(1, bucket.length));
      const jitteredY = deterministicJitter(baseY, n.node_id, idx);
      n.x = jitteredX;
      n.y = jitteredY;
    });

    // draw Y axis (time) at left
    const yAxisG = g.append("g").attr("class","y-axis");
    const yAxis = d3.axisLeft(yScale).ticks(8).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S"));
    yAxisG.call(yAxis).selectAll("text").style("fill","#9fb3c9").style("font-size",11);
    yAxisG.selectAll("path,line").style("stroke","#21262d").style("opacity",0.8);

    // draw X axis depth at top
    const xAxisG = g.append("g").attr("class","x-axis").attr("transform", `translate(0,-32)`);
    const depthTicks = xScale.ticks(Math.max(3, Math.ceil(xScale.domain()[1])));
    xAxisG.selectAll("text").data(depthTicks).enter().append("text").attr("x", d => xScale(d)).attr("y",-18).attr("fill","#9fb3c9").attr("text-anchor","middle").text(d => `Depth ${d}`);

    // link layer
    const linkLayer = g.append("g").attr("class","links");
    const visibleLinks = links.filter(l => {
      if (!filters.showTimeline && l.origin === "timeline") return false;
      if (!filters.showComments && l.origin === "comment") return false;
      if (!filters.showBlocking && l.ref_type === "blocked_by") return false;
      // depth filter
      if (l.source.node_type === "issue") {
        const sd = depthMap.get(keyOf(l.source)) ?? 0;
        if (sd > filters.depth) return false;
      }
      if (l.target.node_type === "issue") {
        const td = depthMap.get(keyOf(l.target)) ?? 0;
        if (td > filters.depth) return false;
      }
      // node type filter
      if (!filters.filterIssues && (l.source.node_type === "issue" || l.target.node_type === "issue")) return false;
      if (!filters.filterPRs && (l.source.node_type === "pr" || l.target.node_type === "pr")) return false;
      return true;
    });

    visibleLinks.forEach(l => {
      const s = nodesArr.find(n => n.node_type === l.source.node_type && n.node_id === l.source.node_id);
      const t = nodesArr.find(n => n.node_type === l.target.node_type && n.node_id === l.target.node_id);
      if (!s || !t) return;
      const cx = (s.x + t.x)/2;
      // control point above for aesthetic
      const ctrlY = Math.min(s.y, t.y) - 60 - Math.abs(t.x - s.x) * 0.15;
      const path = `M ${s.x},${s.y} Q ${cx},${ctrlY} ${t.x},${t.y}`;
      const isTimeline = l.origin === "timeline";
      const isBlocking = l.ref_type === "blocked_by";
      linkLayer.append("path").attr("d", path).attr("stroke", isBlocking ? "#ff6b6b" : isTimeline ? "#9fb3c9" : "#d29922").attr("stroke-width", isBlocking ? 2.6 : 1.6).attr("fill","none").attr("stroke-dasharray", isTimeline ? "0" : (isBlocking ? "8 4" : "6 4")).attr("opacity",0.9)
        .on("mouseenter",(ev)=>{ if (tooltipRef.current) { tooltipRef.current.style.display='block'; tooltipRef.current.innerHTML=`<div style="font-weight:700">${l.ref_type}</div><div style="font-size:12px">origin: ${l.origin}</div>`; } })
        .on("mousemove",(ev)=>{ if (tooltipRef.current) { tooltipRef.current.style.left = ev.pageX + 12 + "px"; tooltipRef.current.style.top = ev.pageY + 12 + "px"; } })
        .on("mouseleave",()=>{ if (tooltipRef.current) tooltipRef.current.style.display='none'; });
    });

    // node layer
    const nodeLayer = g.append("g").attr("class","nodes");
    const degMax = d3.max(nodesArr, d => (d.inDegree || 0) + (d.outDegree || 0)) || 1;
    const sizeScale = d3.scaleSqrt().domain([0, degMax]).range([6, 20]);

    const nodeG = nodeLayer.selectAll("g.node").data(nodesArr.filter(n => {
      if (!filters.filterIssues && n.node_type === "issue") return false;
      if (!filters.filterPRs && n.node_type === "pr") return false;
      if (n.node_type === "issue" && (depthMap.get(keyOf(n)) ?? 0) > filters.depth) return false;
      return true;
    })).enter().append("g").attr("transform", d => `translate(${d.x},${d.y})`).attr("class","node").style("cursor","pointer");

    // halos
    nodeG.append("circle").filter(d => ((d.inDegree || 0) + (d.outDegree || 0)) >= 3).attr("r", d => sizeScale((d.inDegree || 0) + (d.outDegree || 0)) + 10).attr("fill","#ffe6b3").attr("opacity",0.22).lower();

    // shapes
    nodeG.each(function(d) {
      const gnode = d3.select(this);
      const size = sizeScale((d.inDegree || 0) + (d.outDegree || 0));
      const gradientFill = `hsl(${220 + (d.depth>=0?d.depth:0)*15} 70% ${60 - Math.min(30,(d.depth||0)*6)}%)`;
      if (d.node_type === "issue") {
        gnode.append("circle").attr("r", size).attr("fill", gradientFill).attr("stroke","#0b1220").attr("stroke-width",1.4);
      } else {
        gnode.append("rect").attr("x",-size).attr("y",-size*0.7).attr("width",size*2).attr("height",size*1.4).attr("rx",4).attr("fill","#3fb950").attr("stroke","#0b1220").attr("stroke-width",1.4);
      }
      gnode.append("circle").attr("r",4).attr("cx", size + 8).attr("cy", -size - 8).attr("fill", d.state === "open" ? "#2ea043" : d.state === "merged" ? "#7a5cff" : "#6e7681").attr("stroke","#0b1220");
    });

    // labels + badges
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree||0)+(d.outDegree||0)) + 12)).attr("y",4).attr("fill","#c9d1d9").attr("font-size",11).text(d => `${d.node_type==='pr' ? 'PR' : 'Issue'} #${d.node_id}`);
    nodeG.append("text").attr("x", d => (sizeScale((d.inDegree||0)+(d.outDegree||0)) + 12)).attr("y",18).attr("fill","#9fb3c9").attr("font-size",10).text(d => `↕${(d.inDegree||0)+(d.outDegree||0)} • ${d.comment_count || 0}c`);

    // interactions
    nodeG.on("mouseenter",(ev,d)=> { if (tooltipRef.current) { tooltipRef.current.style.display='block'; tooltipRef.current.innerHTML=`<div style="font-weight:700">${d.node_type.toUpperCase()} ${d.node_id}</div><div style="font-size:12px">${d.title}</div>`; tooltipRef.current.style.left = ev.pageX + 12 + "px"; tooltipRef.current.style.top = ev.pageY + 12 + "px"; } })
      .on("mousemove",(ev)=> { if (tooltipRef.current) { tooltipRef.current.style.left = ev.pageX + 12 + "px"; tooltipRef.current.style.top = ev.pageY + 12 + "px"; } })
      .on("mouseleave",()=> { if (tooltipRef.current) tooltipRef.current.style.display='none'; })
      .on("click",(ev,d)=> { setSelected(d); /* push a sample chat summary for LLM mock */ setChatMessages(prev => [...prev, { role: "user", text: `Summarize ${d.node_type} #${d.node_id}` }, { role: "ai", text: `Mock summary for ${d.node_type} #${d.node_id}: Title="${d.title}". Comments=${d.comment_count}. State=${d.state}.` }]); });

    // critical path overlay
    if (filters.showCritical && criticalPath && criticalPath.length > 1) {
      const coords = criticalPath.map(k => {
        const n = nodesArr.find(nn => keyOf(nn) === k);
        return n ? [n.x, n.y] : null;
      }).filter(Boolean);
      if (coords.length > 1) {
        g.append("path").attr("d", d3.line().curve(d3.curveMonotoneX)(coords)).attr("fill","none").attr("stroke","#d07a00").attr("stroke-width",3).attr("opacity",0.7);
      }
    }

    // zoom/pan
    const zoom = d3.zoom().scaleExtent([0.5,4]).on("zoom",(ev)=>{ g.attr("transform", ev.transform); });
    svg.call(zoom);
    svg.node().resetZoom = () => svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);

    return () => d3.select(container).selectAll("svg").remove();

  }, [data, filters, layout, nodesMap, links, depthMap, criticalPath]);

  /* side actions */
  const toggleFilter = (k) => setFilters(prev => ({ ...prev, [k]: !prev[k] }));
  const setFilterValue = (k,v) => setFilters(prev => ({ ...prev, [k]: v }));
  const zoomIn = () => { if (svgRef.current) d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 1.2); };
  const zoomOut = () => { if (svgRef.current) d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 0.8); };
  const resetZoom = () => { if (svgRef.current && svgRef.current.resetZoom) svgRef.current.resetZoom(); };

  // chat send (LLM mock)
  function sendChat(msg) {
    if (!msg) return;
    setChatMessages(prev => [...prev, { role: "user", text: msg }, { role: "ai", text: `LLM mock reply: I analyzed selection ${(selected ? (selected.node_type + " #" + selected.node_id) : "none")}. For "${msg}" -> sample insights...` }]);
  }

  /* render UI */
  return (
    <div className="adv-root">
      <div className="adv-header">
        <div>
          <div className="adv-title">RepoGraph — Timeline Depth</div>
          <div className="adv-sub">Vertical time (Y) • Horizontal depth (X) — toolbar above</div>
        </div>

        <div className="adv-toolbar">
          <button className="adv-btn" onClick={() => setLayout("timeline")}>Timeline</button>
          <button className="adv-btn" onClick={() => setLayout("hierarchical")}>Hierarchy</button>
          <button className="adv-btn" onClick={() => setLayout("cluster")}>Cluster</button>

          <div style={{ width:1, height:28, background:"#1b2228" }} />

          <button className="adv-btn" onClick={zoomIn}>🔍+</button>
          <button className="adv-btn" onClick={zoomOut}>🔍−</button>
          <button className="adv-btn" onClick={resetZoom}>⤴ Reset</button>

          <div style={{ width:1, height:28, background:"#1b2228" }} />

          {/* filters on toolbar for easy selection */}
          <label className="adv-small" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={filters.filterIssues} onChange={() => toggleFilter("filterIssues")} /> Issues
          </label>
          <label className="adv-small" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={filters.filterPRs} onChange={() => toggleFilter("filterPRs")} /> PRs
          </label>
          <label className="adv-small" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={filters.showTimeline} onChange={() => toggleFilter("showTimeline")} /> Timeline links
          </label>
          <label className="adv-small" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={filters.showComments} onChange={() => toggleFilter("showComments")} /> Comments
          </label>

          <div style={{ width:1, height:28, background:"#1b2228" }} />

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div className="adv-small">Depth</div>
            <input type="range" min="0" max="6" value={filters.depth} onChange={e => setFilterValue("depth", Number(e.target.value))} />
            <div className="adv-small">{filters.depth}</div>
          </div>
        </div>

        {/* slide-down drawer area implemented as immediate block below header */}
        <div style={{ width:"100%", background:"#02050a", borderTop:"1px solid #121417", padding:"8px 14px", display:"flex", gap:12 }}>
          <div className="adv-drawer">
            <div className="col">
              <div className="adv-small">Display</div>
              <label className="adv-small"><input type="checkbox" checked={filters.showBlocking} onChange={() => toggleFilter("showBlocking")} /> Show Blocking links</label>
              <label className="adv-small"><input type="checkbox" checked={filters.showCritical} onChange={() => toggleFilter("showCritical")} /> Show Critical Path</label>
            </div>
            <div className="col">
              <div className="adv-small">Color</div>
              <select value={filters.colorMode} onChange={e => setFilterValue("colorMode", e.target.value)}>
                <option value="default">Default</option>
                <option value="category">By Category</option>
                <option value="activity">By Activity</option>
              </select>
            </div>
            <div className="col">
              <div className="adv-small">Date format</div>
              <select value={filters.dateFormat} onChange={e => setFilterValue("dateFormat", e.target.value)}>
                <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
                <option value="MM-DD HH:mm">MM-DD HH:mm</option>
                <option value="DD-MMM">DD-MMM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="adv-main">
        <div className="adv-canvas" style={{ minHeight:700, position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div className="adv-small">Nodes: {nodesMap.size}</div>
            <div className="adv-small">Links: {links.length} • Density: {stats.density}</div>
          </div>

          <div ref={containerRef} style={{ width:"100%", height:600 }} />
          <div ref={tooltipRef} className="adv-tooltip" style={{ display:"none" }} />

          {/* legend bottom-right */}
          <div className="adv-legend" role="note" aria-label="Legend: lines and node types">
            <div style={{ fontWeight:700, marginBottom:6, color:"#e6edf3" }}>Legend</div>
            <div className="row"><div className="sw" style={{ background:"#9fb3c9" }}></div><div>Solid — timeline link (connected PRs)</div></div>
            <div className="row"><div className="sw" style={{ background:"linear-gradient(90deg,#9fb3c9,#d29922)" }}></div><div>Dashed — comment mention</div></div>
            <div className="row"><div className="sw" style={{ background:"#ff6b6b" }}></div><div>Blocked / blocking (red)</div></div>
            <div className="row"><div style={{ width:12, height:12, borderRadius:6, background:"#58a6ff" }}></div><div>Issue node (circle)</div></div>
            <div className="row"><div style={{ width:16, height:12, background:"#3fb950", borderRadius:3 }}></div><div>PR node (square)</div></div>
            <div className="row"><div style={{ width:12, height:12, borderRadius:2, background:"#ffe6b3" }}></div><div>Halo — high-degree node</div></div>
            <div style={{ marginTop:8, fontSize:12, color:"#9fb3c9" }}>Tip: click a node to load Analytics & Summary (AI chat mock).</div>
          </div>
        </div>

        <div className="adv-sidebar">
          <div style={{ display:"flex", gap:8 }}>
            <div className="adv-tab active">Analytics</div>
            <div className="adv-tab">Summary (AI)</div>
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:700, color:"#e6edf3" }}>Analytics</div>
            <div className="adv-analytics" style={{ marginTop:8 }}>
              <div className="stat"><div>Total Issues</div><div style={{ fontWeight:700 }}>{stats.totalIssues}</div></div>
              <div className="stat"><div>Total PRs</div><div style={{ fontWeight:700 }}>{stats.totalPRs}</div></div>
              <div className="stat"><div>Total Links</div><div style={{ fontWeight:700 }}>{stats.totalLinks}</div></div>
              <div className="stat"><div>Avg Degree</div><div style={{ fontWeight:700 }}>{stats.avgDegree}</div></div>
              <div className="stat"><div>Max Backlinks</div><div style={{ fontWeight:700 }}>{stats.maxBacklinks}</div></div>
              <div className="stat"><div>Density</div><div style={{ fontWeight:700 }}>{stats.density}</div></div>
            </div>
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:700, color:"#e6edf3" }}>Summary (AI Chat)</div>
            <div className="adv-chat" role="log" aria-live="polite">
              {chatMessages.map((m,i) => (
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ fontSize:12, color: m.role === "user" ? "#58a6ff" : "#7a5cff", fontWeight:700 }}>{m.role.toUpperCase()}</div>
                  <div style={{ color:"#c9d1d9", marginTop:4 }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="adv-chat-input">
              <input placeholder={selected ? `Ask about ${selected.node_type} #${selected.node_id}` : "Ask about an issue or PR..."} onKeyDown={(e) => { if (e.key === "Enter") { sendChat(e.target.value); e.target.value = ""; } }} />
              <button className="adv-btn primary" onClick={() => { const inp = document.querySelector(".adv-chat-input input"); if (inp) { sendChat(inp.value); inp.value = ""; } }}>Send</button>
            </div>
          </div>

          <div style={{ marginTop:12, fontSize:13, color:"#9fb3c9" }}>
            <div style={{ fontWeight:700 }}>Selected</div>
            {!selected ? <div style={{ marginTop:8 }}>Click a node to see details & AI summary here.</div> : (
              <div style={{ marginTop:8 }}>
                <div style={{ fontWeight:700 }}>{selected.node_type.toUpperCase()} #{selected.node_id}</div>
                <div style={{ color:"#9fb3c9", marginTop:6 }}>{selected.title}</div>
                <div style={{ marginTop:8 }}><strong>State:</strong> {selected.state}</div>
                <div style={{ marginTop:6 }}><strong>In:</strong> {selected.inDegree || 0} <strong style={{ marginLeft:8 }}>Out:</strong> {selected.outDegree || 0}</div>
                <div style={{ marginTop:6 }}><strong>Labels:</strong> {(selected.labels||[]).join(", ")}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
