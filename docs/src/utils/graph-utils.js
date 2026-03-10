export function getColorByLabel(label) {
  const colors = {
    bug: "#da3633",
    feature: "#3fb950",
    enhancement: "#1f6feb",
    docs: "#8957e5",
    design: "#79c0ff",
    backend: "#f0883e",
    frontend: "#a371f7",
    ui: "#58a6ff",
    database: "#238636",
    security: "#f85149",
    testing: "#d29922",
    refactor: "#8b949e",
    auth: "#6f42c1",
    epic: "#3fb950",
    maintenance: "#6e7681",
    performance: "#3fb950",
  }
  return colors[label] || "#6e7681"
}

export function formatDate(date, format = "MM-DD-YY") {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, "0")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  switch (format) {
    case "MM-DD-YY":
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${String(d.getFullYear()).slice(-2)}`
    case "MM-DD":
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    case "DD-MMM":
      return `${pad(d.getDate())}-${months[d.getMonth()]}`
    case "YYYY-MM-DD":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    default:
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${String(d.getFullYear()).slice(-2)}`
  }
}

export function getActivityHeat(lastActivityDate) {
  const now = new Date()
  const daysSince = (now - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24)
  if (daysSince < 1) return "#ff6b6b"
  if (daysSince < 3) return "#ffd93d"
  if (daysSince < 7) return "#a8e6cf"
  return "#dcedc8"
}

export function calculateStats(nodes, links) {
  const issues = nodes.filter((n) => n.node_type === "issue").length
  const prs = nodes.filter((n) => n.node_type === "pr").length

  let totalDegree = 0
  nodes.forEach((n) => (totalDegree += (n.inDegree || 0) + (n.outDegree || 0)))
  const avgDegree = (totalDegree / nodes.length).toFixed(2)
  const maxBacklinks = Math.max(...nodes.map((n) => n.inDegree || 0), 0)
  const density = (((links.length * 2) / (nodes.length * (nodes.length - 1))) * 100).toFixed(1)

  return { issues, prs, links: links.length, avgDegree, maxBacklinks, density }
}

export function buildNodeMap(nodes) {
  const nodeMap = new Map()
  nodes.forEach((n) => {
    n.created_dt = new Date(n.created_at)
    n.last_dt = new Date(n.last_activity || n.created_at)
    nodeMap.set(`${n.node_type}|${n.node_id}`, n)
  })
  return nodeMap
}

export function processLinks(data, nodeMap) {
  return data.refs
    .map((r) => ({
      source: nodeMap.get(`${r.src_type}|${r.src}`),
      target: nodeMap.get(`${r.tgt_type}|${r.tgt}`),
      origin: r.origin,
      ref_type: r.ref_type,
    }))
    .filter((l) => l.source && l.target)
}

export function calculateDegrees(nodes, links) {
  nodes.forEach((n) => {
    n.inDegree = 0
    n.outDegree = 0
  })
  links.forEach((l) => {
    l.source.outDegree++
    l.target.inDegree++
  })
}

export function calculateDepth(nodes, links) {
  const depthMap = new Map()
  const queue = []
  const roots = nodes.filter((n) => n.node_type === "issue" && n.inDegree === 0)

  roots.forEach((r) => {
    depthMap.set(`${r.node_type}|${r.node_id}`, 0)
    queue.push(r)
  })

  while (queue.length) {
    const cur = queue.shift()
    const curDepth = depthMap.get(`${cur.node_type}|${cur.node_id}`)
    links.forEach((l) => {
      if (l.source === cur && l.target.node_type === "issue") {
        const tKey = `${l.target.node_type}|${l.target.node_id}`
        if (!depthMap.has(tKey)) {
          depthMap.set(tKey, Math.min(curDepth + 1, 3))
          queue.push(l.target)
        }
      }
    })
  }

  nodes.forEach((n) => {
    const key = `${n.node_type}|${n.node_id}`
    n.depth = n.node_type === "issue" ? (depthMap.get(key) ?? 0) : -1
  })
}

export function calculateCriticalPath(nodes, links) {
  let criticalPath = []
  const issueAdj = new Map()

  nodes.filter((n) => n.node_type === "issue").forEach((n) => issueAdj.set(`${n.node_type}|${n.node_id}`, []))

  links.forEach((l) => {
    if (l.source.node_type === "issue" && l.target.node_type === "issue") {
      issueAdj.get(`${l.source.node_type}|${l.source.node_id}`).push(`${l.target.node_type}|${l.target.node_id}`)
    }
  })

  function dfsPath(node, visited, path) {
    visited.add(node)
    path.push(node)
    const nbrs = issueAdj.get(node) || []
    if (path.length > criticalPath.length) criticalPath = path.slice()
    nbrs.forEach((nb) => {
      if (!visited.has(nb)) dfsPath(nb, visited, path)
    })
    visited.delete(node)
    path.pop()
  }

  issueAdj.forEach((_, k) => dfsPath(k, new Set(), []))
  return criticalPath.length
}
