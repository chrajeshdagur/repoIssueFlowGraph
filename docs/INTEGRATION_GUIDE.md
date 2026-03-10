# AdvancedRepoGraph Integration Guide

This document outlines how the enhanced `repograph_enhanced_v1.html` has been converted and integrated into your React project.

## Overview

The standalone HTML visualization has been converted into a modular, maintainable React component architecture with the following structure:

## Project Structure

\`\`\`
src/
├── components/
│   ├── advanced-repograph.jsx       # Main visualization component (replaces old graph)
│   ├── header.jsx                    # Project header with branding
│   ├── footer.jsx                    # Footer attribution
│   └── icon.jsx                      # RepoIssueFlow-Graph logo icon
├── utils/
│   ├── sample-data.js                # Default sample data for initial load
│   ├── graph-utils.js                # D3 utilities & graph calculations
│   └── github-api.js                 # GitHub API integration (existing)
├── styles/
│   └── advanced-repograph.css        # Complete styling (GitHub dark theme)
├── App.jsx                            # Simplified main app (now just uses AdvancedRepoGraph)
├── main.jsx                           # Vite entry point
├── index.css                          # Global styles
└── App.css                            # App-level styles
\`\`\`

## Key Components

### 1. **AdvancedRepoGraph** (`src/components/advanced-repograph.jsx`)
The main visualization component featuring:
- D3.js force-directed graph rendering
- Multiple layout modes: Timeline, Hierarchical, Cluster
- Real-time GitHub API data fetching (public repos)
- Advanced filtering (Issues, Pull Requests)
- Color schemes: By Type, By Category, By Activity Heatmap
- Zoom controls (In, Out, Reset) with smooth transitions
- Interactive tooltips on hover
- Real-time statistics (critical path, density, degree calculations)
- Gravity wells (top backlinked nodes)
- Responsive design

### 2. **Sample Data** (`src/utils/sample-data.js`)
Pre-loaded authentication system example with:
- 9 nodes (issues & pull requests)
- 13 interconnected references
- Real relationship types: closes, implements, impacts, references, tests, validates

### 3. **Graph Utilities** (`src/utils/graph-utils.js`)
Utility functions for:
- Color mapping by labels
- Date formatting
- Activity heat calculations
- Statistical analysis (degree, density, critical paths)
- Node map building
- Link processing
- Depth calculations

## Features Preserved from HTML

✅ **Visualization**
- D3.js force-directed & layout-based graph rendering
- Node types: Issues (circles) & PRs (rectangles)
- State indicators: Open (green), Closed (gray), Merged (purple)
- Degree rings showing connectivity
- Size scaling based on degree

✅ **Interactions**
- Hover tooltips with node details
- Zoom in/out with smooth transitions
- Reset zoom to initial view
- Filter by node type
- Multiple layout modes (timeline, hierarchical, cluster)
- Color scheme toggles

✅ **Analytics**
- Real-time statistics panel
- Critical path calculation
- Graph density metrics
- Node degree analysis
- Top gravity wells (most backlinked items)

✅ **Data Source**
- GitHub API integration for public repositories
- Automatic issue/PR fetching
- Reference extraction from titles and comments
- Sample data for immediate visualization

## How to Use

### Default Load (Sample Data)
\`\`\`jsx
// AdvancedRepoGraph loads sample data by default
// No configuration needed - starts with authentication system example
\`\`\`

### Load a Public Repository
1. Enter repository path: `owner/repo` (e.g., `facebook/react`)
2. Click "Load Graph"
3. System fetches up to 25 issues/PRs and their references
4. Graph renders automatically

### Search GitHub URL
- Paste full GitHub URLs: `https://github.com/owner/repo`
- System automatically extracts owner/repo

### Advanced Filtering
- Toggle Issues/PRs visibility in left panel
- Change layout: Timeline (default), Hierarchical, or Cluster
- Switch color schemes: By Type, By Category, By Activity
- Toggle metrics display and activity heatmap

## API Integration

### GitHub REST API (No Auth Required)
- Fetches up to 25 issues/PRs per repository
- Public repositories only (no authentication needed)
- Automatic reference extraction from issue/PR text
- Rate limit: ~60 requests/hour for unauthenticated

### Optional: Add GitHub Token
For higher rate limits (5,000 requests/hour):
1. Generate token at https://github.com/settings/tokens
2. Enter token in input field before loading repo
3. Can access private repositories with token

## Data Structure

### Nodes
\`\`\`javascript
{
  node_id: 45,                    // GitHub issue/PR number
  node_type: "issue" | "pr",      // Node type
  title: "Fix auth flow",         // Issue/PR title
  state: "open" | "closed" | "merged",
  comment_count: 12,              // Number of comments
  labels: ["bug", "auth"],        // Issue labels
  created_at: "ISO8601",          // Creation timestamp
  last_activity: "ISO8601"        // Last update timestamp
}
\`\`\`

### References/Links
\`\`\`javascript
{
  src_type: "issue" | "pr",       // Source type
  src: 101,                        // Source ID
  tgt_type: "issue" | "pr",       // Target type
  tgt: 45,                         // Target ID
  origin: "comment" | "timeline",  // Where reference was found
  ref_type: "closes" | "implements" | "impacts" | "references" | "mentions",
  depth: 1                         // Hierarchy depth
}
\`\`\`

## Color Scheme

The interface uses GitHub's dark theme:
- **Primary**: #0d1117 (dark background)
- **Secondary**: #161b22 (panels)
- **Accent**: #58a6ff (blue highlights)
- **Success**: #3fb950 (green - merged/open)
- **Danger**: #f85149 (red - critical)
- **Warning**: #ffd93d (yellow - high backlinks)

## State Management

All state is managed within the `AdvancedRepoGraph` component using React hooks:
- `graphData` - Current graph nodes and links
- `filters` - Visibility toggles
- `layoutMode` - Graph layout algorithm
- `colorScheme` - Node coloring strategy
- `stats` - Calculated metrics
- `loading` - Async operation status
- `error` - Error messages

## Performance Considerations

- D3 rendering optimized for up to ~100 nodes
- For larger graphs, consider pagination or filtering
- Zoom transitions use 100ms for snappy response
- GitHub API calls are cached in state
- Tooltip rendering only on hover (not pre-rendered)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile (responsive design for tablets+)

## Troubleshooting

### "No issues found"
- Repository may be private (use token)
- Repository may have no issues/PRs
- API rate limit may be exceeded

### Graph not rendering
- Check browser console for errors
- Ensure D3 is loaded: `npm install d3`
- Verify repo path format: `owner/repo`

### Slow performance
- Reduce number of fetched items
- Try different layout mode (cluster is fastest)
- Zoom into specific areas

## Development Notes

### Adding New Features
1. Update state in `AdvancedRepoGraph`
2. Add utility functions to `graph-utils.js`
3. Update D3 rendering logic in `renderGraph()`
4. Add CSS to `advanced-repograph.css`

### Customizing Colors
Edit `graph-utils.js` `getColorByLabel()` function or update CSS variables in `advanced-repograph.css`

### Extending Data Source
Current implementation uses GitHub REST API. To add other sources:
1. Create new fetch function in `github-api.js`
2. Transform data to match node/link structure
3. Call in `handleLoadRepo()`

## Migration from HTML

Original `repograph_enhanced_v1.html` functionality:
- ✅ All D3 rendering preserved
- ✅ All interactions implemented
- ✅ All analytics calculations ported
- ✅ Sample data included
- ✅ GitHub API integration working
- ✅ Responsive design maintained
- ✅ Dark theme preserved

Improvements in React version:
- Better code organization (separation of concerns)
- Reusable utility functions
- Easier to maintain and extend
- Better state management
- Proper dependency tracking
- Performance optimizations

## Next Steps

1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run dev` to start the development server
3. Open browser to `http://localhost:5173`
4. Sample data loads automatically
5. Try loading your own repositories!

## Questions?

For issues or feature requests, refer to the component source files:
- `src/components/advanced-repograph.jsx` - Main logic
- `src/utils/graph-utils.js` - Graph algorithms
- `src/utils/sample-data.js` - Data format examples
