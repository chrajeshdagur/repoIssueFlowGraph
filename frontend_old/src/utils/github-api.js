// GitHub API utility functions to fetch real repository data

const GITHUB_API_BASE = "https://api.github.com"

export async function fetchIssues(owner, repo, token) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const issues = await response.json()
    return issues.map((issue) => ({
      id: `issue-${issue.number}`,
      number: issue.number,
      name: `#${issue.number} ${issue.title}`,
      type: "issue",
      url: issue.html_url,
      body: issue.body || "No description",
      state: issue.state,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    }))
  } catch (error) {
    console.error("[v0] Error fetching issues:", error)
    throw error
  }
}

export async function fetchPullRequests(owner, repo, token) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const prs = await response.json()
    return prs.map((pr) => ({
      id: `pr-${pr.number}`,
      number: pr.number,
      name: `PR #${pr.number} ${pr.title}`,
      type: "pr",
      url: pr.html_url,
      body: pr.body || "No description",
      state: pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    }))
  } catch (error) {
    console.error("[v0] Error fetching pull requests:", error)
    throw error
  }
}

export async function fetchDiscussions(owner, repo, token) {
  try {
    if (!token) {
      console.warn("GitHub token required for discussions API")
      return []
    }

    const query = `
      query {
        repository(owner: "${owner}", name: "${repo}") {
          discussions(first: 50) {
            nodes {
              number
              title
              body
              createdAt
              updatedAt
              isAnswered
            }
          }
        }
      }
    `

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`GitHub GraphQL error: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    const discussions = result.data?.repository?.discussions?.nodes || []
    return discussions.map((discussion) => ({
      id: `discussion-${discussion.number}`,
      number: discussion.number,
      name: `Discussion #${discussion.number} ${discussion.title}`,
      type: "discussion",
      body: discussion.body || "No description",
      isAnswered: discussion.isAnswered,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
    }))
  } catch (error) {
    console.error("[v0] Error fetching discussions:", error)
    return []
  }
}

export function buildTreeFromData(issues, prs, discussions) {
  // Sort by date to establish relationships
  const allItems = [
    ...issues.map((i) => ({ ...i, dateKey: new Date(i.createdAt).getTime() })),
    ...prs.map((p) => ({ ...p, dateKey: new Date(p.createdAt).getTime() })),
    ...discussions.map((d) => ({ ...d, dateKey: new Date(d.createdAt).getTime() })),
  ].sort((a, b) => a.dateKey - b.dateKey)

  if (allItems.length === 0) {
    return null
  }

  // Use first issue as root, or first item if no issues
  const rootItem = issues.length > 0 ? issues[0] : allItems[0]

  const tree = {
    name: rootItem.name,
    id: rootItem.id,
    type: rootItem.type,
    url: rootItem.url || "#",
    summary: rootItem.body,
    children: [],
  }

  // Link related items as children (simplified logic - group by type)
  const issueChildren = prs.slice(0, Math.max(2, Math.floor(prs.length / 2)))
  const prChildren = discussions.slice(0, Math.floor(discussions.length / 2))

  issueChildren.forEach((pr) => {
    tree.children.push({
      name: pr.name,
      id: pr.id,
      type: pr.type,
      url: pr.url || "#",
      summary: pr.body,
      children: [],
    })
  })

  issueChildren[0]?.children?.push(
    ...prChildren.map((disc) => ({
      name: disc.name,
      id: disc.id,
      type: disc.type,
      url: disc.url || "#",
      summary: disc.body,
    })),
  )

  return tree
}

export function parseRepositoryUrl(url) {
  // Handle formats: owner/repo, https://github.com/owner/repo
  let owner, repo

  if (url.includes("github.com")) {
    const parts = url.replace("https://github.com/", "").replace("http://github.com/", "").split("/")
    owner = parts[0]
    repo = parts[1]?.replace(".git", "")
  } else if (url.includes("/")) {
    const parts = url.split("/")
    owner = parts[0]
    repo = parts[1]
  }

  return owner && repo ? { owner, repo } : null
}

// Parse GitHub issue links from text (e.g., #123, owner/repo#456)
export function parseBacklinksFromText(text, owner, repo) {
  const backlinks = []
  if (!text) return backlinks

  // Match #number format
  const issuePattern = /#(\d+)/g
  let match
  while ((match = issuePattern.exec(text)) !== null) {
    backlinks.push({
      number: Number.parseInt(match[1]),
      owner,
      repo,
      type: "issue",
    })
  }

  return backlinks
}

export async function fetchIssueWithComments(owner, repo, issueNumber, token) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    }

    // Fetch the issue
    const issueResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`, {
      headers,
    })

    if (!issueResponse.ok) {
      throw new Error(`GitHub API error: ${issueResponse.status}`)
    }

    const issue = await issueResponse.json()

    // Fetch comments
    const commentsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`,
      { headers },
    )

    let comments = []
    if (commentsResponse.ok) {
      comments = await commentsResponse.json()
    }

    // Parse backlinks from issue body and comments
    const backlinks = new Set()
    const issueBodyLinks = parseBacklinksFromText(issue.body, owner, repo)
    issueBodyLinks.forEach((link) => backlinks.add(JSON.stringify(link)))

    comments.forEach((comment) => {
      const commentLinks = parseBacklinksFromText(comment.body, owner, repo)
      commentLinks.forEach((link) => backlinks.add(JSON.stringify(link)))
    })

    return {
      issue: {
        id: `issue-${issue.number}`,
        number: issue.number,
        name: `#${issue.number} ${issue.title}`,
        type: "issue",
        url: issue.html_url,
        body: issue.body || "No description",
        state: issue.state,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      },
      backlinks: Array.from(backlinks).map((link) => JSON.parse(link)),
      comments: comments.map((c) => ({
        body: c.body,
        author: c.user.login,
        createdAt: c.created_at,
      })),
    }
  } catch (error) {
    console.error("[v0] Error fetching issue with comments:", error)
    throw error
  }
}

export async function buildTreeFromBacklinks(mainIssue, backlinks, token, owner, repo) {
  try {
    // Fetch all referenced issues
    const linkedIssues = []

    for (const link of backlinks) {
      try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${link.owner}/${link.repo}/issues/${link.number}`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(token && { Authorization: `token ${token}` }),
          },
        })

        if (response.ok) {
          const issue = await response.json()
          linkedIssues.push({
            id: `issue-${issue.number}`,
            number: issue.number,
            name: `#${issue.number} ${issue.title}`,
            type: "issue",
            url: issue.html_url,
            body: issue.body || "No description",
            state: issue.state,
          })
        }
      } catch (err) {
        console.error(`[v0] Error fetching issue #${link.number}:`, err)
      }
    }

    // Build tree with main issue as root
    const tree = {
      name: mainIssue.name,
      id: mainIssue.id,
      type: mainIssue.type,
      url: mainIssue.url,
      summary: mainIssue.body,
      state: mainIssue.state,
      children: linkedIssues.map((issue) => ({
        name: issue.name,
        id: issue.id,
        type: issue.type,
        url: issue.url,
        summary: issue.body,
        state: issue.state,
      })),
    }

    return tree
  } catch (error) {
    console.error("[v0] Error building tree from backlinks:", error)
    throw error
  }
}
