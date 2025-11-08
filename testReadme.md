# 🧩 RepoGraph

**Tagline:** *Visualize Issue and PR dependencies in your repository.*

---

## 💡 Overview

RepoGraph automatically generates a **live, interactive dependency graph** of your GitHub **Issues**, **Pull Requests**, and **Discussions**. It enables users to understand relationships, trace discussions, and visualize development flow — all in one connected interface.

Designed for **maintainers, contributors, and new developers**, RepoGraph transforms complex repository histories into actionable insights through **interactive visualizations** and **AI-powered recommendations**.

---

## 🚀 Core Value Propositions

- **Visualize issue and PR relationships instantly** – See how tasks connect across your codebase.
- **Turn GitHub backlinks into an interactive dependency graph** – Transform references into navigable connections.
- **Understand how your repo connects — one link at a time** – Map the full context of development decisions.
- **Interactive network of issues and PRs — powered by backlinks** – Navigate through linked conversations and code changes.
- **See your development flow as a living graph** – Watch your project evolve with timeline-based visualization.

---

## 🎯 Target Users

### Primary Audiences
1. **New Contributors** – Quickly understand issue context and find beginner-friendly tasks.
2. **Project Maintainers** – Get a bird’s-eye view of repository health and critical paths.
3. **Code Reviewers** – Trace issue history and related changes before reviewing PRs.
4. **Open Source Teams** – Coordinate work and prevent duplicate efforts.

---

## 🧠 Key Features

### 1. **Intelligent Dependency Graph Visualization**
- **D3.js-powered interactive graphs** showing issues, PRs, and their connections.
- **Timeline-based view** displaying issue evolution: report → discussion → PR → merge.
- **Manual input mode** to visualize dependencies for any specific issue.
- **Backlink detection** via markdown parsing (“Fixes #123”, “Related to #456”).

### 2. **AI-Powered Issue Intelligence**

#### Context Summarization
- NLP-based summarization extracts:
  - Issue purpose and status
  - Blockers and dependencies
  - Discussion highlights
  - Skills or domain expertise required
- **Dependency chain explanation** — e.g., “This issue depends on #45 (API refactor) which blocks #67 (UI update).”

#### Solution Recommendations
- Predicts **which files need modification** using historical PR analysis.
- Suggests related **modules and classes** based on text patterns.
- Recommends **reviewers** based on code ownership and prior contributions.

### 3. **Newcomer Onboarding Dashboard**
- Filter issues by **complexity**, **scope**, and **required subsystems**.
- AI-generated context summaries help beginners pick meaningful first contributions.
- Dependency trees highlight learning paths and connected tasks.

### 4. **Repository Health Analytics**

#### For Maintainers
- Detect **stale PRs** (inactive, outdated, or blocked).
- Identify **merge bottlenecks** and **critical dependencies**.
- Generate **AI recommendations** for closure or archival decisions.

#### Structured Closure Workflow
1. **Request creator to close** inactive PRs.
2. **Escalate to maintainer** if creator is inactive.
3. **Archive vs. close** suggestions based on discussion value and context.

#### Critical Path Identification
- Highlights **blocking issues** and **high-dependency PRs**.
- Displays **timeline heatmaps** to visualize development activity.

---

## 🎨 Design Philosophy

### Developer-Tool Aesthetic
- **Monospace fonts** and **dark terminal-inspired UI**.
- **Keyboard shortcuts** (`/` for search, `g+i` for issues).
- **Command palette** for fast navigation.

### Analytic Dashboard Elements
- Interactive filters, sorting, and export options.
- **PNG/SVG graph export** and **CSV metrics export**.
- Shareable permalinks for specific issue clusters.

---

## 🧱 Technical Architecture

### Graph Generation Workflow
1. User inputs GitHub repo or issue number.
2. System fetches data via GitHub REST/GraphQL APIs.
3. Parses issue and PR markdown for backlinks.
4. Builds dependency graph structure.
5. Renders graph via **D3.js force-directed layout**.

### AI/ML Components
| Component | Purpose |
|------------|----------|
| **Text Summarization** | Extract key points and summaries for issues and PRs. |
| **Entity Extraction** | Identify relevant files and modules. |
| **Change Recommendation** | Suggest likely file changes based on context. |
| **Reviewer Prediction** | Recommend reviewers based on commit history. |
| **PR Maintenance AI** | Suggest closure, escalation, or archival actions. |

### Data Sources
- GitHub API: Issues, PRs, comments, commits, and metadata.
- Git history for file change tracking.
- Project boards and milestones for context.

---

## 📊 Visualization Modes

| Mode | Description |
|------|--------------|
| **Graph Mode** | Node-link graph showing relationships. |
| **Timeline Mode** | Chronological visualization of repository evolution. |
| **Cluster Mode** | Grouped issues by labels, tags, or modules. |

**Legend:** 🟢 Issue (Open) | 🔵 PR (Merged) | 🟣 Discussion | 🔺 Active Work | ⚪ Closed Node

---

## 📂 Directory Structure

```
repograph/
├── backend/
│   ├── app.py
│   ├── routes/
│   │   ├── github_api.py
│   │   ├── ai_analysis.py
│   │   └── graph_builder.py
│   ├── services/
│   │   ├── nlp_service.py
│   │   └── github_service.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphView.jsx
│   │   │   ├── IssuePanel.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Maintenance.jsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── docker-compose.yml
├── README.md
├── .env.example
└── LICENSE
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- GitHub Token with `repo` and `read:org` permissions

### Environment Setup
```bash
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

### Docker Setup
```bash
docker-compose up --build
```

---

## 🧪 Testing

- **Backend:** `pytest`
- **Frontend:** `npm test`

---

## 🧭 Contribution Workflow
1. Fork the repo.
2. Create a feature branch.
3. Commit and push.
4. Open a Pull Request.

---

## 📈 Success Metrics
- Reduced onboarding time for new contributors.
- Increased issue resolution velocity.
- Decrease in duplicate or stale PRs.

---

## 🏁 Vision

> *RepoGraph aims to be the “Google Maps of Repositories” — visualizing and simplifying the complex web of software development connections through AI-powered insights and dependency graphs.*

